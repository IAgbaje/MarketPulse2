import React, { useCallback, useEffect, useState } from 'react';
import {
  AnalyticsSummaryResponse,
  fetchAdminAuthStatus,
  fetchAnalyticsSummary,
  getGaMeasurementId,
  loginAdminSession,
  logoutAdminSession,
  resetAnalyticsData,
} from '../lib/analytics';
import { buildCsvDocument } from '../lib/csv';
import { useMarketPulse } from '../context/MarketPulseContext';
import { useToast } from '../context/ToastContext';

const SCREEN_LABELS: Record<string, string> = {
  landing: 'Landing Page',
  home: 'Home Dashboard',
  'price-map': 'Live Price Map',
  'commodity-detail': 'Food Prices & NBS/CBN',
  history: 'My Market Trips',
  'trip-detail': 'Trip Receipt',
  budget: 'Food Budget',
  'set-budget': 'Set Budget',
  'weekly-report': 'Weekly Summary',
  'log-choice': 'Record Market Run',
  'log-scan': 'Snap Receipt',
  'log-confirm': 'Confirm Bag',
  'log-success': 'Saved Trip',
  'data-management': 'Export & Data',
  'data-mgmt': 'Export & Data',
  'account-security': 'Keep Records Safe',
  'usage-analytics': 'Admin Insights',
};

function formatScreenName(key: string): string {
  return SCREEN_LABELS[key] || key;
}

function formatTransition(raw: string): string {
  const parts = raw.split(' -> ');
  if (parts.length !== 2) return raw;
  return `${formatScreenName(parts[0])} → ${formatScreenName(parts[1])}`;
}

