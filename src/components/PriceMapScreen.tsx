import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PriceMapTab } from '../types';
import { PriceMapCommodityKey } from '../data/priceMapData';
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
              See what everyday shoppers are paying across states and find where your market bag is
              cheapest.
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
