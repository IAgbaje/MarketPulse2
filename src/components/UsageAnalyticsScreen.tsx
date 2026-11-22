import React, { useCallback, useEffect, useState } from 'react';
import {
  AnalyticsSummaryResponse,
  fetchAnalyticsSummary,
  resetAnalyticsData,
} from '../lib/analytics';
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
  'usage-analytics': 'Usage Analytics',
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

export const UsageAnalyticsScreen: React.FC = () => {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchAnalyticsSummary();
    setSummary(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = () => {
    if (!summary) return;
    const header = [
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
    ].join(',');
    const rows = summary.recentEvents.map((ev) =>
      [
        new Date(ev.ts).toISOString(),
        ev.eventType,
        ev.screen,
        ev.fromScreen || '',
        ev.action || '',
        (ev.detail || '').replace(/,/g, ';'),
        ev.deviceType,
        ev.browser,
        ev.os,
        ev.viewport,
        (ev.region || '').replace(/,/g, ';'),
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
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
    await resetAnalyticsData();
    setConfirmReset(false);
    await loadData();
    showToast({ message: 'Usage counter reset cleanly', tone: 'info' });
  };

  if (loading && !summary) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-24">
        <div className="bg-white rounded-2xl p-8 border border-black/[0.06] text-center text-sm text-[#6e6e73]">
          Loading visitor &amp; usage analytics...
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const maxScreenCount = Math.max(1, ...summary.topScreens.map((s) => s.count));
  const maxTransitionCount = Math.max(1, ...summary.topTransitions.map((t) => t.count));

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-[72px] lg:pt-24 pb-24 lg:pb-14 space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Visitor &amp; Usage Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#6e6e73] mt-0.5">
            Real-time anonymized traffic across desktop &amp; phone browsers · Storage:{' '}
            <strong className="text-[#1d1d1f]">
              {summary.source === 'server' ? 'Live Server Log' : 'Local Browser Mirror'}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-white border border-black/[0.08] hover:bg-[#f2f2f7] text-xs font-semibold text-[#1d1d1f] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#00567c] hover:bg-[#004361] text-xs font-semibold text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-white border border-black/[0.08] hover:bg-[#fef2f2] hover:text-[#b91c1c] text-xs font-semibold text-[#6e6e73] transition-colors"
            >
              <span>Reset</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-[#fef2f2] border border-[#b91c1c]/25 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-semibold text-[#b91c1c]">Clear logs?</span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg bg-[#b91c1c] text-white text-xs font-semibold"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-[#48484a]"
              >
                No
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1">
          <div className="text-xs font-medium text-[#6e6e73]">Unique Visitors</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
            {summary.uniqueVisitors.toLocaleString('en-NG')}
          </div>
          <div className="text-xs text-[#6e6e73]">
            {summary.totalSessions} total sessions
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1">
          <div className="text-xs font-medium text-[#6e6e73]">Landing Page Views</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#00567c]">
            {summary.landingViews.toLocaleString('en-NG')}
          </div>
          <div className="text-xs text-[#15803d] font-medium">
            {summary.landingConversionPct}% entered the app
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1">
          <div className="text-xs font-medium text-[#6e6e73]">Total Screen Views</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
            {summary.totalPageViews.toLocaleString('en-NG')}
          </div>
          <div className="text-xs text-[#6e6e73]">
            {summary.avgScreensPerSession} screens / visit · {summary.totalFeatureActions} actions
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1">
          <div className="text-xs font-medium text-[#6e6e73]">Phone Browser Share</div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
            {summary.devices.mobilePct}%
          </div>
          <div className="text-xs text-[#6e6e73]">
            Desktop {summary.devices.desktopPct}% · Tablet {summary.devices.tabletPct}%
          </div>
        </div>
      </div>

      {/* Desktop vs Mobile Device Split + Browsers & Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-5 bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#1d1d1f]">
              Desktop vs Phone Browsers
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Device sessions, browsers, OS, and viewport widths recorded
            </p>
          </div>

          {/* Stacked Device Distribution Bar */}
          <div className="space-y-2">
            <div className="w-full h-3.5 rounded-full bg-[#f2f2f7] overflow-hidden flex">
              <div
                style={{ width: `${summary.devices.mobilePct}%` }}
                className="bg-[#00567c] h-full transition-all"
                title={`Mobile Phone: ${summary.devices.mobilePct}%`}
              />
              <div
                style={{ width: `${summary.devices.desktopPct}%` }}
                className="bg-[#0f766e] h-full transition-all"
                title={`Desktop: ${summary.devices.desktopPct}%`}
              />
              <div
                style={{ width: `${summary.devices.tabletPct}%` }}
                className="bg-[#d97706] h-full transition-all"
                title={`Tablet: ${summary.devices.tabletPct}%`}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono-num pt-1">
              <div className="p-2.5 rounded-xl bg-[#f5f5f7]">
                <div className="font-sans text-[11px] text-[#6e6e73]">Phone</div>
                <div className="font-bold text-[#00567c] text-sm mt-0.5">
                  {summary.devices.mobile} ({summary.devices.mobilePct}%)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f5f7]">
                <div className="font-sans text-[11px] text-[#6e6e73]">Desktop</div>
                <div className="font-bold text-[#0f766e] text-sm mt-0.5">
                  {summary.devices.desktop} ({summary.devices.desktopPct}%)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f5f7]">
                <div className="font-sans text-[11px] text-[#6e6e73]">Tablet</div>
                <div className="font-bold text-[#b45309] text-sm mt-0.5">
                  {summary.devices.tablet} ({summary.devices.tabletPct}%)
                </div>
              </div>
            </div>
          </div>

          {/* Browsers & OS side by side */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/[0.06]">
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Top Browsers</h3>
              {summary.browsers.length === 0 ? (
                <p className="text-xs text-[#86868b]">No views yet</p>
              ) : (
                summary.browsers.map((b) => (
                  <div key={b.name} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[#1d1d1f] truncate">{b.name}</span>
                    <span className="font-mono-num font-bold text-[#00567c]">{b.count}</span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Operating Systems</h3>
              {summary.operatingSystems.length === 0 ? (
                <p className="text-xs text-[#86868b]">No views yet</p>
              ) : (
                summary.operatingSystems.map((o) => (
                  <div key={o.name} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[#1d1d1f] truncate">{o.name}</span>
                    <span className="font-mono-num font-bold text-[#1d1d1f]">{o.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recorded Screen Viewports */}
          {summary.viewports.length > 0 && (
            <div className="pt-2 border-t border-black/[0.06]">
              <h3 className="text-xs font-semibold text-[#6e6e73] mb-1.5">Active Screen Sizes</h3>
              <div className="flex flex-wrap gap-2 text-xs font-mono-num text-[#48484a]">
                {summary.viewports.slice(0, 6).map((vp) => (
                  <span key={vp.name} className="bg-[#f5f5f7] px-2.5 py-1 rounded-lg">
                    {vp.name} ({vp.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Navigation Journeys & Top Screens */}
        <section className="lg:col-span-7 bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Visited Screens */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display font-bold text-base text-[#1d1d1f]">
                  Where Visitors Go
                </h2>
                <p className="text-xs text-[#6e6e73]">Page views by screen</p>
              </div>
              <div className="space-y-2.5">
                {summary.topScreens.length === 0 ? (
                  <p className="text-xs text-[#86868b]">Navigate around the app to see counts.</p>
                ) : (
                  summary.topScreens.slice(0, 8).map((s) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#1d1d1f] truncate">
                          {formatScreenName(s.name)}
                        </span>
                        <span className="font-mono-num font-bold text-[#00567c]">{s.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f2f2f7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00567c] rounded-full"
                          style={{ width: `${Math.max(8, (s.count / maxScreenCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Navigation Flows */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display font-bold text-base text-[#1d1d1f]">
                  Top Navigation Paths
                </h2>
                <p className="text-xs text-[#6e6e73]">How users move from screen to screen</p>
              </div>
              <div className="space-y-2.5">
                {summary.topTransitions.length === 0 ? (
                  <p className="text-xs text-[#86868b]">
                    Transitions will appear as users move between pages.
                  </p>
                ) : (
                  summary.topTransitions.slice(0, 8).map((t) => (
                    <div key={t.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-medium text-[#1d1d1f] truncate">
                          {formatTransition(t.name)}
                        </span>
                        <span className="font-mono-num font-bold text-[#0f766e] shrink-0">
                          {t.count}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f2f2f7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0f766e] rounded-full"
                          style={{
                            width: `${Math.max(8, (t.count / maxTransitionCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Feature Actions & Nigerian States Checked */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/[0.06]">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6e6e73]">Top Feature Interactions</h3>
              {summary.topActions.length === 0 ? (
                <p className="text-xs text-[#86868b]">
                  Interactions like switching states, inspecting staples, or logging trips appear
                  here.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {summary.topActions.slice(0, 6).map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-[#1d1d1f] truncate">{a.name}</span>
                      <span className="font-mono-num font-bold text-[#1d1d1f] shrink-0">
                        {a.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6e6e73]">States Being Checked</h3>
              {summary.topRegions.length === 0 ? (
                <p className="text-xs text-[#86868b]">State traffic appears as visitors browse.</p>
              ) : (
                <div className="space-y-1.5">
                  {summary.topRegions.slice(0, 6).map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-[#1d1d1f] truncate">{r.name}</span>
                      <span className="font-mono-num font-bold text-[#00567c] shrink-0">
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Live Recent Activity Feed */}
      <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-black/[0.06] flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-[#1d1d1f]">
              Recent Visitor Activity
            </h2>
            <p className="text-xs text-[#6e6e73]">
              Latest 30 anonymized visits and interactions (no names, emails, or IP addresses stored)
            </p>
          </div>
          <span className="text-xs font-mono-num text-[#6e6e73]">
            {summary.totalEvents} total events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f7] text-[11px] font-semibold text-[#6e6e73] border-b border-black/[0.06]">
                <th className="py-2.5 px-4 sm:px-5 whitespace-nowrap">When</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Event / Journey</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Device &amp; Browser</th>
                <th className="py-2.5 px-3 whitespace-nowrap hidden sm:table-cell">Viewport</th>
                <th className="py-2.5 px-4 sm:px-5 whitespace-nowrap hidden md:table-cell">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] text-xs">
              {summary.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6e6e73]">
                    No usage events recorded yet.
                  </td>
                </tr>
              ) : (
                summary.recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#f5f5f7]/60">
                    <td className="py-2.5 px-4 sm:px-5 font-mono-num text-[#6e6e73] whitespace-nowrap">
                      {formatTimeAgo(ev.ts)}
                    </td>
                    <td className="py-2.5 px-3 text-[#1d1d1f]">
                      <div className="font-semibold">
                        {ev.eventType === 'landing_view'
                          ? 'Landed on Landing Page'
                          : ev.eventType === 'page_view'
                          ? ev.fromScreen
                            ? `${formatScreenName(ev.fromScreen)} → ${formatScreenName(ev.screen)}`
                            : `Opened ${formatScreenName(ev.screen)}`
                          : ev.eventType === 'feature_action'
                          ? `${ev.action || 'Action'}${ev.detail ? ` · ${ev.detail}` : ''}`
                          : `Session ended (${ev.durationSec || 0}s)`}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#48484a] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#00567c]">
                          {ev.deviceType === 'mobile'
                            ? 'smartphone'
                            : ev.deviceType === 'tablet'
                            ? 'tablet_mac'
                            : 'laptop_mac'}
                        </span>
                        <span>
                          {ev.browser} · {ev.os}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono-num text-[#6e6e73] whitespace-nowrap hidden sm:table-cell">
                      {ev.viewport}
                    </td>
                    <td className="py-2.5 px-4 sm:px-5 text-[#6e6e73] whitespace-nowrap hidden md:table-cell">
                      {ev.region || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