function formatTimeAgo(ts: number): string {
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

type GateState = 'checking' | 'unconfigured' | 'locked' | 'authorized';

export const UsageAnalyticsScreen: React.FC = () => {
  const { navigateTo } = useMarketPulse();
  const { showToast } = useToast();

  const [gateState, setGateState] = useState<GateState>('checking');
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const gaMeasurementId = getGaMeasurementId();

  const loadAuthorizedSummary = useCallback(async () => {
    setLoading(true);
    const res = await fetchAnalyticsSummary();
    if (res.status === 'ok' && res.data) {
      setSummary(res.data);
      setGateState('authorized');
    } else if (res.status === 'unconfigured') {
      setSummary(null);
      setGateState('unconfigured');
    } else {
      setSummary(null);
      setGateState('locked');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const status = await fetchAdminAuthStatus();
      if (!active) return;
      if (!status.configured) {
        setGateState('unconfigured');
        return;
      }
      if (!status.authenticated) {
        setGateState('locked');
        return;
      }
      await loadAuthorizedSummary();
    })();
    return () => {
      active = false;
    };
  }, [loadAuthorizedSummary]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!accessCode.trim()) {
      setAuthError('Enter the admin access code.');
      return;
    }
    setSubmitting(true);
    const res = await loginAdminSession(accessCode);
    setSubmitting(false);
    if (!res.ok) {
      setAuthError(res.error || 'Access denied.');
      return;
    }
    setAccessCode('');
    await loadAuthorizedSummary();
  };

  const handleAdminLogout = async () => {
    await logoutAdminSession();
    setSummary(null);
    setGateState('locked');
    showToast({ message: 'Signed out of Admin Insights', tone: 'info' });
  };

  const handleExportCsv = () => {
    if (!summary) return;
    const headers = [
      'Timestamp',
      'EventType',
      'Screen',
      'FromScreen',
      'Action',
      'Detail',
      'Device',
      'Browser',
      'OS',
      'Viewport',
      'State',
    ];
    const rows = summary.recentEvents.map((ev) => [
      new Date(ev.ts).toISOString(),
      ev.eventType,
      ev.screen,
      ev.fromScreen || '',
      ev.action || '',
      ev.detail || '',
      ev.deviceType,
      ev.browser,
      ev.os,
      ev.viewport,
      ev.region || '',
    ]);
    const csv = buildCsvDocument(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketpulse-usage-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ message: 'Usage analytics CSV downloaded', tone: 'success' });
  };

  const handleReset = async () => {
    const ok = await resetAnalyticsData();
    setConfirmReset(false);
    if (ok) {
      await loadAuthorizedSummary();
      showToast({ message: 'Usage counter reset cleanly', tone: 'info' });
    } else {
      showToast({ message: 'Admin authorization required to reset analytics', tone: 'warning' });
    }
  };

  if (gateState === 'checking') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 pt-24 pb-24">
        <div className="bg-white rounded-2xl p-8 border border-black/[0.06] text-center text-sm text-[#6e6e73]">
          Verifying admin session...
        </div>
      </div>
    );
  }

  // Strictly locked gate for non-admin visitors
  if (gateState === 'locked' || gateState === 'unconfigured') {
    return (
      <div className="w-full max-w-md mx-auto px-4 pt-24 lg:pt-28 pb-24">
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.07] shadow-xs space-y-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#00567c]/10 text-[#00567c] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-[#1d1d1f] tracking-tight">
                Admin Access Only
              </h1>
              <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                Platform usage insights are restricted to administrators and hidden from regular
                shoppers.
              </p>
            </div>
          </div>

          {/* Google Analytics 4 Connection Indicator */}
          <div className="rounded-xl bg-[#f5f5f7] border border-black/[0.05] p-3.5 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#1d1d1f]">Google Analytics 4 (GA4)</span>
              <span
                className={`font-semibold ${
                  gaMeasurementId ? 'text-[#15803d]' : 'text-[#6e6e73]'
                }`}
              >
                {gaMeasurementId ? `Connected (${gaMeasurementId})` : 'Not configured'}
              </span>
            </div>
            <p className="text-[#6e6e73] leading-relaxed">
              {gaMeasurementId
                ? 'Traffic, landing conversions, and feature usage are streaming privately to your Google Analytics 4 console.'
                : 'Set VITE_GA_MEASUREMENT_ID in environment secrets to send all usage analytics directly to Google Analytics 4.'}
            </p>
          </div>

          {gateState === 'locked' ? (
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-access-code"
                  className="block text-xs font-semibold text-[#1d1d1f]"
                >
                  Admin Access Code
                </label>
                <input
                  id="admin-access-code"
                  type="password"
                  autoComplete="current-password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter server admin passcode"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f5f5f7] border border-black/[0.08] text-sm text-[#1d1d1f] outline-none focus:border-[#00567c] focus:bg-white transition-colors"
                />
              </div>
              {authError && (
                <p className="text-xs font-medium text-[#b91c1c]">{authError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00567c] hover:bg-[#004361] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {submitting ? 'Verifying...' : 'Unlock Admin Insights'}
              </button>
            </form>
          ) : (
            <div className="rounded-xl bg-[#eef6fb] border border-[#00567c]/15 p-3.5 text-xs text-[#003852] leading-relaxed">
              Built-in Admin Insights is locked until{' '}
              <code className="font-mono-num font-semibold">ADMIN_ACCESS_CODE</code> is set in your
              server secrets. All public visitors remain blocked from viewing usage data.
            </div>
          )}

          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-full min-h-[42px] px-4 py-2 rounded-xl border border-black/[0.08] bg-white hover:bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] transition-colors"
          >
            Return to MarketPulse
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const topScreenMax = Math.max(1, summary.topScreens[0]?.count || 1);
  const topTransitionMax = Math.max(1, summary.topTransitions[0]?.count || 1);
  const topActionMax = Math.max(1, summary.topActions[0]?.count || 1);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-24 lg:pb-14 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Admin Visitor &amp; Usage Insights
          </h1>
          <p className="text-sm text-[#6e6e73]">
            Private admin-only traffic across desktop &amp; phone browsers ·{' '}
            <span className="font-semibold text-[#1d1d1f]">
              {gaMeasurementId ? `GA4 Connected (${gaMeasurementId})` : 'Live Server Log'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadAuthorizedSummary}
            disabled={loading}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] hover:bg-[#f2f2f7] text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#00567c] hover:bg-[#004361] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] hover:border-[#b91c1c]/40 hover:text-[#b91c1c] text-xs font-semibold text-[#6e6e73] transition-colors"
            >
              Reset
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-2.5 py-1.5">
              <span className="text-xs font-semibold text-[#b91c1c]">Clear logs?</span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg bg-[#b91c1c] text-white text-xs font-semibold"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-xs font-semibold text-[#6e6e73]"
              >
                Cancel
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleAdminLogout}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] hover:bg-[#f2f2f7] text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Top 4 KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
          <div className="text-xs font-medium text-[#6e6e73]">Unique Visitors</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] mt-1">
            {summary.uniqueVisitors.toLocaleString('en-NG')}
          </div>
          <div className="text-xs text-[#6e6e73] mt-1 font-mono-num">
            {summary.totalSessions.toLocaleString('en-NG')} total sessions
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
          <div className="text-xs font-medium text-[#6e6e73]">Landing Page Views</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#00567c] mt-1">
            {summary.landingViews.toLocaleString('en-NG')}
          </div>
          <div className="text-xs text-[#15803d] font-semibold mt-1 font-mono-num">
            {summary.landingConversionPct}% entered the app
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
          <div className="text-xs font-medium text-[#6e6e73]">Total Screen Views</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] mt-1">
            {summary.totalPageViews.toLocaleString('en-NG')}
          </div>
          <div className="text-xs text-[#6e6e73] mt-1 font-mono-num">
            {summary.avgScreensPerSession} screens / visit · {summary.totalFeatureActions} actions
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
          <div className="text-xs font-medium text-[#6e6e73]">Phone Browser Share</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] mt-1">
            {summary.devices.mobilePct}%
          </div>
          <div className="text-xs text-[#6e6e73] mt-1 font-mono-num">
            Desktop {summary.devices.desktopPct}% · Tablet {summary.devices.tabletPct}%
          </div>
        </div>
      </section>

      {/* Device Breakdown + Top Screens / Transitions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Desktop vs Phone Browsers, Browsers & OS, Screen Widths */}
        <section className="lg:col-span-5 bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-5">
          <div>
            <h2 className="font-display text-base font-bold text-[#1d1d1f]">
              Desktop vs Phone Browsers
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Device sessions, browsers, OS, and viewport widths recorded
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-full h-3 rounded-full bg-[#f2f2f7] overflow-hidden flex">
              <div
                style={{ width: `${summary.devices.mobilePct}%` }}
                className="bg-[#00567c] h-full transition-all"
                title={`Phone: ${summary.devices.mobilePct}%`}
              />
              <div
                style={{ width: `${summary.devices.desktopPct}%` }}
                className="bg-[#0f766e] h-full transition-all"
                title={`Desktop: ${summary.devices.desktopPct}%`}
              />
              <div
                style={{ width: `${summary.devices.tabletPct}%` }}
                className="bg-[#b45309] h-full transition-all"
                title={`Tablet: ${summary.devices.tabletPct}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#f5f5f7]">
                <div className="text-[#6e6e73]">Phone</div>
                <div className="font-mono-num font-bold text-[#00567c] text-sm mt-0.5">
                  {summary.devices.mobile} ({summary.devices.mobilePct}%)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f5f7]">
                <div className="text-[#6e6e73]">Desktop</div>
                <div className="font-mono-num font-bold text-[#0f766e] text-sm mt-0.5">
                  {summary.devices.desktop} ({summary.devices.desktopPct}%)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f5f7]">
                <div className="text-[#6e6e73]">Tablet</div>
                <div className="font-mono-num font-bold text-[#b45309] text-sm mt-0.5">
                  {summary.devices.tablet} ({summary.devices.tabletPct}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-black/[0.06]">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Top Browsers</h3>
              {summary.browsers.length > 0 ? (
                <div className="space-y-1.5">
                  {summary.browsers.slice(0, 5).map((b) => (
                    <div key={b.name} className="flex justify-between text-xs">
                      <span className="text-[#1d1d1f] truncate pr-2">{b.name}</span>
                      <span className="font-mono-num font-semibold text-[#00567c]">{b.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">No browser hits yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Operating Systems</h3>
              {summary.operatingSystems.length > 0 ? (
                <div className="space-y-1.5">
                  {summary.operatingSystems.slice(0, 5).map((os) => (
                    <div key={os.name} className="flex justify-between text-xs">
                      <span className="text-[#1d1d1f] truncate pr-2">{os.name}</span>
                      <span className="font-mono-num font-semibold text-[#00567c]">{os.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">No OS hits yet.</p>
              )}
            </div>
          </div>

          {summary.viewports.length > 0 && (
            <div className="pt-3 border-t border-black/[0.06] space-y-2">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Active Screen Sizes</h3>
              <div className="flex flex-wrap gap-1.5">
                {summary.viewports.slice(0, 6).map((v) => (
                  <span
                    key={v.name}
                    className="px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[11px] font-mono-num text-[#3a3a3c] border border-black/[0.05]"
                  >
                    {v.name} ({v.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right: Where Visitors Navigate & Feature Usage */}
        <section className="lg:col-span-7 bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#1d1d1f]">
                  Where Visitors Go
                </h2>
                <p className="text-xs text-[#6e6e73]">Page views by screen</p>
              </div>
              {summary.topScreens.length > 0 ? (
                <div className="space-y-2.5">
                  {summary.topScreens.slice(0, 7).map((item) => {
                    const pct = Math.max(6, Math.round((item.count / topScreenMax) * 100));
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#1d1d1f] truncate pr-2">
                            {formatScreenName(item.name)}
                          </span>
                          <span className="font-mono-num font-semibold text-[#00567c]">
                            {item.count}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#f2f2f7] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00567c] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">No screen visits yet.</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#1d1d1f]">
                  Top Navigation Paths
                </h2>
                <p className="text-xs text-[#6e6e73]">How users move from screen to screen</p>
              </div>
              {summary.topTransitions.length > 0 ? (
                <div className="space-y-2.5">
                  {summary.topTransitions.slice(0, 7).map((item) => {
                    const pct = Math.max(6, Math.round((item.count / topTransitionMax) * 100));
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#1d1d1f] truncate pr-2">
                            {formatTransition(item.name)}
                          </span>
                          <span className="font-mono-num font-semibold text-[#0f766e]">
                            {item.count}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#f2f2f7] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0f766e] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">
                  Navigation paths appear as visitors move between screens.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.06] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Top Feature Interactions</h3>
              {summary.topActions.length > 0 ? (
                <div className="space-y-2">
                  {summary.topActions.slice(0, 6).map((act) => {
                    const pct = Math.max(6, Math.round((act.count / topActionMax) * 100));
                    return (
                      <div key={act.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#1d1d1f] truncate pr-2">{act.name}</span>
                          <span className="font-mono-num font-semibold text-[#1d1d1f]">
                            {act.count}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#f2f2f7] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3a3a3c] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">
                  Interactions like switching states, inspecting staples, or saving budgets appear
                  here.
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-[#6e6e73]">States Being Checked</h3>
              {summary.topRegions.length > 0 ? (
                <div className="space-y-1.5">
                  {summary.topRegions.slice(0, 6).map((reg) => (
                    <div key={reg.name} className="flex justify-between text-xs py-0.5">
                      <span className="text-[#1d1d1f] truncate pr-2">{reg.name}</span>
                      <span className="font-mono-num font-semibold text-[#00567c]">
                        {reg.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">No regional selections recorded yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Live Recent Activity Stream */}
      <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-[#1d1d1f]">
              Recent Visitor Activity
            </h2>
            <p className="text-xs text-[#6e6e73]">
              Latest 30 anonymized visits and interactions (no names, emails, or visitor IDs exposed)
            </p>
          </div>
          <span className="text-xs font-mono-num text-[#6e6e73]">
            {summary.totalEvents.toLocaleString('en-NG')} total events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f5f7] text-[#6e6e73] border-b border-black/[0.06]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">When</th>
                <th className="py-2.5 px-4 font-semibold">Event / Journey</th>
                <th className="py-2.5 px-4 font-semibold">Device &amp; Browser</th>
                <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">Viewport</th>
                <th className="py-2.5 px-4 font-semibold hidden md:table-cell">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {summary.recentEvents.length > 0 ? (
                summary.recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#f5f5f7]/60">
                    <td className="py-2.5 px-4 font-mono-num text-[#6e6e73] whitespace-nowrap">
                      {formatTimeAgo(ev.ts)}
                    </td>
                    <td className="py-2.5 px-4 text-[#1d1d1f]">
                      {ev.eventType === 'feature_action' ? (
                        <span>
                          <strong className="font-semibold text-[#00567c]">{ev.action}</strong>
                          {ev.detail ? ` · ${ev.detail}` : ''}
                        </span>
                      ) : ev.eventType === 'landing_view' ? (
                        <span className="font-semibold text-[#00567c]">Landed on Landing Page</span>
                      ) : ev.fromScreen && ev.fromScreen !== ev.screen ? (
                        <span>
                          {formatScreenName(ev.fromScreen)} →{' '}
                          <strong className="font-semibold">{formatScreenName(ev.screen)}</strong>
                        </span>
                      ) : (
                        <span className="font-semibold">{formatScreenName(ev.screen)}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-[#3a3a3c]">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#00567c]">
                          {ev.deviceType === 'mobile'
                            ? 'smartphone'
                            : ev.deviceType === 'tablet'
                            ? 'tablet'
                            : 'laptop_mac'}
                        </span>
                        <span>
                          {ev.browser} · {ev.os}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono-num text-[#6e6e73] hidden sm:table-cell whitespace-nowrap">
                      {ev.viewport}
                    </td>
                    <td className="py-2.5 px-4 text-[#6e6e73] hidden md:table-cell whitespace-nowrap">
                      {ev.region || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#86868b]">
                    No traffic recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
