import React, { useState } from 'react';
import {
  COMMODITY_META,
  MARKET_PINS,
  PriceMapCommodityKey,
} from '../../data/priceMapData';
import { FoodIconBadge } from '../ui/FoodIconBadge';

interface PriceMapCheapestViewProps {
  selectedCommodityKey: PriceMapCommodityKey;
  onSelectCommodityKey: (key: PriceMapCommodityKey) => void;
  watchlistMarkets: string[];
  onToggleWatchlist: (marketName: string) => void;
  onLogAtMarket: (marketName: string) => void;
}

export const PriceMapCheapestView: React.FC<PriceMapCheapestViewProps> = ({
  selectedCommodityKey,
  onSelectCommodityKey,
  watchlistMarkets,
  onToggleWatchlist,
  onLogAtMarket,
}) => {
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(15);
  const [marketTypeFilter, setMarketTypeFilter] = useState<'all' | 'open' | 'supermarket'>('all');

  const currentCommodityMeta =
    COMMODITY_META.find((c) => c.key === selectedCommodityKey) || COMMODITY_META[0];

  const rankedMarkets = MARKET_PINS.filter((m) => {
    if (m.distanceKm > searchRadiusKm) return false;
    if (marketTypeFilter === 'open' && m.type !== 'open') return false;
    if (marketTypeFilter === 'supermarket' && m.type !== 'supermarket') return false;
    return true;
  }).sort((a, b) => a.prices[selectedCommodityKey].price - b.prices[selectedCommodityKey].price);

  const highestPrice =
    rankedMarkets.length > 0
      ? Math.max(...rankedMarkets.map((m) => m.prices[selectedCommodityKey].price))
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Filters Column */}
      <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
        {/* Commodity Selector */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-3">
          <h2 className="text-xs font-semibold text-[#6e6e73]">
            Pick a Food Item
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {COMMODITY_META.map((item) => {
              const active = selectedCommodityKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectCommodityKey(item.key)}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 min-w-0 ${
                    active
                      ? 'bg-[#00567c] text-white shadow-2xs'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  <FoodIconBadge
                    name={item.shortLabel}
                    size="xs"
                    className={active ? '!bg-white/20 !border-white/25' : ''}
                  />
                  <span className="truncate">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Radius Slider Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-900/8 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="radius-slider" className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Search Radius
            </label>
            <span className="font-mono-num text-sm font-bold text-[#00567c]">
              Within {searchRadiusKm} km
            </span>
          </div>
          <input
            id="radius-slider"
            type="range"
            min="2"
            max="50"
            value={searchRadiusKm}
            onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
            className="w-full accent-[#00567c] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#64748b] font-mono-num">
            <span>2 km</span>
            <span>15 km</span>
            <span>30 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Market Format Segmented Filter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-900/8 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
            Market Format
          </h2>
          <div className="flex flex-col gap-1.5">
            {(
              [
                { id: 'all', label: 'All Market Formats', icon: 'storefront' },
                { id: 'open', label: 'Open Markets Only', icon: 'local_mall' },
                { id: 'supermarket', label: 'Supermarkets Only', icon: 'shopping_cart' },
              ] as const
            ).map((f) => {
              const active = marketTypeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMarketTypeFilter(f.id)}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 text-left ${
                    active
                      ? 'bg-[#d4e8f7] text-[#00567c]'
                      : 'text-[#475569] hover:bg-[#f6f8fb] hover:text-[#111827]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right Ranked Results Column */}
      <section className="lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-[#111827]">
              Cheapest {currentCommodityMeta.label} Nearby
            </h2>
            <p className="text-xs text-[#64748b]">
              Ranked lowest to highest price within {searchRadiusKm} km · Includes transit estimate
            </p>
          </div>
          <span className="font-mono-num text-xs font-semibold text-[#64748b]">
            {rankedMarkets.length} {rankedMarkets.length === 1 ? 'market' : 'markets'} found
          </span>
        </div>

        {rankedMarkets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-900/8 p-10 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#94a3b8]">location_off</span>
            <h3 className="font-display font-bold text-base text-[#111827]">
              No markets within {searchRadiusKm} km
            </h3>
            <p className="text-sm text-[#64748b] max-w-sm mx-auto">
              Expand your search radius or include both open markets and supermarkets to compare prices.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchRadiusKm(25);
                setMarketTypeFilter('all');
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00567c] text-white text-xs font-semibold hover:bg-[#003e5a] transition-colors"
            >
              Reset Filters (25 km · All)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rankedMarkets.map((m, idx) => {
              const stats = m.prices[selectedCommodityKey];
              const isBest = idx === 0;
              const savingsVsHigh = highestPrice - stats.price;
              const watched = watchlistMarkets.includes(m.name);

              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl p-5 border transition-colors ${
                    isBest ? 'border-[#15803d]/40 ring-1 ring-[#15803d]/15' : 'border-slate-900/8'
                  } shadow-2xs`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono-num font-bold text-sm shrink-0 ${
                          isBest
                            ? 'bg-[#ecfdf5] text-[#15803d]'
                            : 'bg-[#eef2f6] text-[#475569]'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-base text-[#111827]">
                            {m.name}
                          </h3>
                          {isBest && (
                            <span className="text-[11px] font-bold text-[#15803d] bg-[#ecfdf5] px-2 py-0.5 rounded-md">
                              Best Price
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748b] mt-0.5">{m.area}</p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748b] mt-2 font-mono-num">
                          <span>{m.distanceKm} km away</span>
                          <span>·</span>
                          <span>~₦{m.transitCost} transit</span>
                          <span>·</span>
                          <span>
                            {m.reportsCount} logs ({m.updatedAgo})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-slate-900/8 pt-3 sm:pt-0">
                      <div>
                        <div className="font-display font-mono-num text-2xl font-extrabold text-[#111827]">
                          ₦{stats.price.toLocaleString()}
                        </div>
                        <div
                          className={`font-mono-num text-xs font-semibold ${
                            stats.deltaPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                          }`}
                        >
                          {stats.deltaPct <= 0
                            ? `↓ ${Math.abs(stats.deltaPct)}% vs last wk`
                            : `↑ ${stats.deltaPct}% vs last wk`}
                        </div>
                      </div>
                      {savingsVsHigh > 0 && (
                        <div className="text-xs font-semibold text-[#15803d] mt-1 font-mono-num">
                          Save ₦{savingsVsHigh.toLocaleString()} vs highest
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3.5 border-t border-slate-900/8 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-[#64748b] font-mono-num">
                      Est. total w/ transit:{' '}
                      <strong className="text-[#111827]">
                        ₦{(stats.price + m.transitCost).toLocaleString()}
                      </strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleWatchlist(m.name)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          watched
                            ? 'bg-[#ecfdf5] text-[#15803d]'
                            : 'bg-[#f6f8fb] text-[#475569] hover:bg-[#eef2f6]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {watched ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                        <span>{watched ? 'Watching' : 'Watch'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLogAtMarket(m.name)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00567c] text-white hover:bg-[#003e5a] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[15px]">add_circle</span>
                        <span>Log Trip Here</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
