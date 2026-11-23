/**
 * MarketPulse Privacy-Respecting Analytics & Google Analytics 4 (GA4) Bridge
 * - Automatically forwards screen views, landing conversions, and feature interactions to Google Analytics 4
 *   when VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) is configured.
 * - Sends write-only anonymized traffic events to /api/analytics/event for the hidden Admin-Only dashboard.
 * - Reading or resetting analytics requires server-verified Admin authentication (never exposed to users).
 */

export type DeviceClass = 'mobile' | 'tablet' | 'desktop';
export type AnalyticsEventType = 'landing_view' | 'page_view' | 'feature_action' | 'session_end';

export interface ClientAnalyticsEvent {
  id: string;
  ts: number;
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
}

export interface AdminAuthStatus {
  configured: boolean;
  authenticated: boolean;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const VISITOR_KEY = 'mp_analytics_visitor_id';
const SESSION_KEY = 'mp_analytics_session_id';
const GA4_ID_PATTERN = /^G-[A-Z0-9]{6,16}$/i;

const sessionStartedAt = Date.now();
let gaInitialized = false;

export function getGaMeasurementId(): string | null {
  try {
    const raw = (import.meta.env?.VITE_GA_MEASUREMENT_ID || '').trim();
    return GA4_ID_PATTERN.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function initGoogleAnalytics(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (gaInitialized) return true;

  const measurementId = getGaMeasurementId();
  if (!measurementId) return false;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
    cookie_flags: 'SameSite=Lax;Secure',
  });

  if (!document.querySelector(`script[data-mp-ga4="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.setAttribute('data-mp-ga4', measurementId);
    document.head.appendChild(script);
  }

  gaInitialized = true;
  return true;
}

function forwardToGa4(eventName: string, params: Record<string, string | number | undefined>): void {
  if (!initGoogleAnalytics() || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // Non-fatal
  }
}

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
    return {
      deviceType: 'desktop',
      browser: 'Other',
      os: 'Other',
      viewport: 'unknown',
      referrer: 'Direct',
    };
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

interface OutboundAnalyticsPayload {
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

function sendPayload(payload: OutboundAnalyticsPayload, useBeacon = false): void {
  if (typeof window === 'undefined') return;
  // Never track views of the hidden admin console itself
  if (payload.screen === 'usage-analytics') return;

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
      // Offline-tolerant; never interrupt user flow
    });
  } catch {
    // Non-fatal
  }
}

export function trackScreenView(params: {
  screen: string;
  fromScreen?: string | null;
  region?: string;
}): void {
  if (params.screen === 'usage-analytics') return;
  const env = detectClientEnvironment();
  const isLanding = params.screen === 'landing';

  forwardToGa4('page_view', {
    page_title: `MarketPulse · ${params.screen}`,
    page_path: `/#/${params.screen}`,
    device_class: env.deviceType,
    nigerian_state: params.region,
    previous_screen: params.fromScreen || undefined,
  });

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

  forwardToGa4(params.action, {
    event_category: 'marketpulse_interaction',
    event_label: params.detail,
    screen_name: params.screen,
    nigerian_state: params.region,
    device_class: env.deviceType,
  });

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

  forwardToGa4('session_duration', {
    screen_name: currentScreen,
    duration_seconds: durationSec,
    device_class: env.deviceType,
    nigerian_state: region,
  });

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

// --- Admin-only API helpers (server-enforced authentication) ---

export async function fetchAdminAuthStatus(): Promise<AdminAuthStatus> {
  try {
    const res = await fetch('/api/admin/status', {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (res.ok) {
      return (await res.json()) as AdminAuthStatus;
    }
  } catch {
    // ignore
  }
  return { configured: false, authenticated: false };
}

export async function loginAdminSession(
  accessCode: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ accessCode }),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error || 'Unable to verify admin access code.' };
  } catch {
    return { ok: false, error: 'Could not reach the server to verify admin credentials.' };
  }
}

export async function logoutAdminSession(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch {
    // ignore
  }
}

export async function fetchAnalyticsSummary(): Promise<{
  status: 'ok' | 'unauthorized' | 'unconfigured' | 'error';
  data?: AnalyticsSummaryResponse;
}> {
  try {
    const res = await fetch('/api/analytics/summary', {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (res.ok) {
      return { status: 'ok', data: (await res.json()) as AnalyticsSummaryResponse };
    }
    if (res.status === 401) return { status: 'unauthorized' };
    if (res.status === 503) return { status: 'unconfigured' };
    return { status: 'error' };
  } catch {
    return { status: 'error' };
  }
}

export async function resetAnalyticsData(): Promise<boolean> {
  try {
    const res = await fetch('/api/analytics/reset', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'MarketPulse',
      },
      body: JSON.stringify({ confirm: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
