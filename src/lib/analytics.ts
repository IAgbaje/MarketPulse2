/**
 * MarketPulse Privacy-Respecting Usage & Navigation Analytics Tracker
 * Tracks landing views, screen transitions, feature interactions, and desktop vs phone browser metrics.
 * Sends to Express /api/analytics/event (with sendBeacon support for mobile browsers) and mirrors locally.
 */

export type DeviceClass = 'mobile' | 'tablet' | 'desktop';
export type AnalyticsEventType = 'landing_view' | 'page_view' | 'feature_action' | 'session_end';

export interface ClientAnalyticsEvent {
  id: string;
  ts: number;
  visitorId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  screen: string;
  fromScreen?: string;
  action?: string;
  detail?: string;
  region?: string;
  deviceType: DeviceClass;
  browser: string;
  os: string;
  viewport: string;
  referrer: string;
  durationSec?: number;
}

export interface AnalyticsSummaryResponse {
  generatedAt: number;
  totalEvents: number;
  uniqueVisitors: number;
  totalSessions: number;
  landingViews: number;
  landingConversionPct: number;
  totalPageViews: number;
  totalFeatureActions: number;
  avgScreensPerSession: number;
  avgSessionSec: number;
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
    mobilePct: number;
    tabletPct: number;
    desktopPct: number;
  };
  browsers: { name: string; count: number }[];
  operatingSystems: { name: string; count: number }[];
  viewports: { name: string; count: number }[];
  topScreens: { name: string; count: number }[];
  topTransitions: { name: string; count: number }[];
  topActions: { name: string; count: number }[];
  topRegions: { name: string; count: number }[];
  dailySeries: { date: string; views: number; visitors: number; mobile: number; desktop: number }[];
  recentEvents: ClientAnalyticsEvent[];
  source?: 'server' | 'local';
}

const VISITOR_KEY = 'mp_analytics_visitor_id';
const SESSION_KEY = 'mp_analytics_session_id';
const LOCAL_LOG_KEY = 'mp_analytics_local_events_v1';
const MAX_LOCAL_EVENTS = 500;

const sessionStartedAt = Date.now();

function randomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId('v');
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return randomId('v');
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = randomId('s');
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return randomId('s');
  }
}

export function detectClientEnvironment(): {
  deviceType: DeviceClass;
  browser: string;
  os: string;
  viewport: string;
  referrer: string;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { deviceType: 'desktop', browser: 'Other', os: 'Other', viewport: 'unknown', referrer: 'Direct' };
  }

  const ua = navigator.userAgent || '';
  const width = window.innerWidth || 0;
  const height = window.innerHeight || 0;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let deviceType: DeviceClass = 'desktop';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (hasTouch && width >= 640 && width < 1024)) {
    deviceType = 'tablet';
  } else if (/Mobi|Android|iPhone|iPod|Opera Mini|IEMobile/i.test(ua) || width < 640) {
    deviceType = 'mobile';
  }

  let os = 'Other';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Other';
  if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/OPR|Opera|Opera Mini/i.test(ua)) browser = 'Opera';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/CriOS/i.test(ua)) browser = 'Chrome (iOS)';
  else if (/FxiOS|Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = deviceType === 'mobile' ? 'Chrome Mobile' : 'Chrome Desktop';
  } else if (/Safari/i.test(ua)) {
    browser = deviceType === 'mobile' ? 'Mobile Safari' : 'Safari Desktop';
  }

  let referrer = 'Direct';
  try {
    if (document.referrer) {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin !== window.location.origin) {
        referrer = refUrl.hostname;
      }
    }
  } catch {
    referrer = 'Direct';
  }

  return {
    deviceType,
    browser,
    os,
    viewport: width && height ? `${width}x${height}` : 'unknown',
    referrer,
  };
}

function appendLocalEvent(ev: ClientAnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_LOG_KEY);
    const list: ClientAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    list.push(ev);
    localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(list.slice(-MAX_LOCAL_EVENTS)));
  } catch {
    // Ignore quota errors
  }
}

function sendPayload(payload: Omit<ClientAnalyticsEvent, 'id' | 'ts'>, useBeacon = false): void {
  if (typeof window === 'undefined') return;

  const fullEvent: ClientAnalyticsEvent = {
    ...payload,
    id: randomId('ev'),
    ts: Date.now(),
  };
  appendLocalEvent(fullEvent);

  const bodyStr = JSON.stringify(payload);
  try {
    if (useBeacon && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([bodyStr], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/event', blob);
      return;
    }
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
      keepalive: true,
    }).catch(() => {
      // Offline-tolerant; already mirrored locally
    });
  } catch {
    // Never interrupt user flow on telemetry failure
  }
}

export function trackScreenView(params: {
  screen: string;
  fromScreen?: string | null;
  region?: string;
}): void {
  const env = detectClientEnvironment();
  const isLanding = params.screen === 'landing';
  sendPayload({
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    eventType: isLanding ? 'landing_view' : 'page_view',
    screen: params.screen,
    fromScreen: params.fromScreen || undefined,
    region: params.region,
    ...env,
  });
}

export function trackFeatureAction(params: {
  action: string;
  detail?: string;
  screen: string;
  region?: string;
}): void {
  const env = detectClientEnvironment();
  sendPayload({
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    eventType: 'feature_action',
    screen: params.screen,
    action: params.action,
    detail: params.detail,
    region: params.region,
    ...env,
  });
}

