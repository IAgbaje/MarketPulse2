import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response } from 'express';

interface AnalyticsEventRecord {
  id: string;
  ts: number;
  visitorId: string;
  sessionId: string;
  eventType: 'landing_view' | 'page_view' | 'feature_action' | 'session_end';
  screen: string;
  fromScreen?: string;
  action?: string;
  detail?: string;
  region?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  viewport: string;
  referrer: string;
  durationSec?: number;
}

interface AnalyticsStore {
  createdAt: number;
  events: AnalyticsEventRecord[];
}

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const WORKSPACE_ROOT = process.cwd();
const DATA_DIR = path.resolve(WORKSPACE_ROOT, '.data');
const STORE_FILE = path.resolve(DATA_DIR, 'usage-analytics.json');

// Confinement check before any filesystem touch
if (!STORE_FILE.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Analytics store path must stay confined inside .data directory.');
}

const MAX_STORED_EVENTS = 10000;
const ALLOWED_EVENT_TYPES = new Set(['landing_view', 'page_view', 'feature_action', 'session_end']);
const ALLOWED_DEVICES = new Set(['mobile', 'tablet', 'desktop']);

function sanitizeStr(input: unknown, maxLen: number = 80, fallback: string = ''): string {
  if (typeof input !== 'string') return fallback;
  // Strip control characters and angle brackets to prevent injection downstream
  const cleaned = input
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .trim()
    .slice(0, maxLen);
  return cleaned || fallback;
}

function loadStore(): AnalyticsStore {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return { createdAt: Date.now(), events: [] };
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AnalyticsStore>;
    if (Array.isArray(parsed.events)) {
      return {
        createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
        events: parsed.events.slice(-MAX_STORED_EVENTS),
      };
    }
  } catch {
    // Fallback to clean store if corrupted
  }
  return { createdAt: Date.now(), events: [] };
}

let store: AnalyticsStore = loadStore();
let writeTimer: NodeJS.Timeout | null = null;

function persistStoreSoon(): void {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpPath = path.resolve(DATA_DIR, `usage-analytics.${process.pid}.tmp`);
      if (!tmpPath.startsWith(DATA_DIR + path.sep)) return;
      fs.writeFileSync(tmpPath, JSON.stringify(store), 'utf-8');
      fs.renameSync(tmpPath, STORE_FILE);
    } catch {
      // Non-fatal persistence error; keep in-memory store active
    }
  }, 400);
}

function parseEventPayload(body: unknown): AnalyticsEventRecord | null {
  if (!body || typeof body !== 'object') return null;
  const raw = body as Record<string, unknown>;

  const eventType = sanitizeStr(raw.eventType, 32);
  if (!ALLOWED_EVENT_TYPES.has(eventType)) return null;

  const deviceType = sanitizeStr(raw.deviceType, 16, 'desktop');
  const safeDevice = (ALLOWED_DEVICES.has(deviceType) ? deviceType : 'desktop') as
    | 'mobile'
    | 'tablet'
    | 'desktop';

  const visitorId = sanitizeStr(raw.visitorId, 64);
  const sessionId = sanitizeStr(raw.sessionId, 64);
  const screen = sanitizeStr(raw.screen, 48, 'home');
  if (!visitorId || !sessionId) return null;

  const durationSec =
    typeof raw.durationSec === 'number' && Number.isFinite(raw.durationSec)
      ? Math.max(0, Math.min(86400, Math.round(raw.durationSec)))
      : undefined;

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    visitorId,
    sessionId,
    eventType: eventType as AnalyticsEventRecord['eventType'],
    screen,
    fromScreen: sanitizeStr(raw.fromScreen, 48) || undefined,
    action: sanitizeStr(raw.action, 64) || undefined,
    detail: sanitizeStr(raw.detail, 120) || undefined,
    region: sanitizeStr(raw.region, 64) || undefined,
    deviceType: safeDevice,
    browser: sanitizeStr(raw.browser, 48, 'Other'),
    os: sanitizeStr(raw.os, 48, 'Other'),
    viewport: sanitizeStr(raw.viewport, 24, 'unknown'),
    referrer: sanitizeStr(raw.referrer, 120, 'Direct'),
    durationSec,
  };
}

