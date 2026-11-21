import React, { useState, useMemo, useEffect } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { InteractivePriceChart } from './ui/InteractivePriceChart';
import { CategoryIconBadge, FoodIconBadge } from './ui/FoodIconBadge';
import { ItemCategory } from '../types';

export const CommodityDetailScreen: React.FC = () => {
  const { commodities, selectedCommodity, selectCommodityById, activeRegion, navigateTo } =
    useMarketPulse();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ItemCategory>('All');
  const [selectedMarketIdx, setSelectedMarketIdx] = useState(0);

  // Reset selected market within state whenever user switches state
  useEffect(() => {
    setSelectedMarketIdx(0);
  }, [activeRegion.id]);

  const commodity = selectedCommodity || commodities[0];

  const availableCategories = useMemo(() => {
    const unique = Array.from(new Set(commodities.map((c) => c.category as ItemCategory)));
    return unique;
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

  // Build state-specific markets & price offsets so switching state immediately updates
  // both the market price breakdown and the Price History chart legends!
  const stateMarkets = useMemo(() => {
    const marketNames = activeRegion.markets.slice(0, 3);
    const spreadOffsets = [0.97, 1.0, 1.03]; // Hub 1 slightly cheaper wholesale, Hub 2 avg, Hub 3 retail
    return marketNames.map((name, idx) => {
      const factor = multiplier * (spreadOffsets[idx] ?? 1.0);
      const price = Math.round((commodity.latestPrice * factor) / 100) * 100;
      const min = Math.round((commodity.crowdRangeMin * factor) / 100) * 100;
      const max = Math.round((commodity.crowdRangeMax * factor) / 100) * 100;
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

  // Dynamically re-label the chart datasets to the markets inside the currently selected state
  const stateChartDatasets = useMemo(() => {
    const primaryMarket = activeRegion.markets[0] || commodity.latestMarket;
    const secondaryMarket = activeRegion.markets[1] || activeRegion.markets[0] || 'Local Market';
    return commodity.chartData.datasets.map((ds, idx) => ({
      ...ds,
      label: idx === 0 ? primaryMarket : secondaryMarket,
    }));
  }, [commodity, activeRegion]);

  const scaledLatest = activeMarket
    ? activeMarket.price
    : Math.round((commodity.latestPrice * multiplier) / 100) * 100;
  const scaledChange = Math.round((commodity.priceChangeAmount * multiplier) / 50) * 50;
  const scaledCrowdMin = activeMarket
    ? activeMarket.min
    : Math.round((commodity.crowdRangeMin * multiplier) / 100) * 100;
  const scaledCrowdMax = activeMarket
    ? activeMarket.max
    : Math.round((commodity.crowdRangeMax * multiplier) / 100) * 100;

  const crowdPercent = Math.min(
    100,
    Math.max(0, ((scaledLatest - scaledCrowdMin) / (scaledCrowdMax - scaledCrowdMin || 1)) * 100)
  );

  // Check if any personal logged purchase matches the active state's markets
  const purchasesInActiveState = commodity.loggedPurchases.filter((p) =>
    activeRegion.markets.some((m) => m.toLowerCase() === p.market.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-28 lg:pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Food Price Trends
          </h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">
            Showing markets in <strong className="text-[#1d1d1f]">{activeRegion.name}</strong> ·
            Slide across the chart to see how prices moved
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('log-choice')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] hover:bg-[#e8e8ed]/70 text-xs font-semibold text-[#00567c] transition-colors self-start sm:self-auto whitespace-nowrap shadow-2xs"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Record today&apos;s price</span>
        </button>
      </div>

      {/* Category Filter Strip with Aligned Category Icons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
        <button
          type="button"
          onClick={() => setCategoryFilter('All')}
          className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[38px] ${
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
              className={`pl-2 pr-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 min-h-[38px] ${
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
              onClick={() => selectCommodityById(c.id, false)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 min-h-[40px] ${
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
              placeholder="Search egg, yam, rice, mango..."
              className="w-full bg-white border border-black/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/15 outline-none shadow-2xs"
            />
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden divide-y divide-black/[0.05]">
            {filteredCommodities.map((c) => {
              const isSelected = c.id === commodity.id;
              const regPrice = Math.round((c.latestPrice * multiplier) / 100) * 100;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCommodityById(c.id, false)}
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
                      <div className="font-semibold text-sm text-[#1d1d1f] truncate">{c.name}</div>
                      <div className="text-xs text-[#6e6e73] truncate">{c.unitDescription}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-num font-bold text-sm text-[#1d1d1f]">
                      ₦{regPrice.toLocaleString('en-NG')}
                    </div>
                    <div
                      className={`text-[11px] font-mono-num font-semibold ${
                        c.isPriceUp ? 'text-[#b91c1c]' : 'text-[#15803d]'
                      }`}
                    >
                      {c.isPriceUp ? '↑' : '↓'} {c.priceChangePct}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Analytics Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero Price + State Markets Switcher + Crowd Gauge Card */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
              <div className="flex items-center gap-3.5">
                <FoodIconBadge
                  name={commodity.name}
                  category={commodity.category as ItemCategory}
                  size="lg"
                />
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1d1d1f] leading-snug">
                    {commodity.name}
                  </h2>
                  <p className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1.5">
                    <span>{commodity.unitDescription}</span>
                    <span aria-hidden="true">·</span>
                    <span>{commodity.category}</span>
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#00567c] tabular-nums tracking-tight">
                  ₦{scaledLatest.toLocaleString('en-NG')}
                </div>
                <div className="flex sm:justify-end items-center gap-2 mt-1 text-xs">
                  <span
                    className={`font-mono-num font-semibold flex items-center gap-0.5 ${
                      commodity.isPriceUp ? 'text-[#b91c1c]' : 'text-[#15803d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {commodity.isPriceUp ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    ₦{scaledChange.toLocaleString('en-NG')} ({commodity.priceChangePct}%)
                  </span>
                  <span className="text-[#6e6e73]">{commodity.vsPeriodText}</span>
                </div>
              </div>
            </div>

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
                      className={`p-3 rounded-xl border text-left transition-all ${
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
                        ₦{Math.round(mkt.min / 1000)}k – ₦{Math.round(mkt.max / 1000)}k
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crowd Range Comparison for Selected Market in Active State */}
            <div className="pt-2 border-t border-black/[0.06]">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-semibold text-[#1d1d1f]">
                  What shoppers paid at {activeMarket?.name || activeRegion.markets[0]}
                </span>
                <span className="text-[#6e6e73]">
                  {activeMarket?.reportsCount || commodity.crowdReportsCount} shoppers reported this
                  week
                </span>
              </div>

              <div className="flex items-center gap-4">
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

          {/* Interactive Scrubbing Chart Card (Synced to Active State's Markets!) */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs">
            <div className="mb-4">
              <h3 className="font-display font-bold text-base text-[#1d1d1f]">
                How the Price Moved in {activeRegion.name}
              </h3>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                Hover or drag on the chart · Tap any market below to show or hide its line
              </p>
            </div>
            <InteractivePriceChart
              labels={commodity.chartData.labels}
              datasets={stateChartDatasets}
              priceMultiplier={multiplier}
            />
          </section>

          {/* Personal Logged Purchases Ledger (Honest to user's actual past receipts) */}
          <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
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
                  className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#f5f5f7]/70 transition-colors"
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
    </div>
  );
};