export function trackSessionEnd(currentScreen: string, region?: string): void {
  const env = detectClientEnvironment();
  const durationSec = Math.max(1, Math.round((Date.now() - sessionStartedAt) / 1000));
  sendPayload(
    {
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      eventType: 'session_end',
      screen: currentScreen,
      region,
      durationSec,
      ...env,
    },
    true
  );
}

function buildLocalFallbackSummary(): AnalyticsSummaryResponse {
  let events: ClientAnalyticsEvent[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_LOG_KEY);
    events = raw ? JSON.parse(raw) : [];
  } catch {
    events = [];
  }

  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const landingSessions = new Set<string>();
  const converted = new Set<string>();
  const devSets = { mobile: new Set<string>(), tablet: new Set<string>(), desktop: new Set<string>() };
  const browsers = new Map<string, number>();
  const osMap = new Map<string, number>();
  const viewports = new Map<string, number>();
  const screens = new Map<string, number>();
  const transitions = new Map<string, number>();
  const actions = new Map<string, number>();
  const regions = new Map<string, number>();
  const daily = new Map<string, { views: number; visitors: Set<string>; mobile: number; desktop: number }>();

  let landingViews = 0;
  let pageViews = 0;
  let featureActions = 0;

  for (const ev of events) {
    visitors.add(ev.visitorId);
    sessions.add(ev.sessionId);
    devSets[ev.deviceType].add(ev.sessionId);

    const dayKey = new Date(ev.ts).toISOString().slice(0, 10);
    if (!daily.has(dayKey)) {
      daily.set(dayKey, { views: 0, visitors: new Set(), mobile: 0, desktop: 0 });
    }
    const d = daily.get(dayKey)!;
    d.visitors.add(ev.visitorId);

    if (ev.eventType === 'landing_view') {
      landingViews++;
      landingSessions.add(ev.sessionId);
      screens.set('landing', (screens.get('landing') || 0) + 1);
      d.views++;
      if (ev.deviceType === 'mobile') d.mobile++;
      else d.desktop++;
    } else if (ev.eventType === 'page_view') {
      pageViews++;
      screens.set(ev.screen, (screens.get(ev.screen) || 0) + 1);
      d.views++;
      if (ev.deviceType === 'mobile') d.mobile++;
      else d.desktop++;
      if (ev.screen !== 'landing' && landingSessions.has(ev.sessionId)) converted.add(ev.sessionId);
      if (ev.fromScreen && ev.fromScreen !== ev.screen) {
        const k = `${ev.fromScreen} -> ${ev.screen}`;
        transitions.set(k, (transitions.get(k) || 0) + 1);
      }
    } else if (ev.eventType === 'feature_action' && ev.action) {
      featureActions++;
      const lbl = ev.detail ? `${ev.action}: ${ev.detail}` : ev.action;
      actions.set(lbl, (actions.get(lbl) || 0) + 1);
    }

    if (ev.eventType === 'landing_view' || ev.eventType === 'page_view') {
      browsers.set(ev.browser, (browsers.get(ev.browser) || 0) + 1);
      osMap.set(ev.os, (osMap.get(ev.os) || 0) + 1);
      if (ev.viewport) viewports.set(ev.viewport, (viewports.get(ev.viewport) || 0) + 1);
    }
    if (ev.region) regions.set(ev.region, (regions.get(ev.region) || 0) + 1);
  }

  const top = (m: Map<string, number>, n = 10) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count }));

  const devTotal = Math.max(1, devSets.mobile.size + devSets.tablet.size + devSets.desktop.size);

  return {
    generatedAt: Date.now(),
    totalEvents: events.length,
    uniqueVisitors: visitors.size,
    totalSessions: sessions.size,
    landingViews,
    landingConversionPct: landingSessions.size
      ? Number(((converted.size / landingSessions.size) * 100).toFixed(1))
      : 0,
    totalPageViews: landingViews + pageViews,
    totalFeatureActions: featureActions,
    avgScreensPerSession: sessions.size
      ? Number(((landingViews + pageViews) / sessions.size).toFixed(1))
      : 0,
    avgSessionSec: Math.round((Date.now() - sessionStartedAt) / 1000),
    devices: {
      mobile: devSets.mobile.size,
      tablet: devSets.tablet.size,
      desktop: devSets.desktop.size,
      mobilePct: Number(((devSets.mobile.size / devTotal) * 100).toFixed(1)),
      tabletPct: Number(((devSets.tablet.size / devTotal) * 100).toFixed(1)),
      desktopPct: Number(((devSets.desktop.size / devTotal) * 100).toFixed(1)),
    },
    browsers: top(browsers, 8),
    operatingSystems: top(osMap, 8),
    viewports: top(viewports, 8),
    topScreens: top(screens, 12),
    topTransitions: top(transitions, 12),
    topActions: top(actions, 12),
    topRegions: top(regions, 10),
    dailySeries: Array.from(daily.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, b]) => ({
        date,
        views: b.views,
        visitors: b.visitors.size,
        mobile: b.mobile,
        desktop: b.desktop,
      })),
    recentEvents: events.slice(-30).reverse(),
    source: 'local',
  };
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryResponse> {
  try {
    const res = await fetch('/api/analytics/summary', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as AnalyticsSummaryResponse;
      return { ...data, source: 'server' };
    }
  } catch {
    // Fallback to local mirror
  }
  return buildLocalFallbackSummary();
}

export async function resetAnalyticsData(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_LOG_KEY);
  } catch {
    // ignore
  }
  try {
    await fetch('/api/analytics/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'MarketPulse',
      },
      body: JSON.stringify({ confirm: true }),
    });
  } catch {
    // ignore
  }
}
