import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { InteractivePriceChart } from './ui/InteractivePriceChart';
import { CategoryIconBadge, FoodIconBadge } from './ui/FoodIconBadge';
import { FoodInflationPanel } from './FoodInflationPanel';
import { DATA_YEARS, DataYear, LATEST_OFFICIAL_CPI, NBS_CBN_MONTHLY_CPI } from '../data/foodInflationData';
import { trackFeatureAction } from '../lib/analytics';
import { ItemCategory } from '../types';

export const CommodityDetailScreen: React.FC = () => {
  const { commodities, selectedCommodity, selectCommodityById, activeRegion, navigateTo, routeEntityId } =
    useMarketPulse();
  const [activeTab, setActiveTab] = useState<'items' | 'inflation'>(
    routeEntityId === 'inflation' ? 'inflation' : 'items'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ItemCategory>('All');
  const [selectedMarketIdx, setSelectedMarketIdx] = useState(0);
  const [ledgerYear, setLedgerYear] = useState<'ALL' | DataYear>(2026);

  useEffect(() => {
    if (routeEntityId === 'inflation') {
      setActiveTab('inflation');
    }
  }, [routeEntityId]);

  useEffect(() => {
    setSelectedMarketIdx(0);
  }, [activeRegion.id]);

  const commodity = selectedCommodity || commodities[0];

  const availableCategories = useMemo(() => {
    return Array.from(new Set(commodities.map((c) => c.category as ItemCategory)));
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return commodities.filter((c) => {
      const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.unitDescription.toLowerCase().includes(q)
      );
    });
  }, [commodities, searchQuery, categoryFilter]);

  const multiplier = activeRegion.priceMultiplier || 1;

  const stateMarkets = useMemo(() => {
    const marketNames = activeRegion.markets.slice(0, 3);
    const spreadOffsets = [0.97, 1.0, 1.03];
    return marketNames.map((name, idx) => {
      const factor = multiplier * (spreadOffsets[idx] ?? 1.0);
      const price = Math.round((commodity.latestPrice * factor) / 50) * 50;
      const min = Math.round((commodity.crowdRangeMin * factor) / 50) * 50;
      const max = Math.round((commodity.crowdRangeMax * factor) / 50) * 50;
      return {
        name,
        price,
        min,
        max,
        reportsCount: Math.max(8, Math.round(commodity.crowdReportsCount * (0.45 - idx * 0.1))),
      };
    });
  }, [activeRegion, commodity, multiplier]);

  const activeMarket = stateMarkets[selectedMarketIdx] || stateMarkets[0];

  const stateChartDatasets = useMemo(() => {
    const primaryMarket = activeRegion.markets[0] || commodity.latestMarket;
    const secondaryMarket = activeRegion.markets[1] || activeRegion.markets[0] || 'Local Market';
    return commodity.chartData.datasets.map((ds, idx) => {
      if (ds.isNationalBenchmark) return ds;
      return {
        ...ds,
        label: idx === 0 ? primaryMarket : secondaryMarket,
      };
    });
  }, [commodity, activeRegion]);

  // Multi-year cumulative change since Jan 2023
  const since2023Pct = useMemo(() => {
    const hub = commodity.chartData.datasets[0]?.data || [];
    const first = hub[0];
    const last = hub[hub.length - 1];
    if (!first || !last) return null;
    return Number((((last - first) / first) * 100).toFixed(0));
  }, [commodity]);

  // Full 47-month MoM ledger (Jan 2023 – Nov 2026) filterable by year
  const monthlyBreakdown = useMemo(() => {
    const labels = commodity.chartData.labels;
    const hubSeries = commodity.chartData.datasets[0]?.data || [];
    const nbsSeries =
      commodity.chartData.datasets.find((d) => d.isNationalBenchmark)?.data || [];

    return labels
      .map((label, idx) => {
        const meta = NBS_CBN_MONTHLY_CPI[idx];
        const rawCur = hubSeries[idx];
        const rawPrev = idx > 0 ? hubSeries[idx - 1] : null;
        const nbsVal = nbsSeries[idx] ?? null;

        const statePrice =
          rawCur !== null && rawCur !== undefined
            ? Math.round((rawCur * multiplier) / 50) * 50
            : null;
        const momPct =
          rawCur !== null &&
          rawCur !== undefined &&
          rawPrev !== null &&
          rawPrev !== undefined &&
          rawPrev > 0
            ? Number((((rawCur - rawPrev) / rawPrev) * 100).toFixed(1))
            : null;

        return {
          label,
          year: meta?.year ?? 2026,
          statePrice,
          nbsVal,
          momPct,
        };
      })
      .filter((row) => ledgerYear === 'ALL' || row.year === ledgerYear)
      .reverse();
  }, [commodity, multiplier, ledgerYear]);

  const scaledLatest = activeMarket
    ? activeMarket.price
    : Math.round((commodity.latestPrice * multiplier) / 50) * 50;
  const scaledChange = Math.round((commodity.priceChangeAmount * multiplier) / 50) * 50;
  const scaledCrowdMin = activeMarket
    ? activeMarket.min
    : Math.round((commodity.crowdRangeMin * multiplier) / 50) * 50;
  const scaledCrowdMax = activeMarket
    ? activeMarket.max
    : Math.round((commodity.crowdRangeMax * multiplier) / 50) * 50;

  const crowdPercent = Math.min(
    100,
    Math.max(0, ((scaledLatest - scaledCrowdMin) / (scaledCrowdMax - scaledCrowdMin || 1)) * 100)
  );

  const purchasesInActiveState = commodity.loggedPurchases.filter((p) =>
    activeRegion.markets.some((m) => m.toLowerCase() === p.market.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-[72px] lg:pt-24 pb-24 lg:pb-14">
      {/* Header + Apple Segmented Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            {activeTab === 'items'
              ? 'Food Prices & Multi-Year Trends'
              : 'NBS & CBN Nigeria Observatory (2023–2026)'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6e6e73] mt-0.5">
            {activeTab === 'items' ? (
              <>
                Tracking {commodities.length} Nigerian staples across 47 months (Jan 2023 – Nov 2026) in{' '}
                <strong className="text-[#1d1d1f]">{activeRegion.name}</strong>
              </>
            ) : (
              <>
                Official NBS Inflation ({LATEST_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}% Food YoY),
                CBN MPR ({LATEST_OFFICIAL_CPI.cbnMpr.toFixed(2)}%), NFEM FX &amp; Fuel Watch
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div
            role="tablist"
            aria-label="Food price analytics view"
            className="inline-grid grid-cols-2 bg-[#e5e5ea]/80 p-1 rounded-xl border border-black/[0.05] w-full sm:w-fit"
          >
            {(
              [
                { id: 'items', label: `Staple Prices (${commodities.length})`, icon: 'show_chart' },
                { id: 'inflation', label: 'NBS & CBN (2023–26)', icon: 'monitoring' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    trackFeatureAction({
                      action: 'switch_trends_tab',
                      detail: tab.id,
                      screen: 'commodity-detail',
                      region: activeRegion.name,
                    });
                  }}
                  className={`relative flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    active ? 'text-[#00567c]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="trends-view-mode-pill"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-black/[0.05]"
                    />
                  )}
                  <span className="material-symbols-outlined text-[15px] relative z-10">
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => navigateTo('log-choice')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-black/[0.08] hover:bg-[#e8e8ed]/70 text-xs font-semibold text-[#00567c] transition-colors whitespace-nowrap shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Record today&apos;s price</span>
          </button>
        </div>
      </div>

      {activeTab === 'inflation' ? (
        <FoodInflationPanel
          commodities={commodities}
          activeRegion={activeRegion}
          onSelectCommodity={(id) => {
            selectCommodityById(id, false);
            setActiveTab('items');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <>
          {/* Compact CBN/NBS Multi-Year Pulse Strip */}
          <div className="mb-4 bg-white rounded-2xl p-3.5 sm:px-5 border border-black/[0.06] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-[#1d1d1f] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-[#00567c]">NBS / CBN {LATEST_OFFICIAL_CPI.month}</span>
              <span aria-hidden="true" className="text-[#aeaeb2]">·</span>
              <span>
                Food CPI <strong className="font-mono-num">{LATEST_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}%</strong>
              </span>
              <span aria-hidden="true" className="text-[#aeaeb2]">·</span>
              <span>
                MPR <strong className="font-mono-num">{LATEST_OFFICIAL_CPI.cbnMpr.toFixed(2)}%</strong>
              </span>
              <span aria-hidden="true" className="text-[#aeaeb2] hidden md:inline">·</span>
              <span className="hidden md:inline">
                NFEM <strong className="font-mono-num">₦{LATEST_OFFICIAL_CPI.usdNgnOfficial.toLocaleString('en-NG')}/$</strong>
              </span>
              <span aria-hidden="true" className="text-[#aeaeb2] hidden lg:inline">·</span>
              <span className="hidden lg:inline">
                PMS <strong className="font-mono-num">₦{LATEST_OFFICIAL_CPI.petrolPmsPerLitre.toLocaleString('en-NG')}/L</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('inflation')}
              className="text-xs font-semibold text-[#00567c] hover:underline whitespace-nowrap shrink-0 flex items-center gap-1 self-start sm:self-auto min-h-[32px]"
            >
              <span>Explore 2023–2026 Macro &amp; Fuel Data</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

          {/* Category Filter Strip with Aligned Category Icons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('All')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                categoryFilter === 'All'
                  ? 'bg-[#00567c] text-white shadow-2xs'
                  : 'bg-white text-[#1d1d1f] border border-black/[0.07] hover:bg-[#f2f2f7]'
              }`}
            >
              All Categories ({commodities.length})
            </button>
            {availableCategories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`pl-2 pr-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 min-h-[40px] ${
                    active
                      ? 'bg-[#00567c] text-white shadow-2xs'
                      : 'bg-white text-[#1d1d1f] border border-black/[0.07] hover:bg-[#f2f2f7]'
                  }`}
                >
                  <CategoryIconBadge
                    category={cat}
                    size="xs"
                    className={active ? '!bg-white/20 !border-white/25' : ''}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Commodity Selector Strip */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
            {filteredCommodities.map((c) => {
              const active = c.id === commodity.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    selectCommodityById(c.id, false);
                    trackFeatureAction({
                      action: 'select_commodity',
                      detail: c.id,
                      screen: 'commodity-detail',
                      region: activeRegion.name,
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 min-h-[44px] ${
                    active
                      ? 'bg-[#00567c] text-white shadow-2xs'
                      : 'bg-white text-[#1d1d1f] border border-black/[0.08] hover:bg-[#f2f2f7]'
                  }`}
                >
                  <FoodIconBadge
                    name={c.name}
                    category={c.category as ItemCategory}
                    size="xs"
                    className={active ? '!bg-white/20 !border-white/25' : ''}
                  />
                  <span>{c.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Master-Detail Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* Left Master Pane (Desktop Commodity Index) */}
            <aside className="hidden lg:block lg:col-span-4 space-y-3 lg:sticky lg:top-24">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rice, fish, maize, beans, eggs..."
                  className="w-full bg-white border border-black/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/15 outline-none shadow-2xs"
                />
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden divide-y divide-black/[0.05] max-h-[68vh] overflow-y-auto">
                {filteredCommodities.map((c) => {
                  const isSelected = c.id === commodity.id;
                  const regPrice = Math.round((c.latestPrice * multiplier) / 50) * 50;
                  const momVal = c.momChangePct ?? (c.isPriceUp ? c.priceChangePct : -c.priceChangePct);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        selectCommodityById(c.id, false);
                        trackFeatureAction({
                          action: 'select_commodity',
                          detail: c.id,
                          screen: 'commodity-detail',
                          region: activeRegion.name,
                        });
                      }}
                      className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors ${
                        isSelected ? 'bg-[#00567c]/[0.07]' : 'hover:bg-[#f5f5f7]/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FoodIconBadge
                          name={c.name}
                          category={c.category as ItemCategory}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#1d1d1f] truncate">
                            {c.name}
                          </div>
                          <div className="text-xs text-[#6e6e73] truncate">{c.unitDescription}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono-num font-bold text-sm text-[#1d1d1f]">
                          ₦{regPrice.toLocaleString('en-NG')}
                        </div>
                        <div
                          className={`text-[11px] font-mono-num font-semibold ${
                            momVal <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                          }`}
                        >
                          {momVal > 0 ? `+${momVal}%` : `${momVal}%`} MoM
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Analytics Workspace */}
            <div className="lg:col-span-8 space-y-5 min-w-0">
              {/* Hero Price + MoM/12M/Since-2023 + State Markets Switcher */}
              <section className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.06] shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <FoodIconBadge
                      name={commodity.name}
                      category={commodity.category as ItemCategory}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1d1d1f] leading-snug">
                        {commodity.name}
                      </h2>
                      <p className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{commodity.unitDescription}</span>
                        <span aria-hidden="true">·</span>
                        <span>{commodity.category}</span>
                      </p>
                      {commodity.dataSource && (
                        <p className="text-[11px] text-[#00567c] font-medium mt-1">
                          {commodity.dataSource}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#00567c] tabular-nums tracking-tight">
                      ₦{scaledLatest.toLocaleString('en-NG')}
                    </div>
                    <div className="flex sm:justify-end items-center gap-2 mt-1 text-xs flex-wrap font-mono-num">
                      <span
                        className={`font-semibold flex items-center gap-0.5 ${
                          (commodity.momChangePct ?? 0) <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                        }`}
                      >
                        ₦{scaledChange.toLocaleString('en-NG')} (
                        {(commodity.momChangePct ?? 0) > 0 ? '+' : ''}
                        {(commodity.momChangePct ?? commodity.priceChangePct).toFixed(1)}% MoM)
                      </span>
                      {typeof commodity.yoyChangePct === 'number' && (
                        <>
                          <span aria-hidden="true" className="text-[#aeaeb2]">·</span>
                          <span
                            className={`font-semibold ${
                              commodity.yoyChangePct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                            }`}
                          >
                            12M {commodity.yoyChangePct > 0 ? '+' : ''}
                            {commodity.yoyChangePct.toFixed(1)}%
                          </span>
                        </>
                      )}
                      {since2023Pct !== null && (
                        <>
                          <span aria-hidden="true" className="text-[#aeaeb2]">·</span>
                          <span className="font-semibold text-[#6e6e73]">
                            Since Jan 23: +{since2023Pct}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Official NBS/CBN Seasonality & Unit Reference Note */}
                {(commodity.seasonalityNote || commodity.nbsUnitRef) && (
                  <div className="p-3.5 rounded-xl bg-[#f5f5f7] border border-black/[0.05] space-y-1">
                    {commodity.seasonalityNote && (
                      <p className="text-xs text-[#1d1d1f] leading-relaxed">
                        <strong className="text-[#00567c]">Market Insight:</strong>{' '}
                        {commodity.seasonalityNote}
                      </p>
                    )}
                    {commodity.nbsUnitRef && (
                      <p className="text-[11px] text-[#6e6e73]">
                        Benchmark reference: {commodity.nbsUnitRef}
                      </p>
                    )}
                  </div>
                )}

                {/* Interactive Market Picker inside the Selected State */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#6e6e73]">
                      Markets in {activeRegion.name}
                    </span>
                    <span className="text-[11px] text-[#86868b]">Tap a market to compare</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {stateMarkets.map((mkt, idx) => {
                      const isActive = idx === selectedMarketIdx;
                      return (
                        <button
                          key={mkt.name}
                          type="button"
                          onClick={() => setSelectedMarketIdx(idx)}
                          className={`p-3 min-h-[68px] rounded-xl border text-left transition-all ${
                            isActive
                              ? 'bg-[#00567c]/[0.07] border-[#00567c]/40 ring-1 ring-[#00567c]/15'
                              : 'bg-[#f5f5f7] border-transparent hover:bg-[#ebebf0]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#1d1d1f] truncate">
                            {mkt.name}
                          </div>
                          <div className="font-mono-num font-bold text-sm text-[#00567c] mt-0.5">
                            ₦{mkt.price.toLocaleString('en-NG')}
                          </div>
                          <div className="text-[11px] text-[#6e6e73] font-mono-num">
                            ₦{mkt.min.toLocaleString('en-NG')} – ₦{mkt.max.toLocaleString('en-NG')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Crowd Range Comparison for Selected Market in Active State */}
                <div className="pt-2 border-t border-black/[0.06]">
                  <div className="flex flex-wrap justify-between items-center gap-1 mb-2 text-xs">
                    <span className="font-semibold text-[#1d1d1f]">
                      What shoppers paid at {activeMarket?.name || activeRegion.markets[0]}
                    </span>
                    <span className="text-[#6e6e73]">
                      {activeMarket?.reportsCount || commodity.crowdReportsCount} shoppers reported
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 h-3 bg-[#f2f2f7] rounded-full overflow-hidden relative">
                      <div className="absolute left-[18%] right-[22%] h-full bg-[#d4e8f7]" />
                      <div
                        className="absolute w-2 h-full bg-[#00567c] rounded-full z-10"
                        style={{ left: `calc(${crowdPercent}% - 4px)` }}
                        title={`Average at ${activeMarket?.name}`}
                      />
                    </div>
                    <div className="text-xs font-mono-num font-semibold text-[#1d1d1f] whitespace-nowrap">
                      ₦{scaledCrowdMin.toLocaleString('en-NG')} – ₦
                      {scaledCrowdMax.toLocaleString('en-NG')}
                    </div>
                  </div>
                </div>
              </section>

              {/* Interactive Multi-Year Scrubbing Chart (Jan 2023 – Nov 2026) */}
              <section className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.06] shadow-2xs">
                <div className="mb-4">
                  <h3 className="font-display font-bold text-base text-[#1d1d1f]">
                    2023 – 2026 Price History in {activeRegion.name} vs NBS National Avg
                  </h3>
                  <p className="text-xs text-[#6e6e73] mt-0.5">
                    47 consecutive monthly data points (Jan 2023 – Nov 2026) · Slide to inspect exact
                    Naira prices &amp; MoM % changes
                  </p>
                </div>
                <InteractivePriceChart
                  labels={commodity.chartData.labels}
                  datasets={stateChartDatasets}
                  priceMultiplier={multiplier}
                  onRangeChange={(range) =>
                    trackFeatureAction({
                      action: 'change_chart_range',
                      detail: `${commodity.id}:${range}`,
                      screen: 'commodity-detail',
                      region: activeRegion.name,
                    })
                  }
                />
              </section>

              {/* Multi-Year Month-on-Month Data Points Ledger with Year Tabs */}
              <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1d1d1f]">
                      Month-on-Month Data Points (Jan 2023 – Nov 2026)
                    </h3>
                    <p className="text-xs text-[#6e6e73] mt-0.5">
                      {activeRegion.name} hub average vs NBS Selected Food Price Watch ·{' '}
                      {monthlyBreakdown.length} months shown
                    </p>
                  </div>

                  <div className="inline-grid grid-cols-5 bg-[#f2f2f7] p-1 rounded-xl border border-black/[0.05] w-full sm:w-auto">
                    {(['ALL', ...DATA_YEARS] as const).map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setLedgerYear(yr)}
                        className={`px-2.5 py-1.5 min-h-[34px] rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                          ledgerYear === yr
                            ? 'bg-white text-[#00567c] shadow-2xs'
                            : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                        }`}
                      >
                        {yr === 'ALL' ? 'All' : yr}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#f5f5f7] z-10">
                      <tr className="text-[11px] font-semibold text-[#6e6e73] border-b border-black/[0.06]">
                        <th className="py-2.5 px-4 sm:px-5 whitespace-nowrap">Month</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">
                          {activeRegion.state.replace(' State', '')} Avg
                        </th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">NBS Avg</th>
                        <th className="py-2.5 px-4 sm:px-5 text-right whitespace-nowrap">MoM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] text-xs font-mono-num">
                      {monthlyBreakdown.map((row) => (
                        <tr key={row.label} className="hover:bg-[#f5f5f7]/70">
                          <td className="py-2.5 px-4 sm:px-5 font-sans font-semibold text-[#1d1d1f] whitespace-nowrap">
                            {row.label}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#1d1d1f] whitespace-nowrap">
                            {row.statePrice !== null
                              ? `₦${row.statePrice.toLocaleString('en-NG')}`
                              : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#6e6e73] whitespace-nowrap">
                            {row.nbsVal !== null ? `₦${row.nbsVal.toLocaleString('en-NG')}` : '—'}
                          </td>
                          <td className="py-2.5 px-4 sm:px-5 text-right font-bold whitespace-nowrap">
                            {row.momPct === null ? (
                              <span className="text-[#86868b]">Base</span>
                            ) : (
                              <span
                                className={
                                  row.momPct < 0
                                    ? 'text-[#15803d]'
                                    : row.momPct > 0
                                    ? 'text-[#b91c1c]'
                                    : 'text-[#6e6e73]'
                                }
                              >
                                {row.momPct > 0
                                  ? `+${row.momPct.toFixed(1)}%`
                                  : `${row.momPct.toFixed(1)}%`}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Personal Logged Purchases Ledger */}
              <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1d1d1f]">
                      Times You Bought This
                    </h3>
                    {purchasesInActiveState.length === 0 && (
                      <p className="text-xs text-[#6e6e73] mt-0.5">
                        Showing your own past receipts · You haven&apos;t logged a purchase in{' '}
                        {activeRegion.name} yet
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[#6e6e73]">
                    {commodity.loggedPurchases.length}{' '}
                    {commodity.loggedPurchases.length === 1 ? 'receipt' : 'receipts'}
                  </span>
                </div>
                <div className="divide-y divide-black/[0.05]">
                  {commodity.loggedPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#f5f5f7]/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FoodIconBadge
                          name={commodity.name}
                          category={commodity.category as ItemCategory}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1d1d1f] text-sm truncate">
                            {purchase.market}
                          </p>
                          <p className="text-xs text-[#6e6e73] mt-0.5">
                            {purchase.date} · {purchase.quantityDesc}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono-num font-bold text-sm sm:text-base text-[#1d1d1f]">
                          ₦{purchase.totalAmount.toLocaleString('en-NG')}
                        </p>
                        <p className="text-xs font-mono-num text-[#6e6e73]">
                          {purchase.unitPriceDesc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
