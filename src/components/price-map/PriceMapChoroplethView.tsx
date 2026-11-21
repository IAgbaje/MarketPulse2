import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  COMMODITY_META,
  LAGOS_LGA_TILES,
  MARKET_PINS,
  NIGERIA_STATE_TILES,
  PriceMapCommodityKey,
  ChoroplethTileData,
  MarketPinData,
} from '../../data/priceMapData';
import { PriceMapTab } from '../../types';
import { AdaptiveSheet } from '../ui/AdaptiveSheet';
import { FoodIconBadge } from '../ui/FoodIconBadge';

interface PriceMapChoroplethViewProps {
  selectedCommodityKey: PriceMapCommodityKey;
  onSelectCommodityKey: (key: PriceMapCommodityKey) => void;
  selectedMarketId: string;
  onSelectMarketId: (id: string) => void;
  watchlistMarkets: string[];
  onToggleWatchlist: (marketName: string) => void;
  onSwitchTab: (tab: PriceMapTab) => void;
  onOpenCommodityTrend: (commodityId: string) => void;
  onLogAtMarket: (marketName?: string) => void;
}

const getTileStyles = (tile: ChoroplethTileData, isSelected: boolean) => {
  const ring = isSelected ? 'ring-2 ring-[#00567c] ring-offset-1' : '';
  switch (tile.tone) {
    case 'positive':
      return `bg-[#ecfdf5] border ${tile.highlight ? 'border-[#15803d]/60' : 'border-[#15803d]/25'} hover:border-[#15803d]/70 ${ring}`;
    case 'danger':
      return `bg-[#fef2f2] border border-[#b91c1c]/25 hover:border-[#b91c1c]/60 ${ring}`;
    case 'low-confidence':
      return `pattern-hatched bg-white border border-slate-900/15 hover:border-[#00567c]/50 ${ring}`;
    case 'no-data':
      return `pattern-dots bg-[#f6f8fb] border border-dashed border-slate-400/70 hover:border-[#00567c] ${ring}`;
    default:
      return `bg-white border border-slate-900/10 hover:border-[#00567c]/50 ${ring}`;
  }
};

const getTilePriceTone = (tone: ChoroplethTileData['tone']) => {
  switch (tone) {
    case 'positive':
      return 'text-[#15803d]';
    case 'danger':
      return 'text-[#b91c1c]';
    case 'low-confidence':
      return 'text-[#475569]';
    case 'no-data':
      return 'text-[#64748b]';
    default:
      return 'text-[#111827]';
  }
};

