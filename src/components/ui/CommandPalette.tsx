import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMarketPulse } from '../../context/MarketPulseContext';
import { MARKET_PINS } from '../../data/priceMapData';
import { FoodIconBadge } from './FoodIconBadge';
import { ItemCategory } from '../../types';

interface CommandItem {
  id: string;
  group: 'Quick Actions' | 'Food Prices' | 'Market Trips' | 'Markets & States';
  title: string;
  subtitle: string;
  trailing?: string;
  icon: string;
  foodName?: string;
  foodCategory?: ItemCategory;
  onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    navigateTo,
    setActivePriceMapTab,
    commodities,
    selectCommodityById,
    trips,
    selectTrip,
    regions,
    activeRegion,
    setActiveRegionId,
    exportData,
  } = useMarketPulse();

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isCommandPaletteOpen]);

  const allCommands = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = [
      {
        id: 'act-log',
        group: 'Quick Actions',
        title: 'Record Market Run',
        subtitle: 'Type what you bought or snap a paper receipt',
        icon: 'add_circle',
        onSelect: () => navigateTo('log-choice'),
      },
      {
        id: 'act-scan',
        group: 'Quick Actions',
        title: 'Snap Paper Receipt',
        subtitle: 'Scan a receipt photo to fill in prices automatically',
        icon: 'document_scanner',
        onSelect: () => navigateTo('log-scan'),
      },
      {
        id: 'act-basket',
        group: 'Quick Actions',
        title: 'Find Cheapest Market Bag',
        subtitle: 'Compare your usual 12 staples across nearby markets',
        icon: 'shopping_basket',
        onSelect: () => {
          setActivePriceMapTab('basket');
          navigateTo('price-map', { tab: 'basket' });
        },
      },
      {
        id: 'act-budget',
        group: 'Quick Actions',
        title: 'Set Monthly Food Budget',
        subtitle: 'Update your monthly food money and food group limits',
        icon: 'tune',
        onSelect: () => navigateTo('set-budget'),
      },
      {
        id: 'act-weekly',
        group: 'Quick Actions',
        title: 'Open Weekly Summary',
        subtitle: 'See this week’s spending & share on WhatsApp',
        icon: 'insights',
        onSelect: () => navigateTo('weekly-report'),
      },
      {
        id: 'act-export-csv',
        group: 'Quick Actions',
        title: 'Download Records (CSV)',
        subtitle: 'Save a spreadsheet of all your market trips',
        icon: 'download',
        onSelect: () => {
          exportData('csv');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'act-sync',
        group: 'Quick Actions',
        title: 'Keep Records Safe',
        subtitle: 'Add recovery contact or back up with Google',
        icon: 'cloud_sync',
        onSelect: () => navigateTo('account-security'),
      },
    ];

    const commodityItems: CommandItem[] = commodities.map((c) => {
      const regionalPrice = Math.round((c.latestPrice * activeRegion.priceMultiplier) / 100) * 100;
      return {
        id: `cmd-c-${c.id}`,
        group: 'Food Prices',
        title: c.name,
        subtitle: `${c.unitDescription} · ${c.crowdReportsCount} shoppers reported`,
        trailing: `₦${regionalPrice.toLocaleString('en-NG')}`,
        icon: 'trending_up',
        foodName: c.name,
        foodCategory: c.category as ItemCategory,
        onSelect: () => selectCommodityById(c.id),
      };
    });

    const tripItems: CommandItem[] = trips.slice(0, 6).map((t) => ({
      id: `cmd-t-${t.id}`,
      group: 'Market Trips',
      title: t.market,
      subtitle: `${t.date} · ${t.itemsCount || t.items.length} items`,
      trailing: `₦${t.total.toLocaleString('en-NG')}`,
      icon: 'receipt_long',
      onSelect: () => selectTrip(t),
    }));

    const marketItems: CommandItem[] = MARKET_PINS.map((m) => ({
      id: `cmd-m-${m.id}`,
      group: 'Markets & States',
      title: m.name,
      subtitle: `${m.area} · ${m.distanceKm} km away`,
      trailing: `${m.reportsCount} reports`,
      icon: 'storefront',
      onSelect: () => {
        setActivePriceMapTab('map');
        navigateTo('price-map', { tab: 'map' });
      },
    }));

    const regionItems: CommandItem[] = regions.map((r) => ({
      id: `cmd-r-${r.id}`,
      group: 'Markets & States',
      title: `Switch to ${r.name}`,
      subtitle: r.tagline,
      trailing: r.id === activeRegion.id ? 'Active' : undefined,
      icon: 'location_on',
      onSelect: () => {
        setActiveRegionId(r.id);
        setCommandPaletteOpen(false);
      },
    }));

    return [...actions, ...commodityItems, ...tripItems, ...marketItems, ...regionItems];
  }, [
    commodities,
    trips,
    regions,
    activeRegion,
    navigateTo,
    setActivePriceMapTab,
    selectCommodityById,
    selectTrip,
    setActiveRegionId,
    exportData,
    setCommandPaletteOpen,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands.slice(0, 12);
    return allCommands.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) =>
        filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0
      );
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault();
      filtered[activeIdx].onSelect();
      setCommandPaletteOpen(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<CommandItem['group'], { item: CommandItem; flatIndex: number }[]>();
    filtered.forEach((item, flatIndex) => {
      const list = map.get(item.group) || [];
      list.push({ item, flatIndex });
      map.set(item.group, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick Search"
          className="fixed inset-0 z-[85] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-[6px]"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 480, damping: 36 }}
            onKeyDown={handleKeyDown}
            className="relative z-10 w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col max-h-[72vh]"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/[0.06]">
              <span className="material-symbols-outlined text-[#00567c] text-[22px] shrink-0">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rice, tomatoes, Mile 12, trips, or budget..."
                className="flex-1 bg-transparent text-sm sm:text-base text-[#1d1d1f] placeholder-[#86868b] outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] px-2 py-1 rounded-md hover:bg-[#f2f2f7]"
                >
                  Clear
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono-num text-[#6e6e73] bg-[#f2f2f7] rounded border border-black/[0.06]">
                Esc
              </kbd>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto no-scrollbar p-2 space-y-3">
              {grouped.length > 0 ? (
                grouped.map(([groupName, entries]) => (
                  <div key={groupName}>
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#86868b]">
                      {groupName}
                    </div>
                    <div className="space-y-0.5">
                      {entries.map(({ item, flatIndex }) => {
                        const isSelected = flatIndex === activeIdx;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setActiveIdx(flatIndex)}
                            onClick={() => {
                              item.onSelect();
                              setCommandPaletteOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                              isSelected
                                ? 'bg-[#00567c]/[0.09] text-[#003852]'
                                : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {item.foodName ? (
                                <FoodIconBadge
                                  name={item.foodName}
                                  category={item.foodCategory}
                                  size="xs"
                                />
                              ) : (
                                <span
                                  className={`material-symbols-outlined text-[20px] shrink-0 ${
                                    isSelected ? 'text-[#00567c]' : 'text-[#6e6e73]'
                                  }`}
                                >
                                  {item.icon}
                                </span>
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">{item.title}</div>
                                <div className="text-xs text-[#6e6e73] truncate">
                                  {item.subtitle}
                                </div>
                              </div>
                            </div>
                            {item.trailing && (
                              <span className="text-xs font-mono-num font-semibold text-[#3a3a3c] shrink-0 whitespace-nowrap">
                                {item.trailing}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 px-6 text-center">
                  <span className="material-symbols-outlined text-3xl text-[#aeaeb2] mb-2 block">
                    search_off
                  </span>
                  <p className="text-sm font-semibold text-[#1d1d1f]">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-1">
                    Try searching for Rice, Tomatoes, Mile 12, Abuja, or Budget.
                  </p>
                </div>
              )}
            </div>

            {/* Keyboard Footer */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-black/[0.06] bg-[#f5f5f7]/80 text-[11px] text-[#6e6e73]">
              <div className="flex items-center gap-3">
                <span>↑↓ Move</span>
                <span>↵ Open</span>
                <span>Esc Close</span>
              </div>
              <span>MarketPulse Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
