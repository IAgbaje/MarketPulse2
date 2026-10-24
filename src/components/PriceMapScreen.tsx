import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PriceMapTab } from '../types';

interface MarketPinData {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  transitCost: number;
  type: 'open' | 'supermarket';
  reportsCount: number;
  updatedAgo: string;
  prices: {
    rice: { price: number; deltaPct: number; sparkline: string };
    tomatoes: { price: number; deltaPct: number; sparkline: string };
    beans: { price: number; deltaPct: number; sparkline: string };
    garri: { price: number; deltaPct: number; sparkline: string };
    palmoil: { price: number; deltaPct: number; sparkline: string };
    onions: { price: number; deltaPct: number; sparkline: string };
  };
}

const MARKET_PINS: MarketPinData[] = [
  {
    id: 'mile-12',
    name: 'Mile 12 Market',
    area: 'Ketu, Lagos · Open Daily',
    distanceKm: 2.4,
    transitCost: 400,
    type: 'open',
    reportsCount: 14,
    updatedAgo: '2h ago',
    prices: {
      rice: { price: 42500, deltaPct: -4, sparkline: 'M0,25 Q15,20 30,22 T60,15 T90,18 T100,10' },
      tomatoes: { price: 18500, deltaPct: 12, sparkline: 'M0,28 Q20,24 40,20 T70,14 T100,6' },
      beans: { price: 3800, deltaPct: -2, sparkline: 'M0,18 Q25,18 50,16 T80,19 T100,15' },
      garri: { price: 2800, deltaPct: -5, sparkline: 'M0,14 Q25,16 50,18 T80,22 T100,25' },
      palmoil: { price: 4200, deltaPct: 0, sparkline: 'M0,16 Q25,15 50,16 T80,16 T100,16' },
      onions: { price: 2500, deltaPct: -6, sparkline: 'M0,12 Q25,14 50,18 T80,20 T100,24' },
    },
  },
  {
    id: 'daleko',
    name: 'Daleko Market',
    area: 'Mushin, Lagos · Wholesale Hub',
    distanceKm: 6.8,
    transitCost: 700,
    type: 'open',
    reportsCount: 8,
    updatedAgo: '5h ago',
    prices: {
      rice: { price: 43500, deltaPct: 0, sparkline: 'M0,18 Q25,17 50,18 T80,17 T100,18' },
      tomatoes: { price: 19200, deltaPct: 14, sparkline: 'M0,26 Q25,22 50,18 T80,12 T100,8' },
      beans: { price: 3900, deltaPct: 1, sparkline: 'M0,20 Q25,19 50,19 T80,18 T100,17' },
      garri: { price: 2900, deltaPct: 0, sparkline: 'M0,18 Q25,18 50,18 T80,18 T100,18' },
      palmoil: { price: 4300, deltaPct: 2, sparkline: 'M0,20 Q25,19 50,18 T80,17 T100,15' },
      onions: { price: 2600, deltaPct: 0, sparkline: 'M0,18 Q25,18 50,18 T80,18 T100,18' },
    },
  },
  {
    id: 'oyingbo',
    name: 'Oyingbo Market',
    area: 'Lagos Mainland · Open Daily',
    distanceKm: 8.1,
    transitCost: 800,
    type: 'open',
    reportsCount: 11,
    updatedAgo: '4h ago',
    prices: {
      rice: { price: 44000, deltaPct: 2, sparkline: 'M0,22 Q25,20 50,19 T80,16 T100,14' },
      tomatoes: { price: 19500, deltaPct: 15, sparkline: 'M0,28 Q25,24 50,18 T80,12 T100,7' },
      beans: { price: 4000, deltaPct: 3, sparkline: 'M0,22 Q25,20 50,18 T80,16 T100,14' },
      garri: { price: 3000, deltaPct: 4, sparkline: 'M0,24 Q25,22 50,20 T80,17 T100,15' },
      palmoil: { price: 4400, deltaPct: 5, sparkline: 'M0,24 Q25,22 50,19 T80,15 T100,12' },
      onions: { price: 2700, deltaPct: 4, sparkline: 'M0,22 Q25,20 50,18 T80,16 T100,14' },
    },
  },
  {
    id: 'shoprite-ikeja',
    name: 'Shoprite Ikeja City Mall',
    area: 'Alausa, Ikeja · Supermarket',
    distanceKm: 3.5,
    transitCost: 500,
    type: 'supermarket',
    reportsCount: 6,
    updatedAgo: '1d ago',
    prices: {
      rice: { price: 46500, deltaPct: 8, sparkline: 'M0,26 Q25,22 50,19 T80,14 T100,9' },
      tomatoes: { price: 21500, deltaPct: 18, sparkline: 'M0,29 Q25,24 50,18 T80,11 T100,5' },
      beans: { price: 4500, deltaPct: 6, sparkline: 'M0,25 Q25,22 50,18 T80,14 T100,10' },
      garri: { price: 3400, deltaPct: 6, sparkline: 'M0,25 Q25,22 50,18 T80,14 T100,10' },
      palmoil: { price: 4900, deltaPct: 8, sparkline: 'M0,26 Q25,22 50,18 T80,14 T100,9' },
      onions: { price: 3100, deltaPct: 7, sparkline: 'M0,25 Q25,22 50,18 T80,14 T100,10' },
    },
  },
  {
    id: 'alaba-rago',
    name: 'Alaba Rago Market',
    area: 'Ojo, Lagos · Open Daily',
    distanceKm: 18.4,
    transitCost: 1200,
    type: 'open',
    reportsCount: 3,
    updatedAgo: '1d ago',
    prices: {
      rice: { price: 41800, deltaPct: -3, sparkline: 'M0,20 Q25,21 50,19 T80,22 T100,24' },
      tomatoes: { price: 17800, deltaPct: 8, sparkline: 'M0,24 Q25,21 50,18 T80,15 T100,12' },
      beans: { price: 3700, deltaPct: -4, sparkline: 'M0,16 Q25,18 50,20 T80,22 T100,24' },
      garri: { price: 2700, deltaPct: -3, sparkline: 'M0,16 Q25,18 50,20 T80,22 T100,24' },
      palmoil: { price: 4100, deltaPct: -2, sparkline: 'M0,17 Q25,18 50,19 T80,21 T100,22' },
      onions: { price: 2300, deltaPct: -8, sparkline: 'M0,14 Q25,16 50,19 T80,22 T100,26' },
    },
  },
];