function computeAnalyticsSummary(events: AnalyticsEventRecord[]) {
  const uniqueVisitors = new Set<string>();
  const uniqueSessions = new Set<string>();
  const landingSessions = new Set<string>();
  const convertedLandingSessions = new Set<string>();

  const deviceCounts: Record<'mobile' | 'tablet' | 'desktop', Set<string>> = {
    mobile: new Set(),
    tablet: new Set(),
    desktop: new Set(),
  };
  const browserCounts = new Map<string, number>();
  const osCounts = new Map<string, number>();
  const viewportCounts = new Map<string, number>();
  const screenCounts = new Map<string, number>();
  const transitionCounts = new Map<string, number>();
  const actionCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();
  const dailyTraffic = new Map<string, { views: number; visitors: Set<string>; mobile: number; desktop: number }>();

  let landingViews = 0;
  let totalPageViews = 0;
  let totalFeatureActions = 0;
  const sessionDurations: number[] = [];

  for (const ev of events) {
    uniqueVisitors.add(ev.visitorId);
    uniqueSessions.add(ev.sessionId);
    deviceCounts[ev.deviceType].add(ev.sessionId);

    const dayKey = new Date(ev.ts).toISOString().slice(0, 10);
    if (!dailyTraffic.has(dayKey)) {
      dailyTraffic.set(dayKey, { views: 0, visitors: new Set(), mobile: 0, desktop: 0 });
    }
    const dayBucket = dailyTraffic.get(dayKey)!;
    dayBucket.visitors.add(ev.visitorId);

    if (ev.eventType === 'landing_view') {
      landingViews += 1;
      landingSessions.add(ev.sessionId);
      screenCounts.set('landing', (screenCounts.get('landing') || 0) + 1);
      dayBucket.views += 1;
      if (ev.deviceType === 'mobile') dayBucket.mobile += 1;
      else dayBucket.desktop += 1;
    } else if (ev.eventType === 'page_view') {
      totalPageViews += 1;
      screenCounts.set(ev.screen, (screenCounts.get(ev.screen) || 0) + 1);
      dayBucket.views += 1;
      if (ev.deviceType === 'mobile') dayBucket.mobile += 1;
      else dayBucket.desktop += 1;

      if (ev.screen !== 'landing' && landingSessions.has(ev.sessionId)) {
        convertedLandingSessions.add(ev.sessionId);
      }
      if (ev.fromScreen && ev.fromScreen !== ev.screen) {
        const key = `${ev.fromScreen} -> ${ev.screen}`;
        transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1);
      }
    } else if (ev.eventType === 'feature_action') {
      totalFeatureActions += 1;
      if (ev.action) {
        const label = ev.detail ? `${ev.action}: ${ev.detail}` : ev.action;
        actionCounts.set(label, (actionCounts.get(label) || 0) + 1);
      }
    } else if (ev.eventType === 'session_end' && typeof ev.durationSec === 'number') {
      sessionDurations.push(ev.durationSec);
    }

    if (ev.eventType === 'landing_view' || ev.eventType === 'page_view') {
      browserCounts.set(ev.browser, (browserCounts.get(ev.browser) || 0) + 1);
      osCounts.set(ev.os, (osCounts.get(ev.os) || 0) + 1);
      if (ev.viewport && ev.viewport !== 'unknown') {
        viewportCounts.set(ev.viewport, (viewportCounts.get(ev.viewport) || 0) + 1);
      }
    }

    if (ev.region) {
      regionCounts.set(ev.region, (regionCounts.get(ev.region) || 0) + 1);
    }
  }

  const toTopList = (map: Map<string, number>, limit = 10) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));

  const totalSessions = uniqueSessions.size;
  const mobileSessions = deviceCounts.mobile.size;
  const tabletSessions = deviceCounts.tablet.size;
  const desktopSessions = deviceCounts.desktop.size;
  const deviceTotal = Math.max(1, mobileSessions + tabletSessions + desktopSessions);

  const avgSessionSec = sessionDurations.length
    ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : 0;

  const landingConversionPct = landingSessions.size
    ? Number(((convertedLandingSessions.size / landingSessions.size) * 100).toFixed(1))
    : 0;

  const dailySeries = Array.from(dailyTraffic.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, b]) => ({
      date,
      views: b.views,
      visitors: b.visitors.size,
      mobile: b.mobile,
      desktop: b.desktop,
    }));

  return {
    generatedAt: Date.now(),
    totalEvents: events.length,
    uniqueVisitors: uniqueVisitors.size,
    totalSessions,
    landingViews,
    landingConversionPct,
    totalPageViews: totalPageViews + landingViews,
    totalFeatureActions,
    avgScreensPerSession: totalSessions
      ? Number(((totalPageViews + landingViews) / totalSessions).toFixed(1))
      : 0,
    avgSessionSec,
    devices: {
      mobile: mobileSessions,
      tablet: tabletSessions,
      desktop: desktopSessions,
      mobilePct: Number(((mobileSessions / deviceTotal) * 100).toFixed(1)),
      tabletPct: Number(((tabletSessions / deviceTotal) * 100).toFixed(1)),
      desktopPct: Number(((desktopSessions / deviceTotal) * 100).toFixed(1)),
    },
    browsers: toTopList(browserCounts, 8),
    operatingSystems: toTopList(osCounts, 8),
    viewports: toTopList(viewportCounts, 8),
    topScreens: toTopList(screenCounts, 12),
    topTransitions: toTopList(transitionCounts, 12),
    topActions: toTopList(actionCounts, 12),
    topRegions: toTopList(regionCounts, 10),
    dailySeries,
    recentEvents: events.slice(-30).reverse(),
  };
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use(express.text({ type: 'text/plain', limit: '16kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.post('/api/analytics/event', (req: Request, res: Response) => {
    let payload: unknown = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        res.status(400).json({ error: 'Invalid JSON payload' });
        return;
      }
    }

    const record = parseEventPayload(payload);
    if (!record) {
      res.status(400).json({ error: 'Invalid analytics event fields' });
      return;
    }

    store.events.push(record);
    if (store.events.length > MAX_STORED_EVENTS) {
      store.events = store.events.slice(-MAX_STORED_EVENTS);
    }
    persistStoreSoon();

    res.status(202).json({ ok: true, id: record.id });
  });

  app.get('/api/analytics/summary', (_req: Request, res: Response) => {
    res.json(computeAnalyticsSummary(store.events));
  });

  app.post('/api/analytics/reset', (req: Request, res: Response) => {
    const requestedWith = req.get('x-requested-with');
    const body = req.body as Record<string, unknown> | undefined;
    if (requestedWith !== 'MarketPulse' || body?.confirm !== true) {
      res.status(400).json({ error: 'Explicit reset confirmation required' });
      return;
    }
    store = { createdAt: Date.now(), events: [] };
    persistStoreSoon();
    res.json({ ok: true });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(WORKSPACE_ROOT, 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MarketPulse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MarketPulse server:', err);
  process.exit(1);
});