export const PriceMapChoroplethView: React.FC<PriceMapChoroplethViewProps> = ({
  selectedCommodityKey,
  onSelectCommodityKey,
  selectedMarketId,
  onSelectMarketId,
  watchlistMarkets,
  onToggleWatchlist,
  onSwitchTab,
  onOpenCommodityTrend,
  onLogAtMarket,
}) => {
  const [mapScope, setMapScope] = useState<'national' | 'lga'>('national');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const selectedMarket: MarketPinData =
    MARKET_PINS.find((m) => m.id === selectedMarketId) || MARKET_PINS[0];
  const currentCommodityMeta =
    COMMODITY_META.find((c) => c.key === selectedCommodityKey) || COMMODITY_META[0];
  const selectedStats = selectedMarket.prices[selectedCommodityKey];
  const isWatchlisted = watchlistMarkets.includes(selectedMarket.name);

  const tiles = mapScope === 'national' ? NIGERIA_STATE_TILES : LAGOS_LGA_TILES;

  const handleInspectMarket = (marketId: string, openMobileSheet = false) => {
    onSelectMarketId(marketId);
    if (openMobileSheet && window.innerWidth < 1024) {
      setMobileSheetOpen(true);
    }
  };

  const renderMarketInspectorBody = () => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-lg font-extrabold text-[#111827] leading-snug">
              {selectedMarket.name}
            </h2>
            {selectedMarket.id === 'mile-12' && (
              <span className="text-[11px] font-bold text-[#15803d] bg-[#ecfdf5] px-2 py-0.5 rounded-md">
                Cheapest Hub
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">{selectedMarket.area}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono-num text-xs font-semibold text-[#111827]">
            {selectedMarket.distanceKm} km
          </div>
          <div className="font-mono-num text-[11px] text-[#64748b]">
            ~₦{selectedMarket.transitCost} transit
          </div>
        </div>
      </div>

      {/* Item Switcher inside inspector */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b border-slate-900/8">
        {COMMODITY_META.slice(0, 4).map((c) => {
          const active = selectedCommodityKey === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSelectCommodityKey(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? 'bg-[#d4e8f7] text-[#00567c]'
                  : 'text-[#64748b] hover:bg-[#eef2f6] hover:text-[#111827]'
              }`}
            >
              {c.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Price & 7-Day Sparkline Card */}
      <div className="bg-[#f6f8fb] p-4 rounded-xl border border-slate-900/8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-[#64748b]">
            Crowd Average · {currentCommodityMeta.shortLabel}
          </div>
          <div className="font-display font-mono-num text-3xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            ₦{selectedStats.price.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#64748b] mt-1 font-mono-num">
            {selectedMarket.reportsCount} verified logs · {selectedMarket.updatedAgo}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span
            className={`font-mono-num text-xs font-bold mb-2 ${
              selectedStats.deltaPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
            }`}
          >
            {selectedStats.deltaPct <= 0
              ? `↓ ${Math.abs(selectedStats.deltaPct)}% vs last wk`
              : `↑ ${selectedStats.deltaPct}% vs last wk`}
          </span>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30" aria-hidden="true">
            <path
              d={selectedStats.sparkline}
              fill="none"
              stroke={selectedStats.deltaPct <= 0 ? '#15803d' : '#b91c1c'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setMobileSheetOpen(false);
            onSwitchTab('markets');
          }}
          className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-900/12 text-[#111827] font-semibold text-xs hover:bg-[#eef2f6] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          <span>Compare Markets</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleWatchlist(selectedMarket.name)}
          className={`min-h-[44px] px-3 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            isWatchlisted
              ? 'bg-[#ecfdf5] text-[#15803d] border border-[#15803d]/30'
              : 'bg-[#00567c] text-white hover:bg-[#003e5a]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
          </span>
          <span>{isWatchlisted ? 'On Watchlist' : 'Watch Market'}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setMobileSheetOpen(false);
          onLogAtMarket(selectedMarket.name);
        }}
        className="w-full min-h-[42px] py-2 rounded-xl bg-[#f6f8fb] hover:bg-[#d4e8f7]/45 text-[#00567c] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
        <span>Log a trip at {selectedMarket.name}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Scope Toggle + Commodity Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Segmented Scope Toggle */}
        <div
          role="tablist"
          aria-label="Map geographic scope"
          className="inline-grid grid-cols-2 bg-[#eef2f6] p-1 rounded-xl border border-slate-900/8 w-full sm:w-fit shrink-0"
        >
          {(
            [
              { id: 'national', label: 'Nigeria Overview' },
              { id: 'lga', label: 'Lagos LGAs' },
            ] as const
          ).map((scope) => {
            const active = mapScope === scope.id;
            return (
              <button
                key={scope.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setMapScope(scope.id)}
                className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  active ? 'text-[#00567c]' : 'text-[#475569] hover:text-[#111827]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="map-scope-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-900/6"
                  />
                )}
                <span className="relative z-10">{scope.label}</span>
              </button>
            );
          })}
        </div>

        {/* Commodity Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {COMMODITY_META.slice(0, 4).map((item) => {
            const active = selectedCommodityKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectCommodityKey(item.key)}
                className={`min-h-[40px] pl-2 pr-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-[#00567c] text-white shadow-2xs'
                    : 'bg-white text-[#1d1d1f] border border-black/[0.08] hover:bg-[#f2f2f7]'
                }`}
              >
                <FoodIconBadge
                  name={item.shortLabel}
                  size="xs"
                  className={active ? '!bg-white/20 !border-white/25' : ''}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Choropleth Map Canvas */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-900/8 shadow-2xs p-4 sm:p-6 space-y-5">
          {/* Canvas Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-900/8">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#b91c1c] text-[18px] shrink-0">
                trending_up
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#111827]">
                {mapScope === 'national'
                  ? 'National index up ↑15% over 30 days'
                  : 'Lagos State avg: ₦43,200 (↑6% 30d)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenCommodityTrend(currentCommodityMeta.linkedCommodityId)}
              className="text-xs font-semibold text-[#00567c] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Historical Chart</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

          {/* Interactive Choropleth Tiles */}
          <div
            className={`grid gap-3 ${
              mapScope === 'national' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {tiles.map((tile) => {
              const isSelected = Boolean(tile.marketId && tile.marketId === selectedMarketId);
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => {
                    if (tile.marketId) {
                      handleInspectMarket(tile.marketId, true);
                    } else {
                      onLogAtMarket();
                    }
                  }}
                  className={`text-left rounded-xl p-3.5 transition-all flex flex-col justify-between min-h-[108px] cursor-pointer ${getTileStyles(
                    tile,
                    isSelected
                  )}`}
                >
                  <div className="flex items-start justify-between gap-1.5 w-full">
                    <span className="text-xs font-bold text-[#111827] leading-tight">
                      {tile.name}
                    </span>
                    <span className="font-mono-num text-[10px] font-semibold text-[#475569] shrink-0">
                      {tile.logsCount > 0 ? `${tile.logsCount} logs` : '0 logs'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div
                      className={`font-display font-mono-num text-base font-extrabold leading-tight ${getTilePriceTone(
                        tile.tone
                      )}`}
                    >
                      {tile.priceText}
                    </div>
                    <div
                      className={`text-[11px] font-medium mt-0.5 leading-snug ${
                        tile.tone === 'no-data' ? 'text-[#00567c] underline' : getTilePriceTone(tile.tone)
                      }`}
                    >
                      {tile.deltaText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Market Pins Quick Bar */}
          <div className="pt-4 border-t border-slate-900/8">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2.5">
              Inspect Live Market Hubs
            </div>
            <div className="flex flex-wrap gap-2">
              {MARKET_PINS.map((pin) => {
                const active = pin.id === selectedMarketId;
                const pinPrice = pin.prices[selectedCommodityKey].price;
                const isLowData = pin.reportsCount < 5;
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => handleInspectMarket(pin.id, true)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      active
                        ? 'bg-[#00567c] text-white shadow-2xs'
                        : isLowData
                        ? 'pattern-hatched bg-white text-[#475569] border border-dashed border-slate-400'
                        : 'bg-[#f6f8fb] text-[#111827] border border-slate-900/10 hover:border-[#00567c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">location_on</span>
                    <span>{pin.name.replace(' Market', '')}</span>
                    <span className="font-mono-num font-bold opacity-90">
                      {isLowData ? '<5 logs' : `₦${(pinPrice / 1000).toFixed(1)}k`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Confidence Legend */}
          <div className="bg-[#f6f8fb] p-3.5 rounded-xl border border-slate-900/8 text-[11px] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-[#475569] uppercase tracking-wider">
                30-Day Price Momentum & Confidence
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#15803d] font-bold shrink-0">Drop</span>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-[#15803d] via-[#eab308] to-[#b91c1c]" />
              <span className="text-[#b91c1c] font-bold shrink-0">+15%</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[#64748b] pt-2 border-t border-slate-900/8">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 inline-block bg-[#00567c] rounded-xs" />
                Solid: High confidence (5+ logs)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 inline-block pattern-hatched border border-slate-400 rounded-xs" />
                Striped: &lt;5 reports
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 inline-block pattern-dots border border-dashed border-slate-400 rounded-xs" />
                Dotted: No data yet
              </span>
            </div>
          </div>
        </section>

        {/* Right Sticky Inspector (Desktop) + Breakdown List */}
        <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          {/* Desktop Market Detail Card */}
          <div className="hidden lg:block bg-white rounded-2xl p-6 border border-slate-900/8 shadow-2xs">
            {renderMarketInspectorBody()}
          </div>

          {/* Mobile quick summary button to open sheet */}
          <div className="lg:hidden bg-white rounded-2xl p-4 border border-slate-900/8 shadow-2xs flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                Selected Market
              </div>
              <div className="font-display font-bold text-base text-[#111827] truncate">
                {selectedMarket.name} ·{' '}
                <span className="font-mono-num text-[#00567c]">
                  ₦{selectedStats.price.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#00567c] text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Inspect
            </button>
          </div>

          {/* Lagos Market Breakdown List */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-900/8 shadow-2xs space-y-2.5">
            <div className="flex justify-between items-center gap-2 pb-1">
              <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Lagos Hubs ({currentCommodityMeta.shortLabel})
              </h3>
              <button
                type="button"
                onClick={() => onSwitchTab('markets')}
                className="text-xs font-semibold text-[#00567c] hover:underline whitespace-nowrap shrink-0"
              >
                Filter by radius →
              </button>
            </div>

            {MARKET_PINS.map((m) => {
              const p = m.prices[selectedCommodityKey];
              const isLow = m.reportsCount < 5;
              const isActive = selectedMarketId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleInspectMarket(m.id, true)}
                  className={`w-full text-left p-3 rounded-xl border flex justify-between items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#d4e8f7]/35 border-[#00567c]/40'
                      : 'bg-[#f6f8fb] border-transparent hover:bg-[#eef2f6]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#111827] truncate">{m.name}</div>
                    <div className="text-xs text-[#64748b] font-mono-num">
                      {m.reportsCount} reports · {m.distanceKm} km · {m.updatedAgo}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-mono-num font-bold text-sm text-[#111827]">
                      ₦{p.price.toLocaleString()}
                    </div>
                    {isLow ? (
                      <span className="text-[11px] font-medium text-[#64748b] whitespace-nowrap">
                        &lt;5 reports
                      </span>
                    ) : (
                      <span
                        className={`font-mono-num text-xs font-semibold whitespace-nowrap ${
                          p.deltaPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                        }`}
                      >
                        {p.deltaPct <= 0 ? `↓ ${Math.abs(p.deltaPct)}%` : `↑ ${p.deltaPct}%`}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Mobile Native Bottom Sheet for Market Inspection */}
      <AdaptiveSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title="Market Price Inspector"
        subtitle="Crowdsourced prices & weekly momentum"
      >
        {renderMarketInspectorBody()}
      </AdaptiveSheet>
    </div>
  );
};