type CommodityKey = 'rice' | 'tomatoes' | 'beans' | 'garri' | 'palmoil' | 'onions';

const COMMODITY_META: { key: CommodityKey; label: string; shortLabel: string; emoji: string }[] = [
  { key: 'rice', label: 'Rice (50kg)', shortLabel: 'Rice (50kg)', emoji: '🌾' },
  { key: 'tomatoes', label: 'Tomatoes (Basket)', shortLabel: 'Tomatoes', emoji: '🍅' },
  { key: 'beans', label: 'Beans (Oloyin)', shortLabel: 'Beans (Oloyin)', emoji: '🫘' },
  { key: 'garri', label: 'Garri (Paint)', shortLabel: 'Garri (Paint)', emoji: '🥣' },
  { key: 'palmoil', label: 'Palm Oil (5L)', shortLabel: 'Palm Oil', emoji: '🛢️' },
  { key: 'onions', label: 'Onions (Dry Bag)', shortLabel: 'Onions', emoji: '🧅' },
];

export const PriceMapScreen: React.FC = () => {
  const {
    activePriceMapTab,
    setActivePriceMapTab,
    watchlistMarkets,
    toggleWatchlistMarket,
    navigateTo,
    selectCommodityById,
  } = useMarketPulse();

  const [mapScope, setMapScope] = useState<'national' | 'lga'>('national');
  const [selectedCommodityKey, setSelectedCommodityKey] = useState<CommodityKey>('rice');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('mile-12');
  const [showMarketSheet, setShowMarketSheet] = useState<boolean>(true);

  // Tab 2 ("Where is It Cheapest?") filters
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(15);
  const [marketTypeFilter, setMarketTypeFilter] = useState<'all' | 'open' | 'supermarket'>('all');

  const selectedMarket =
    MARKET_PINS.find((m) => m.id === selectedMarketId) || MARKET_PINS[0];
  const currentCommodityMeta =
    COMMODITY_META.find((c) => c.key === selectedCommodityKey) || COMMODITY_META[0];
  const selectedMarketItemStats = selectedMarket.prices[selectedCommodityKey];
  const isWatchlisted = watchlistMarkets.includes(selectedMarket.name);

  // Filtered and ranked markets for Tab 2
  const rankedMarkets = MARKET_PINS.filter((m) => {
    if (m.distanceKm > searchRadiusKm) return false;
    if (marketTypeFilter === 'open' && m.type !== 'open') return false;
    if (marketTypeFilter === 'supermarket' && m.type !== 'supermarket') return false;
    return true;
  }).sort((a, b) => a.prices[selectedCommodityKey].price - b.prices[selectedCommodityKey].price);

  const handleSelectTab = (tab: PriceMapTab) => {
    setActivePriceMapTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-16 pb-28 max-w-6xl mx-auto w-full overflow-x-hidden">
      {/* Unified Hub Sub-Navigation Header */}
      <div className="bg-white border-b border-[#e1e2e6] px-4 md:px-6 py-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#191c1f] tracking-tight leading-snug">
              Market Price Intelligence
            </h1>
            <p className="text-xs text-[#40484e] leading-relaxed mt-0.5">
              Real-time crowdsourced prices, data confidence &amp; basket comparisons
            </p>
          </div>

          {/* 3-Tab Segmented Switcher */}
          <div className="grid grid-cols-3 bg-[#e7e8ec] p-1 rounded-xl border border-[#c0c7cf]/40 w-full sm:w-auto shrink-0">
            {(
              [
                { id: 'map', label: 'Price Map', icon: 'map' },
                { id: 'markets', label: 'Cheapest Item', icon: 'storefront' },
                { id: 'basket', label: 'My Basket', icon: 'shopping_basket' },
              ] as { id: PriceMapTab; label: string; icon: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                id={`price-map-tab-${tab.id}`}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center ${
                  activePriceMapTab === tab.id
                    ? 'bg-[#00567c] text-white shadow-xs'
                    : 'text-[#40484e] hover:text-[#191c1f]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] leading-none">{tab.icon}</span>
                <span className="whitespace-nowrap leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: NATIONAL & LGA CHOROPLETH MAP + MARKET DETAIL SHEET
          ===================================================================== */}
      {activePriceMapTab === 'map' && (
        <div className="px-4 md:px-6 pt-4 space-y-5">
          {/* Top Controls: Scope Switcher + Commodity Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Scope Toggle: National vs Lagos LGA */}
            <div className="grid grid-cols-2 sm:inline-flex bg-white p-1 rounded-xl border border-[#c0c7cf]/50 shadow-2xs w-full sm:w-fit shrink-0">
              <button
                onClick={() => setMapScope('national')}
                className={`px-3 py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-bold transition-colors text-center justify-center flex items-center ${
                  mapScope === 'national'
                    ? 'bg-[#cbe3f7] text-[#00567c]'
                    : 'text-[#40484e] hover:bg-[#f2f3f7]'
                }`}
              >
                Nigeria Overview
              </button>
              <button
                onClick={() => setMapScope('lga')}
                className={`px-3 py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-bold transition-colors text-center justify-center flex items-center ${
                  mapScope === 'lga'
                    ? 'bg-[#cbe3f7] text-[#00567c]'
                    : 'text-[#40484e] hover:bg-[#f2f3f7]'
                }`}
              >
                Lagos LGA Choropleth
              </button>
            </div>

            {/* Commodity Selector Pills */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
              {COMMODITY_META.slice(0, 4).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedCommodityKey(item.key)}
                  className={`px-3 py-2 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 min-w-0 ${
                    selectedCommodityKey === item.key
                      ? 'bg-[#00567c] text-white shadow-xs'
                      : 'bg-white text-[#40484e] border border-[#e1e2e6] hover:bg-[#f2f3f7]'
                  }`}
                >
                  <span className="shrink-0">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map Canvas Column */}
            <div className="lg:col-span-7 bg-[#eef2f6] rounded-3xl border border-[#e1e2e6] shadow-xs overflow-hidden relative min-h-[420px] flex flex-col justify-between p-4 sm:p-6">
              {/* Top Floating National Alert Chip */}
              <div className="flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-[#e1e2e6] inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse shrink-0"></span>
                  <span className="text-xs font-bold text-[#191c1f]">
                    {mapScope === 'national'
                      ? 'Prices up ↑15% nationally'
                      : 'Lagos State Avg: ₦43,200 (↑6%)'}
                  </span>
                </div>

                <button
                  onClick={() => selectCommodityById('rice-50kg')}
                  className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-[#e1e2e6] text-xs font-bold text-[#00567c] hover:bg-[#cbe3f7]/40 transition-colors whitespace-nowrap"
                >
                  Historical Chart →
                </button>
              </div>

              {/* Map Body: National vs LGA Choropleth */}
              {mapScope === 'national' ? (
                <div className="my-4 relative">
                  {/* Stylized Interactive Nigeria State Grid + SVG Map Overlay */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div
                      onClick={() => {
                        setSelectedMarketId('mile-12');
                        setShowMarketSheet(true);
                      }}
                      className="bg-[#dcfce7] border-2 border-[#16a34a] rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-extrabold text-[#191c1f] leading-tight">Lagos</span>
                        <span className="text-[10px] font-bold bg-[#16a34a] text-white px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                          142 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-extrabold tabular-nums text-[#16a34a]">
                          ₦42,500
                        </div>
                        <div className="text-[10px] text-[#16a34a] font-semibold leading-snug mt-0.5">
                          ↓ 4% vs national avg
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedMarketId('oyingbo');
                        setShowMarketSheet(true);
                      }}
                      className="bg-[#fee2e2] border border-[#ba1a1a]/40 rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#191c1f] leading-tight">Abuja FCT</span>
                        <span className="text-[10px] text-[#ba1a1a] font-bold whitespace-nowrap shrink-0">
                          64 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-extrabold tabular-nums text-[#ba1a1a]">
                          ₦46,000
                        </div>
                        <div className="text-[10px] text-[#ba1a1a] font-semibold leading-snug mt-0.5">
                          ↑ 15% this month
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedMarketId('daleko');
                        setShowMarketSheet(true);
                      }}
                      className="bg-[#dcfce7] border border-[#16a34a]/40 rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#191c1f] leading-tight">Kano</span>
                        <span className="text-[10px] text-[#16a34a] font-bold whitespace-nowrap shrink-0">
                          51 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-extrabold tabular-nums text-[#16a34a]">
                          ₦38,500
                        </div>
                        <div className="text-[10px] text-[#16a34a] font-semibold leading-snug mt-0.5">
                          ↓ 3% harvest supply
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedMarketId('shoprite-ikeja');
                        setShowMarketSheet(true);
                      }}
                      className="bg-[#fee2e2] border border-[#ba1a1a]/40 rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#191c1f] leading-tight">Rivers (PH)</span>
                        <span className="text-[10px] text-[#ba1a1a] font-bold whitespace-nowrap shrink-0">
                          39 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-extrabold tabular-nums text-[#ba1a1a]">
                          ₦45,200
                        </div>
                        <div className="text-[10px] text-[#ba1a1a] font-semibold leading-snug mt-0.5">
                          ↑ 9% this month
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedMarketId('daleko');
                        setShowMarketSheet(true);
                      }}
                      className="bg-white border border-[#c0c7cf] rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#191c1f] leading-tight">Oyo (Ibadan)</span>
                        <span className="text-[10px] text-[#40484e] font-bold whitespace-nowrap shrink-0">
                          28 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-extrabold tabular-nums text-[#191c1f]">
                          ₦41,000
                        </div>
                        <div className="text-[10px] text-[#40484e] font-semibold leading-snug mt-0.5">
                          ~ Stable (0%)
                        </div>
                      </div>
                    </div>

                    {/* Low confidence striped tile (<5 reports) */}
                    <div
                      onClick={() => {
                        setSelectedMarketId('alaba-rago');
                        setShowMarketSheet(true);
                      }}
                      className="pattern-hatched bg-white border border-[#c0c7cf] rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#40484e] leading-tight">Enugu</span>
                        <span className="text-[10px] bg-[#e1e2e6] text-[#40484e] px-1.5 py-0.5 rounded font-bold whitespace-nowrap shrink-0">
                          3 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-bold tabular-nums text-[#40484e]">
                          ~₦44,000
                        </div>
                        <div className="text-[10px] text-[#71787f] font-semibold leading-snug mt-0.5">
                          &lt;5 reports (Low conf.)
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedMarketId('mile-12');
                        setShowMarketSheet(true);
                      }}
                      className="bg-[#dcfce7]/70 border border-[#16a34a]/30 rounded-2xl p-3 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#191c1f] leading-tight">Kaduna</span>
                        <span className="text-[10px] text-[#16a34a] font-bold whitespace-nowrap shrink-0">
                          18 logs
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-extrabold tabular-nums text-[#16a34a]">
                          ₦39,800
                        </div>
                        <div className="text-[10px] text-[#16a34a] font-semibold leading-snug mt-0.5">
                          ↓ 1% this month
                        </div>
                      </div>
                    </div>

                    {/* Dotted No Data tile */}
                    <div
                      onClick={() => navigateTo('log-choice')}
                      className="pattern-dots bg-[#f8f9fd] border border-dashed border-[#71787f] rounded-2xl p-3 cursor-pointer hover:border-[#00567c] transition-colors flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-xs font-bold text-[#71787f] leading-tight">Borno</span>
                        <span className="text-[10px] text-[#71787f] whitespace-nowrap shrink-0">0 logs</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#71787f]">No data yet</div>
                        <div className="text-[10px] text-[#00567c] underline font-semibold mt-0.5">
                          + Log first trip
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Market Pins Row */}
                  <div className="mt-4 pt-3 border-t border-[#c0c7cf]/40">
                    <div className="text-[11px] font-bold text-[#40484e] uppercase tracking-wider mb-2">
                      Tap a Market Pin to Inspect Live Prices
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MARKET_PINS.map((pin) => {
                        const active = pin.id === selectedMarketId;
                        const pinPrice = pin.prices[selectedCommodityKey].price;
                        const isLowData = pin.reportsCount < 5;
                        return (
                          <button
                            key={pin.id}
                            onClick={() => {
                              setSelectedMarketId(pin.id);
                              setShowMarketSheet(true);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                              active
                                ? 'bg-[#00567c] text-white ring-2 ring-[#00567c]/30 scale-105'
                                : isLowData
                                ? 'pattern-hatched bg-white text-[#40484e] border border-dashed border-[#71787f]'
                                : 'bg-white text-[#191c1f] border border-[#c0c7cf] hover:border-[#00567c]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              location_on
                            </span>
                            <span>{pin.name.replace(' Market', '')}</span>
                            <span className="tabular-nums font-extrabold">
                              {isLowData ? '<5 reports' : `₦${(pinPrice / 1000).toFixed(1)}k`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Lagos LGA Choropleth Mode */
                <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => {
                      setSelectedMarketId('shoprite-ikeja');
                      setShowMarketSheet(true);
                    }}
                    className="bg-[#fee2e2] border border-[#ba1a1a]/30 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Ikeja LGA</span>
                    <div className="mt-2">
                      <div className="text-base font-extrabold tabular-nums text-[#ba1a1a]">
                        ₦45,000
                      </div>
                      <div className="text-[10px] text-[#ba1a1a] font-semibold">
                        ↑ 8% · 24 reports
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedMarketId('daleko');
                      setShowMarketSheet(true);
                    }}
                    className="bg-[#dcfce7] border border-[#16a34a]/30 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Surulere LGA</span>
                    <div className="mt-2">
                      <div className="text-base font-extrabold tabular-nums text-[#16a34a]">
                        ₦42,000
                      </div>
                      <div className="text-[10px] text-[#16a34a] font-semibold">
                        ↓ 2% · 19 reports
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedMarketId('shoprite-ikeja');
                      setShowMarketSheet(true);
                    }}
                    className="bg-[#fee2e2] border border-[#ba1a1a]/40 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Eti-Osa (Lekki)</span>
                    <div className="mt-2">
                      <div className="text-base font-extrabold tabular-nums text-[#ba1a1a]">
                        ₦48,000
                      </div>
                      <div className="text-[10px] text-[#ba1a1a] font-semibold">
                        ↑ 12% · 31 reports
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedMarketId('alaba-rago');
                      setShowMarketSheet(true);
                    }}
                    className="map-pattern-thin bg-white border border-[#c0c7cf] rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#40484e]">Alimosho LGA</span>
                    <div className="mt-2">
                      <div className="text-sm font-bold tabular-nums text-[#40484e]">
                        ~₦43,000
                      </div>
                      <div className="text-[10px] text-[#71787f] font-semibold">
                        &lt; 5 reports (Striped)
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedMarketId('mile-12');
                      setShowMarketSheet(true);
                    }}
                    className="bg-[#dcfce7] border-2 border-[#16a34a] rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                  >
                    <span className="text-xs font-extrabold text-[#191c1f]">
                      Kosofe (Mile 12)
                    </span>
                    <div className="mt-2">
                      <div className="text-base font-extrabold tabular-nums text-[#16a34a]">
                        ₦41,000
                      </div>
                      <div className="text-[10px] text-[#16a34a] font-bold">
                        ↓ 5% · 42 reports (Best)
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigateTo('log-choice')}
                    className="map-pattern-nodata bg-[#f8f9fd] border border-dashed border-[#c0c7cf] rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#71787f]">Ikorodu LGA</span>
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-[#71787f]">
                        No data (Dotted)
                      </div>
                      <div className="text-[10px] text-[#00567c] underline font-semibold">
                        + Log a trip
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Map Legend Card (30-Day Price Change & Confidence Encoding) */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xs border border-[#e1e2e6] text-[11px]">
                <div className="font-bold text-[#40484e] mb-2 uppercase tracking-wider">
                  30-day Price Change & Data Confidence
                </div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[#16a34a] font-bold">Drop</span>
                  <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-[#16a34a] via-[#fde047] to-[#ba1a1a]"></div>
                  <span className="text-[#ba1a1a] font-bold">+15%</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-[#71787f] pt-2 border-t border-[#e1e2e6]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 inline-block bg-[#00567c] rounded-xs"></span>
                    Solid: High confidence (5+ logs)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 inline-block pattern-hatched border border-[#71787f] rounded-xs"></span>
                    Striped: &lt;5 reports
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 inline-block pattern-dots border border-dashed border-[#71787f] rounded-xs"></span>
                    Dotted: No data
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Market Pin Detail Sheet / Card (screen-market-detail) */}
            <div className="lg:col-span-5 space-y-4">
              {showMarketSheet && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#c0c7cf]/40">
                  <div className="w-10 h-1.5 bg-[#e1e2e6] rounded-full mx-auto mb-4 lg:hidden" />

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-[#191c1f]">
                          {selectedMarket.name}
                        </h2>
                        {selectedMarket.id === 'mile-12' && (
                          <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                            Cheapest Hub
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#71787f] mt-0.5">{selectedMarket.area}</p>
                    </div>
                    <span className="bg-[#f2f3f7] text-[#40484e] text-xs font-bold px-3 py-1 rounded-full tabular-nums">
                      {selectedMarket.distanceKm}km · ~₦{selectedMarket.transitCost} transit
                    </span>
                  </div>

                  {/* Horizontal Item Switcher inside Market Sheet */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 border-b border-[#e1e2e6]">
                    {COMMODITY_META.slice(0, 4).map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setSelectedCommodityKey(c.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedCommodityKey === c.key
                            ? 'bg-[#cbe3f7] text-[#00567c]'
                            : 'text-[#71787f] hover:bg-[#f2f3f7]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* Price & Sparkline Box */}
                  <div className="bg-[#f8f9fd] p-4 rounded-2xl border border-[#e1e2e6] mb-5 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-[#71787f] font-medium mb-0.5">
                        Current Average ({currentCommodityMeta.shortLabel})
                      </div>
                      <div className="text-3xl font-extrabold text-[#191c1f] tabular-nums">
                        ₦{selectedMarketItemStats.price.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#71787f] mt-1">
                        {selectedMarket.reportsCount} reports · Updated {selectedMarket.updatedAgo}
                      </div>
                    </div>

                    {/* 7-Day Mini Sparkline */}
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded mb-2 tabular-nums ${
                          selectedMarketItemStats.deltaPct <= 0
                            ? 'text-[#16a34a] bg-[#dcfce7]'
                            : 'text-[#ba1a1a] bg-[#fee2e2]'
                        }`}
                      >
                        {selectedMarketItemStats.deltaPct <= 0
                          ? `↓ ${Math.abs(selectedMarketItemStats.deltaPct)}% vs last wk`
                          : `↑ ${selectedMarketItemStats.deltaPct}% vs last wk`}
                      </span>
                      <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
                        <path
                          d={selectedMarketItemStats.sparkline}
                          fill="none"
                          stroke={selectedMarketItemStats.deltaPct <= 0 ? '#16a34a' : '#ba1a1a'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Sheet Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSelectTab('markets')}
                      className="w-full py-3 rounded-xl border border-[#00567c] text-[#00567c] font-bold text-xs hover:bg-[#cbe3f7]/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                      <span>Compare markets</span>
                    </button>
                    <button
                      onClick={() => toggleWatchlistMarket(selectedMarket.name)}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                        isWatchlisted
                          ? 'bg-[#dcfce7] text-[#16a34a] border border-[#16a34a]/30'
                          : 'bg-[#00567c] text-white hover:bg-[#003e5a]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
                      </span>
                      <span>{isWatchlisted ? 'On Watchlist' : 'Add to watchlist'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Top Markets Breakdown List */}
              <div className="bg-white rounded-2xl p-4 border border-[#e1e2e6] shadow-2xs space-y-2.5">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-xs font-bold text-[#40484e] uppercase tracking-wider">
                    Lagos Market Breakdown ({currentCommodityMeta.shortLabel})
                  </h3>
                  <button
                    onClick={() => handleSelectTab('markets')}
                    className="text-xs font-bold text-[#00567c] hover:underline whitespace-nowrap shrink-0"
                  >
                    Filter by radius →
                  </button>
                </div>

                {MARKET_PINS.slice(0, 3).map((m) => {
                  const p = m.prices[selectedCommodityKey];
                  const isLow = m.reportsCount < 5;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMarketId(m.id)}
                      className={`p-3 rounded-xl border flex justify-between items-center gap-2 cursor-pointer transition-colors ${
                        selectedMarketId === m.id
                          ? 'bg-[#cbe3f7]/25 border-[#00567c]'
                          : 'bg-[#f8f9fd] border-[#e1e2e6] hover:bg-[#f2f3f7]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#191c1f] truncate">{m.name}</div>
                        <div className="text-xs text-[#71787f]">
                          {m.reportsCount} reports · {m.updatedAgo}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-base tabular-nums text-[#191c1f]">
                          ₦{p.price.toLocaleString()}
                        </div>
                        {isLow ? (
                          <span className="text-[10px] font-bold text-[#71787f] bg-[#e1e2e6] px-1.5 py-0.5 rounded whitespace-nowrap">
                            &lt;5 reports
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-bold tabular-nums whitespace-nowrap ${
                              p.deltaPct <= 0 ? 'text-[#16a34a]' : 'text-[#ba1a1a]'
                            }`}
                          >
                            {p.deltaPct <= 0 ? `↓ ${Math.abs(p.deltaPct)}%` : `↑ ${p.deltaPct}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: WHERE IS IT CHEAPEST? (COMMODITY RADIUS & MARKET COMPARISON)
          ===================================================================== */}
      {activePriceMapTab === 'markets' && (
        <div className="px-4 md:px-6 pt-5 max-w-3xl mx-auto w-full space-y-5">
          {/* Commodity Selector Bar */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {COMMODITY_META.map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedCommodityKey(item.key)}
                className={`px-3 py-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 min-w-0 ${
                  selectedCommodityKey === item.key
                    ? 'bg-[#00567c] text-white shadow-xs'
                    : 'bg-white text-[#40484e] border border-[#e1e2e6] hover:bg-[#f2f3f7]'
                }`}
              >
                <span className="shrink-0">{item.emoji}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search Radius Slider Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e1e2e6] shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold text-[#40484e] mb-2">
              <span>Search Radius</span>
              <span className="text-[#00567c] text-sm tabular-nums">
                Within {searchRadiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
              className="w-full accent-[#00567c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#71787f] mt-1 tabular-nums">
              <span>1 km</span>
              <span>15 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All Markets' },
                { id: 'open', label: 'Open Markets Only' },
                { id: 'supermarket', label: 'Supermarkets Only' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setMarketTypeFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  marketTypeFilter === f.id
                    ? 'bg-[#cbe3f7] text-[#00567c]'
                    : 'bg-white border border-[#e1e2e6] text-[#40484e] hover:bg-[#f2f3f7]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Ranked Markets List */}
          <div className="space-y-3">
            {rankedMarkets.length > 0 ? (
              rankedMarkets.map((market, index) => {
                const itemData = market.prices[selectedCommodityKey];
                const isBest = index === 0;
                const isLowConfidence = market.reportsCount < 5;

                return (
                  <div
                    key={market.id}
                    onClick={() => {
                      setSelectedMarketId(market.id);
                      setShowMarketSheet(true);
                      handleSelectTab('map');
                    }}
                    className={`bg-white p-4 rounded-2xl shadow-xs flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01] ${
                      isBest
                        ? 'border-2 border-[#16a34a] relative overflow-hidden'
                        : 'border border-[#e1e2e6]'
                    }`}
                  >
                    {isBest && (
                      <div className="bg-[#16a34a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg absolute top-0 right-0">
                        BEST VALUE
                      </div>
                    )}

                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${
                          isBest
                            ? 'bg-[#dcfce7] text-[#16a34a]'
                            : 'bg-[#f2f3f7] text-[#40484e]'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#191c1f] text-sm sm:text-base">
                          {market.name}
                        </h3>
                        <p className="text-xs text-[#71787f] mt-0.5 tabular-nums">
                          {market.distanceKm} km away ·{' '}
                          {market.type === 'supermarket' ? 'Supermarket' : 'Open Market'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {isLowConfidence ? (
                            <span className="text-[10px] bg-[#fef3c7] text-[#714800] px-2 py-0.5 rounded font-bold">
                              &lt;5 reports ({market.reportsCount} logs)
                            </span>
                          ) : (
                            <span className="text-[10px] bg-[#f2f3f7] px-2 py-0.5 rounded text-[#40484e] font-medium">
                              {market.reportsCount} reports · {market.updatedAgo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right pt-2">
                      <div className="text-xl font-extrabold text-[#191c1f] tabular-nums">
                        ₦{itemData.price.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs font-bold tabular-nums ${
                          itemData.deltaPct < 0
                            ? 'text-[#16a34a]'
                            : itemData.deltaPct === 0
                            ? 'text-[#71787f]'
                            : 'text-[#ba1a1a]'
                        }`}
                      >
                        {itemData.deltaPct < 0
                          ? `↓ ${Math.abs(itemData.deltaPct)}% this week`
                          : itemData.deltaPct === 0
                          ? '~ 0% this week'
                          : `↑ ${itemData.deltaPct}% this week`}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#e1e2e6]">
                <p className="font-bold text-[#191c1f] mb-1">
                  No markets within {searchRadiusKm} km match this filter
                </p>
                <p className="text-xs text-[#71787f] mb-4">
                  Try increasing the search radius slider above to see more markets across Lagos.
                </p>
                <button
                  onClick={() => {
                    setSearchRadiusKm(25);
                    setMarketTypeFilter('all');
                  }}
                  className="px-4 py-2 bg-[#00567c] text-white text-xs font-bold rounded-lg"
                >
                  Reset Radius to 25 km
                </button>
              </div>
            )}
          </div>

          {/* Community Callout */}
          <div className="bg-[#cbe3f7]/40 border border-[#00567c]/20 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-[#00567c] text-2xl mb-1 block">
              add_location_alt
            </span>
            <h4 className="font-bold text-sm text-[#191c1f]">Help expand the map</h4>
            <p className="text-xs text-[#40484e] mt-1 mb-3">
              Log a trip at your local market to unlock more price comparisons for your
              neighborhood.
            </p>
            <button
              onClick={() => navigateTo('log-choice')}
              className="bg-[#00567c] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#2a6f97] transition-colors"
            >
              Log a market trip
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: BASKET COMPARISON ("WHERE IS YOUR BASKET CHEAPEST TODAY?")
          ===================================================================== */}
      {activePriceMapTab === 'basket' && (
        <div className="px-4 md:px-6 pt-5 max-w-3xl mx-auto w-full space-y-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#191c1f]">
              Where is your basket cheapest today?
            </h2>
            <p className="text-xs text-[#71787f] mt-0.5">
              Based on 12 staple items from your recent household shopping trips
            </p>
          </div>

          {/* User's Usual Market (Baseline Card) */}
          <div className="bg-[#f2f3f7] p-4 sm:p-5 rounded-2xl border border-[#c0c7cf]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#40484e] bg-white px-2 py-0.5 rounded border border-[#e1e2e6]">
                  Your Usual Market
                </span>
                <h3 className="font-bold text-base text-[#191c1f] mt-1.5">Oyingbo Market</h3>
                <p className="text-xs text-[#71787f] mt-0.5">100% (12/12) items covered</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#191c1f] tabular-nums">
                  ₦34,500
                </div>
                <div className="text-[11px] text-[#71787f]">Baseline est. total</div>
              </div>
            </div>
          </div>

          <div className="text-xs font-bold text-[#40484e] uppercase tracking-wider pt-1">
            Ranked Options Nearby
          </div>

          {/* Option 1: Best Value (100% Coverage) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#16a34a] shadow-sm relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-bold text-base text-[#191c1f]">Mile 12 Market</h3>
                  <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-extrabold px-2 py-0.5 rounded">
                    BEST VALUE
                  </span>
                </div>
                <p className="text-xs text-[#71787f] mt-1 pl-8">
                  5.2 km away · Open Market · Updated today
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#191c1f] tabular-nums">
                  ₦31,200
                </div>
                <div className="text-xs font-bold text-[#16a34a] tabular-nums">
                  Save ₦3,300 vs Oyingbo
                </div>
              </div>
            </div>

            {/* Coverage Bar */}
            <div className="pl-8 pt-2 border-t border-[#e1e2e6] flex items-center justify-between text-xs">
              <span className="text-[#40484e] font-medium">Basket coverage:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[#e1e2e6] rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#16a34a]"></div>
                </div>
                <span className="font-bold text-[#16a34a] tabular-nums">100% (12/12)</span>
              </div>
            </div>
          </div>

          {/* Option 2: Partial Coverage (83% Coverage Gate Warning) */}
          <div className="bg-white p-5 rounded-2xl border border-[#e1e2e6] shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#f2f3f7] text-[#40484e] text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-bold text-base text-[#191c1f]">Shoprite Ikeja</h3>
                </div>
                <p className="text-xs text-[#71787f] mt-1 pl-8">
                  3.1 km away · Supermarket · Updated yesterday
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#191c1f] tabular-nums">
                  ₦32,800
                </div>
                <div className="text-xs font-bold text-[#16a34a] tabular-nums">
                  Save ₦1,700 vs Oyingbo
                </div>
              </div>
            </div>

            {/* Coverage Bar with Amber Warning */}
            <div className="pl-8 pt-2 border-t border-[#e1e2e6] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#40484e] font-medium">Basket coverage:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#e1e2e6] rounded-full overflow-hidden">
                    <div className="w-[83%] h-full bg-[#f59e0b]"></div>
                  </div>
                  <span className="font-bold text-[#714800] tabular-nums">83% (10/12)</span>
                </div>
              </div>
              <div className="bg-[#fef3c7]/60 text-[#714800] p-2.5 rounded-lg text-[11px] flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
                <span>
                  Missing prices for <strong>Red Palm Oil, Crayfish</strong>. Estimated using
                  regional average.
                </span>
              </div>
            </div>
          </div>

          {/* Option 3: More Expensive */}
          <div className="bg-white p-5 rounded-2xl border border-[#e1e2e6] shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#f2f3f7] text-[#40484e] text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-base text-[#191c1f]">Tejuosho Market</h3>
                </div>
                <p className="text-xs text-[#71787f] mt-1 pl-8">
                  2.8 km away · Open Market · Updated 2d ago
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#191c1f] tabular-nums">
                  ₦36,100
                </div>
                <div className="text-xs font-bold text-[#ba1a1a] tabular-nums">
                  +₦1,600 more than Oyingbo
                </div>
              </div>
            </div>

            <div className="pl-8 pt-2 border-t border-[#e1e2e6] flex items-center justify-between text-xs">
              <span className="text-[#40484e] font-medium">Basket coverage:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[#e1e2e6] rounded-full overflow-hidden">
                  <div className="w-[92%] h-full bg-[#16a34a]"></div>
                </div>
                <span className="font-bold text-[#16a34a] tabular-nums">92% (11/12)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
