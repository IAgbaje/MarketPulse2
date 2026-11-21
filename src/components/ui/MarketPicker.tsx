import React, { useMemo, useState } from 'react';
import {
  ALL_NIGERIAN_MARKETS,
  MARKET_TYPE_LABELS,
  MarketVenueType,
  NigerianMarketEntry,
  findMarketEntryByName,
  searchNigerianMarkets,
} from '../../data/nigerianMarketsRegistry';
import { AdaptiveSheet } from './AdaptiveSheet';

interface MarketPickerProps {
  id?: string;
  label?: string;
  value: string;
  activeRegionId: string;
  activeRegionName: string;
  onChange: (marketName: string) => void;
  compact?: boolean;
}

export const MarketPicker: React.FC<MarketPickerProps> = ({
  id = 'market-picker-btn',
  label = 'Market or Supermarket',
  value,
  activeRegionId,
  activeRegionName,
  onChange,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState<'state' | 'nigeria'>('state');
  const [typeFilter, setTypeFilter] = useState<MarketVenueType | 'all'>('all');

  const selectedEntry = useMemo(() => findMarketEntryByName(value), [value]);

  const filteredMarkets = useMemo(() => {
    const queryTrimmed = searchQuery.trim();
    // When user types a search query, search across ALL of Nigeria so they can always find any market
    const base = searchNigerianMarkets(queryTrimmed, {
      stateId: activeRegionId,
      typeFilter,
      limit: 120,
    });

    if (!queryTrimmed && scope === 'state') {
      return base.filter((m) => m.stateId === activeRegionId);
    }
    return base;
  }, [searchQuery, scope, activeRegionId, typeFilter]);

  const groupedByState = useMemo(() => {
    const groups = new Map<string, NigerianMarketEntry[]>();
    filteredMarkets.forEach((m) => {
      const existing = groups.get(m.stateName) || [];
      existing.push(m);
      groups.set(m.stateName, existing);
    });
    return Array.from(groups.entries());
  }, [filteredMarkets]);

  const handleSelect = (marketName: string) => {
    onChange(marketName);
    setOpen(false);
    setSearchQuery('');
  };

  const stateMarketCount = useMemo(
    () => ALL_NIGERIAN_MARKETS.filter((m) => m.stateId === activeRegionId).length,
    [activeRegionId]
  );

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left bg-[#f5f5f7] hover:bg-[#ebebf0] border border-black/[0.06] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#00567c]/20 focus:border-[#00567c] ${
          compact ? 'px-3 py-2' : 'px-3.5 py-2.5'
        }`}
      >
        <span className="text-[11px] font-semibold text-[#6e6e73] flex items-center justify-between gap-2 mb-0.5">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#00567c]">
              {selectedEntry
                ? MARKET_TYPE_LABELS[selectedEntry.type].icon
                : 'storefront'}
            </span>
            <span>{label}</span>
          </span>
          {selectedEntry && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                MARKET_TYPE_LABELS[selectedEntry.type].badgeClass
              }`}
            >
              {MARKET_TYPE_LABELS[selectedEntry.type].shortLabel}
            </span>
          )}
        </span>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#1d1d1f] truncate">
              {value || 'Pick a market or supermarket'}
            </div>
            {selectedEntry && !compact && (
              <div className="text-[11px] text-[#6e6e73] truncate">
                {selectedEntry.city} · {selectedEntry.stateName}
              </div>
            )}
          </div>
          <span className="material-symbols-outlined text-[#86868b] text-[18px] shrink-0">
            unfold_more
          </span>
        </div>
      </button>

      <AdaptiveSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Pick a Market or Supermarket"
        subtitle={`${ALL_NIGERIAN_MARKETS.length}+ major food markets & supermarkets across all 36 states and FCT`}
        maxWidthClass="md:max-w-xl"
      >
        <div className="space-y-3.5">
          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined text-[18px] text-[#6e6e73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Mile 12, Shoprite, Justrite, Wuse, Bodija, Ogbete..."
              autoFocus
              className="w-full min-h-[44px] pl-10 pr-9 py-2.5 bg-[#f5f5f7] border border-black/[0.08] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/15 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-black/[0.06]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Scope & Venue Type Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!searchQuery.trim() && (
              <div className="inline-flex bg-[#f2f2f7] p-0.5 rounded-lg border border-black/[0.05]">
                <button
                  type="button"
                  onClick={() => setScope('state')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    scope === 'state'
                      ? 'bg-white text-[#00567c] shadow-2xs'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {activeRegionName} ({stateMarketCount})
                </button>
                <button
                  type="button"
                  onClick={() => setScope('nigeria')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    scope === 'nigeria'
                      ? 'bg-white text-[#00567c] shadow-2xs'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  All Nigeria ({ALL_NIGERIAN_MARKETS.length})
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'food_market', label: 'Food Markets' },
                  { id: 'supermarket', label: 'Supermarkets' },
                  { id: 'wholesale_hub', label: 'Wholesale' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                    typeFilter === tab.id
                      ? 'bg-[#00567c] text-white'
                      : 'bg-[#f5f5f7] text-[#48484a] hover:bg-[#e5e5ea]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[48vh] overflow-y-auto divide-y divide-black/[0.05] border border-black/[0.06] rounded-2xl bg-white">
            {groupedByState.length > 0 ? (
              groupedByState.map(([stateLabel, entries]) => (
                <div key={stateLabel}>
                  <div className="px-3.5 py-2 bg-[#f5f5f7]/90 text-[11px] font-bold text-[#6e6e73] uppercase tracking-wider sticky top-0 z-10 flex items-center justify-between">
                    <span>{stateLabel}</span>
                    <span>{entries.length}</span>
                  </div>
                  <div className="divide-y divide-black/[0.04]">
                    {entries.map((market) => {
                      const isSelected = market.name.toLowerCase() === value.trim().toLowerCase();
                      const meta = MARKET_TYPE_LABELS[market.type];
                      return (
                        <button
                          key={market.id}
                          type="button"
                          onClick={() => handleSelect(market.name)}
                          className={`w-full text-left px-3.5 py-3 transition-colors flex items-start justify-between gap-3 ${
                            isSelected ? 'bg-[#eef6fb]' : 'hover:bg-[#f5f5f7]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.badgeClass}`}
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                {meta.icon}
                              </span>
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm text-[#1d1d1f]">
                                  {market.name}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#6e6e73] mt-0.5 truncate">
                                {market.city} · {market.popularFor}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${meta.badgeClass}`}
                            >
                              {meta.shortLabel}
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[#00567c] text-[18px]">
                                check_circle
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center space-y-3">
                <span className="material-symbols-outlined text-3xl text-[#aeaeb2]">
                  storefront
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">
                    No directory match for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">
                    You can still use this name for your neighborhood shop or local market.
                  </p>
                </div>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchQuery.trim())}
                    className="px-4 py-2 rounded-xl bg-[#00567c] text-white text-xs font-semibold hover:bg-[#004361] transition-colors"
                  >
                    Use &ldquo;{searchQuery.trim()}&rdquo;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </AdaptiveSheet>
    </>
  );
};
