import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Commodity, ItemCategory, RegionProfile } from '../types';
import {
  LATEST_OFFICIAL_CPI,
  NBS_CBN_MONTHLY_CPI,
  OFFICIAL_AUTHORITY_SOURCES,
  PREVIOUS_OFFICIAL_CPI,
  computeBasketInflationSummary,
} from '../data/foodInflationData';
import { FoodIconBadge } from './ui/FoodIconBadge';

interface FoodInflationPanelProps {
  commodities: Commodity[];
  activeRegion: RegionProfile;
  onSelectCommodity: (commodityId: string) => void;
}

export const FoodInflationPanel: React.FC<FoodInflationPanelProps> = ({
  commodities,
  activeRegion,
  onSelectCommodity,
}) => {
  const [cpiMetric, setCpiMetric] = useState<'yoy' | 'mom'>('yoy');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(
    NBS_CBN_MONTHLY_CPI.length - 1
  );
  const [sortBy, setSortBy] = useState<'mom-desc' | 'mom-asc' | 'yoy-desc'>('mom-desc');

  const multiplier = activeRegion.priceMultiplier || 1;

  const basketSummary = useMemo(
    () => computeBasketInflationSummary(commodities, multiplier),
    [commodities, multiplier]
  );

  const inspectedMonth =
    NBS_CBN_MONTHLY_CPI[selectedMonthIdx] || LATEST_OFFICIAL_CPI;

  const sortedStaples = useMemo(() => {
    const rows = commodities.map((c) => {
      const hub = c.chartData.datasets[0]?.data || [];
      const nbs = c.chartData.datasets.find((d) => d.isNationalBenchmark)?.data || [];
      const curRaw = hub[hub.length - 1] ?? c.latestPrice;
      const prevRaw = hub[hub.length - 2] ?? c.latestPrice;
      const yrRaw = hub[0] ?? c.latestPrice;
      const nbsCur = nbs[nbs.length - 1] ?? curRaw;

      const curState = Math.round((curRaw * multiplier) / 50) * 50;
      const prevState = Math.round((prevRaw * multiplier) / 50) * 50;
      const momPct = prevRaw ? Number((((curRaw - prevRaw) / prevRaw) * 100).toFixed(1)) : 0;
      const yoyPct = yrRaw ? Number((((curRaw - yrRaw) / yrRaw) * 100).toFixed(1)) : 0;

      return {
        commodity: c,
        curState,
        prevState,
        nbsCur,
        momPct,
        yoyPct,
      };
    });

    return rows.sort((a, b) => {
      if (sortBy === 'mom-desc') return b.momPct - a.momPct;
      if (sortBy === 'mom-asc') return a.momPct - b.momPct;
      return b.yoyPct - a.yoyPct;
    });
  }, [commodities, multiplier, sortBy]);

  // Compute chart scaling for bar/column visual
  const chartValues = NBS_CBN_MONTHLY_CPI.map((m) =>
    cpiMetric === 'yoy' ? m.foodInflationYoY : m.foodInflationMoM
  );
  const maxAbsVal = Math.max(
    1,
    ...chartValues.map((v) => Math.abs(v))
  );

  return (
    <div className="space-y-6">
      {/* Top 4 Official CBN/NBS & State Basket KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
              Food Inflation (YoY)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eef6fb] text-[#00567c]">
              NBS / CBN
            </span>
          </div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
            {LATEST_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}%
          </div>
          <p className="text-xs text-[#15803d] font-medium">
            Eased from {PREVIOUS_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}% in Sep 2026
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
              Food Month-on-Month
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#15803d]">
              Oct 2026
            </span>
          </div>
          <div
            className={`font-display font-mono-num text-2xl sm:text-3xl font-extrabold ${
              LATEST_OFFICIAL_CPI.foodInflationMoM <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
            }`}
          >
            {LATEST_OFFICIAL_CPI.foodInflationMoM > 0 ? '+' : ''}
            {LATEST_OFFICIAL_CPI.foodInflationMoM.toFixed(2)}%
          </div>
          <p className="text-xs text-[#6e6e73]">
            vs {PREVIOUS_OFFICIAL_CPI.foodInflationMoM.toFixed(2)}% in Sep (harvest season)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
              Headline CPI (YoY)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f5f5f7] text-[#48484a]">
              Rebased 2024
            </span>
          </div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
            {LATEST_OFFICIAL_CPI.headlineInflationYoY.toFixed(2)}%
          </div>
          <p className="text-xs text-[#6e6e73]">
            Core CPI: {LATEST_OFFICIAL_CPI.coreInflationYoY.toFixed(2)}% · 12M Food Avg: 15.98%
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#00567c]/20 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#00567c] uppercase tracking-wider truncate">
              14-Staple Basket ({activeRegion.state.replace(' State', '')})
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display font-mono-num text-2xl sm:text-3xl font-extrabold ${
                basketSummary.basketMoMPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
              }`}
            >
              {basketSummary.basketMoMPct > 0 ? '+' : ''}
              {basketSummary.basketMoMPct.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-[#6e6e73]">MoM</span>
          </div>
          <p className="text-xs text-[#6e6e73]">
            {basketSummary.coolingCount} staples cooled · {basketSummary.risingCount} rose in Oct
          </p>
        </div>
      </div>

      {/* Interactive 12-Month Official Food Inflation Trajectory (Nov 25 – Oct 26) */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-[#1d1d1f]">
              Nigeria 12-Month Food Inflation Trajectory (Nov 2025 – Oct 2026)
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Tap any month bar to inspect official NBS / CBN food &amp; headline CPI drivers
            </p>
          </div>

          <div
            role="tablist"
            aria-label="CPI chart metric"
            className="inline-grid grid-cols-2 bg-[#f2f2f7] p-1 rounded-xl border border-black/[0.05] w-full sm:w-fit shrink-0"
          >
            {(
              [
                { id: 'yoy', label: 'Year-on-Year (%)' },
                { id: 'mom', label: 'Month-on-Month (%)' },
              ] as const
            ).map((opt) => {
              const active = cpiMetric === opt.id;
              return (
                <button
                  key={opt.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setCpiMetric(opt.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    active ? 'text-[#00567c]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="cpi-metric-pill"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-black/[0.05]"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Month-by-Month Column Chart */}
        <div className="bg-[#f6f8fb] rounded-2xl border border-black/[0.05] p-4 sm:p-5">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 items-end h-44 pt-6">
            {NBS_CBN_MONTHLY_CPI.map((pt, idx) => {
              const val = cpiMetric === 'yoy' ? pt.foodInflationYoY : pt.foodInflationMoM;
              const isSelected = idx === selectedMonthIdx;
              const isNegative = val < 0;
              const heightPct = Math.max(10, Math.round((Math.abs(val) / maxAbsVal) * 100));

              return (
                <button
                  key={pt.month}
                  type="button"
                  onClick={() => setSelectedMonthIdx(idx)}
                  className="flex flex-col items-center justify-end h-full group focus:outline-none"
                  aria-label={`${pt.fullLabel}: ${val}%`}
                >
                  <span
                    className={`text-[10px] font-mono-num font-bold mb-1 transition-colors whitespace-nowrap ${
                      isSelected
                        ? isNegative
                          ? 'text-[#15803d]'
                          : 'text-[#00567c]'
                        : 'text-[#6e6e73] group-hover:text-[#1d1d1f]'
                    }`}
                  >
                    {val > 0 && cpiMetric === 'mom' ? '+' : ''}
                    {val.toFixed(1)}%
                  </span>
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[34px] rounded-t-lg transition-all ${
                        isNegative
                          ? isSelected
                            ? 'bg-[#15803d] ring-2 ring-[#15803d]/30 ring-offset-1'
                            : 'bg-[#15803d]/65 group-hover:bg-[#15803d]'
                          : isSelected
                          ? 'bg-[#00567c] ring-2 ring-[#00567c]/30 ring-offset-1'
                          : 'bg-[#00567c]/45 group-hover:bg-[#00567c]/75'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-semibold whitespace-nowrap ${
                      isSelected ? 'text-[#00567c]' : 'text-[#6e6e73]'
                    }`}
                  >
                    {pt.month.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Official Breakdown Banner */}
        <div className="p-4 rounded-xl bg-[#eef6fb]/65 border border-[#00567c]/15 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-[#1d1d1f]">
                {inspectedMonth.fullLabel}
              </span>
              <span className="text-[11px] font-mono-num font-semibold px-2 py-0.5 rounded-md bg-white text-[#00567c] border border-black/[0.06]">
                Food CPI Index: {inspectedMonth.foodCpiIndex.toFixed(1)} (2024=100)
              </span>
            </div>
            <p className="text-xs text-[#48484a] leading-relaxed">{inspectedMonth.note}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono-num text-xs border-t md:border-t-0 pt-2.5 md:pt-0 border-black/[0.06]">
            <div>
              <div className="text-[10px] text-[#6e6e73] uppercase">Food YoY</div>
              <div className="font-bold text-sm text-[#1d1d1f]">
                {inspectedMonth.foodInflationYoY.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#6e6e73] uppercase">Food MoM</div>
              <div
                className={`font-bold text-sm ${
                  inspectedMonth.foodInflationMoM <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                }`}
              >
                {inspectedMonth.foodInflationMoM > 0 ? '+' : ''}
                {inspectedMonth.foodInflationMoM.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#6e6e73] uppercase">Headline YoY</div>
              <div className="font-bold text-sm text-[#1d1d1f]">
                {inspectedMonth.headlineInflationYoY.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Month-on-Month Inflation Watchlist Across All 14 Food Items */}
      <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base text-[#1d1d1f]">
              Month-on-Month Food Inflation by Staple ({activeRegion.name})
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Tap any staple to inspect its full 12-month NBS/CBN benchmark &amp; market chart
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'mom-desc', label: 'Highest MoM Rise' },
                { id: 'mom-asc', label: 'Biggest MoM Drop' },
                { id: 'yoy-desc', label: '12-Month Jump' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                  sortBy === opt.id
                    ? 'bg-[#00567c] text-white'
                    : 'bg-[#f5f5f7] text-[#48484a] hover:bg-[#e5e5ea]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f7]/80 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider border-b border-black/[0.06]">
                <th className="py-3 px-4 sm:px-5">Food Item</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Sep 2026</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Oct 2026</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">MoM %</th>
                <th className="py-3 px-3 text-right whitespace-nowrap hidden md:table-cell">
                  12M %
                </th>
                <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap hidden sm:table-cell">
                  NBS National Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] text-sm">
              {sortedStaples.map(({ commodity, curState, prevState, nbsCur, momPct, yoyPct }) => {
                const isCooling = momPct < 0;
                const isSteady = momPct === 0;
                return (
                  <tr
                    key={commodity.id}
                    onClick={() => onSelectCommodity(commodity.id)}
                    className="hover:bg-[#f5f5f7]/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <FoodIconBadge
                          name={commodity.name}
                          category={commodity.category as ItemCategory}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#1d1d1f] truncate">
                            {commodity.name}
                          </div>
                          <div className="text-[11px] text-[#6e6e73] truncate">
                            {commodity.unitDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-xs text-[#6e6e73] whitespace-nowrap">
                      ₦{prevState.toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-bold text-[#1d1d1f] whitespace-nowrap">
                      ₦{curState.toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-mono-num text-xs font-bold ${
                          isSteady
                            ? 'bg-[#f2f2f7] text-[#48484a]'
                            : isCooling
                            ? 'bg-[#ecfdf5] text-[#15803d]'
                            : 'bg-[#fef2f2] text-[#b91c1c]'
                        }`}
                      >
                        {momPct > 0 ? '↑ +' : momPct < 0 ? '↓ ' : ''}
                        {momPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-xs font-semibold whitespace-nowrap hidden md:table-cell">
                      <span
                        className={
                          yoyPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                        }
                      >
                        {yoyPct > 0 ? '+' : ''}
                        {yoyPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-5 text-right font-mono-num text-xs text-[#6e6e73] whitespace-nowrap hidden sm:table-cell">
                      ₦{nbsCur.toLocaleString('en-NG')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Credible Institutional Sources Footer */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f]">
          <span className="material-symbols-outlined text-[18px] text-[#00567c]">
            verified
          </span>
          <span>Data Methodology &amp; Official Authorities</span>
        </div>
        <p className="text-xs text-[#6e6e73] leading-relaxed">
          Monthly food prices and inflation rates are anchored to Nigeria&apos;s official rebased
          Consumer Price Index (2024 = 100) and national retail food watch bulletins, adjusted by
          state market differentials so households can see how official inflation shows up in their
          actual market bag.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {OFFICIAL_AUTHORITY_SOURCES.map((src) => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#eef6fb] text-xs font-semibold text-[#00567c] transition-colors"
            >
              <span>{src.name}</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
