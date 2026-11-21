import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PriceMapTab } from '../types';
import { PriceMapCommodityKey } from '../data/priceMapData';
import { LiveMarketGoogleMap } from './price-map/LiveMarketGoogleMap';
import { PriceMapChoroplethView } from './price-map/PriceMapChoroplethView';
import { PriceMapCheapestView } from './price-map/PriceMapCheapestView';
import { PriceMapBasketView } from './price-map/PriceMapBasketView';

const PRICE_MAP_TABS: { id: PriceMapTab; label: string; icon: string }[] = [
  { id: 'map', label: 'Price Map', icon: 'map' },
  { id: 'markets', label: 'Cheapest Market', icon: 'storefront' },
  { id: 'basket', label: 'Full Bag', icon: 'shopping_basket' },
];

export const PriceMapScreen: React.FC = () => {
  const {
    activePriceMapTab,
    setActivePriceMapTab,
    watchlistMarkets,
    toggleWatchlistMarket,
    navigateTo,
    selectCommodityById,
    setStagingMarket,
  } = useMarketPulse();

  const [selectedCommodityKey, setSelectedCommodityKey] = useState<PriceMapCommodityKey>('rice');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('mile-12');
  const [mapDisplayMode, setMapDisplayMode] = useState<'google-map' | 'price-grid'>('google-map');

  const handleSelectTab = (tab: PriceMapTab) => {
    setActivePriceMapTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogAtMarket = (marketName?: string) => {
    if (marketName) {
      setStagingMarket(marketName);
    }
    navigateTo('log-choice');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 lg:pt-24 pb-28 lg:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Unified Hub Header + Apple Segmented Control */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              Check Market Prices
            </h1>
            <p className="text-sm text-[#6e6e73] mt-1">
              Locate real markets near you with live directions, see what everyday shoppers are
              paying, and find where your market bag is cheapest.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Price comparison views"
            className="grid grid-cols-3 bg-[#e5e5ea]/75 p-1 rounded-xl border border-black/[0.05] w-full md:w-auto shrink-0"
          >
            {PRICE_MAP_TABS.map((tab) => {
              const active = activePriceMapTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`price-map-tab-${tab.id}`}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    active ? 'text-[#00567c]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="price-map-tab-indicator"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-black/[0.05]"
                    />
                  )}
                  <span className="material-symbols-outlined text-[16px] relative z-10 shrink-0">
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Active View */}
        {activePriceMapTab === 'map' && (
          <div className="space-y-4">
            {/* Live Google Map vs Regional Price Grid Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Map view mode"
                className="inline-grid grid-cols-2 bg-[#e5e5ea]/80 p-1 rounded-xl border border-black/[0.05] w-full sm:w-fit"
              >
                {(
                  [
                    { id: 'google-map', label: 'Live Google Map', icon: 'location_on' },
                    { id: 'price-grid', label: 'State Price Grid', icon: 'grid_view' },
                  ] as const
                ).map((mode) => {
                  const active = mapDisplayMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setMapDisplayMode(mode.id)}
                      className={`relative flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        active ? 'text-[#00567c]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="map-display-mode-indicator"
                          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                          className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-black/[0.05]"
                        />
                      )}
                      <span className="material-symbols-outlined text-[15px] relative z-10">
                        {mode.icon}
                      </span>
                      <span className="relative z-10">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-[#6e6e73]">
                {mapDisplayMode === 'google-map'
                  ? 'Switch state in the top bar to jump to real markets in another state.'
                  : 'Compare 30-day crowdsourced staple prices across Nigerian states.'}
              </span>
            </div>

            {mapDisplayMode === 'google-map' ? (
              <LiveMarketGoogleMap
                watchlistMarkets={watchlistMarkets}
                onToggleWatchlist={toggleWatchlistMarket}
                onLogAtMarket={handleLogAtMarket}
              />
            ) : (
              <PriceMapChoroplethView
                selectedCommodityKey={selectedCommodityKey}
                onSelectCommodityKey={setSelectedCommodityKey}
                selectedMarketId={selectedMarketId}
                onSelectMarketId={setSelectedMarketId}
                watchlistMarkets={watchlistMarkets}
                onToggleWatchlist={toggleWatchlistMarket}
                onSwitchTab={handleSelectTab}
                onOpenCommodityTrend={(id) => selectCommodityById(id)}
                onLogAtMarket={handleLogAtMarket}
              />
            )}
          </div>
        )}

        {activePriceMapTab === 'markets' && (
          <PriceMapCheapestView
            selectedCommodityKey={selectedCommodityKey}
            onSelectCommodityKey={setSelectedCommodityKey}
            watchlistMarkets={watchlistMarkets}
            onToggleWatchlist={toggleWatchlistMarket}
            onLogAtMarket={handleLogAtMarket}
          />
        )}

        {activePriceMapTab === 'basket' && (
          <PriceMapBasketView onLogAtMarket={handleLogAtMarket} />
        )}
      </div>
    </div>
  );
};
