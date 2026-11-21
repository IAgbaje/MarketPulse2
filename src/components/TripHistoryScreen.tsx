import React, { useState, useMemo } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { Trip } from '../types';
import { TripDetailPanel } from './TripDetailPanel';
import { FoodIconBadge } from './ui/FoodIconBadge';

export const TripHistoryScreen: React.FC = () => {
  const { trips, selectedTrip, setSelectedTripOnly, selectTrip, navigateTo } = useMarketPulse();
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<string>('all');

  const uniqueMarkets = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.market)));
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchesMarket = marketFilter === 'all' || t.market === marketFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesMarket;
      return (
        matchesMarket &&
        (t.market.toLowerCase().includes(q) ||
          t.date.toLowerCase().includes(q) ||
          t.items.some((i) => i.name.toLowerCase().includes(q)))
      );
    });
  }, [trips, marketFilter, searchQuery]);

  const activeDesktopTrip: Trip | null = useMemo(() => {
    if (selectedTrip && filteredTrips.some((t) => t.id === selectedTrip.id)) {
      return selectedTrip;
    }
    return filteredTrips[0] || null;
  }, [selectedTrip, filteredTrips]);

  const totalFilteredSpend = useMemo(
    () => filteredTrips.reduce((acc, t) => acc + (t.total || 0), 0),
    [filteredTrips]
  );

  const handleTripClick = (trip: Trip) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSelectedTripOnly(trip);
    } else {
      selectTrip(trip);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-28 lg:pb-12">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            My Market Trips
          </h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} ·{' '}
            <span className="font-mono-num font-semibold text-[#1d1d1f]">
              ₦{totalFilteredSpend.toLocaleString('en-NG')}
            </span>{' '}
            total spent
          </p>
        </div>

        <button
          id="trip-history-log-new-top-btn"
          type="button"
          onClick={() => navigateTo('log-choice')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00567c] hover:bg-[#004361] active:scale-[0.99] text-white text-xs font-semibold transition-all whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Record Market Run</span>
        </button>
      </div>

      {/* Desktop Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Master Pane: Search, Filters & Trip List */}
        <div className="lg:col-span-5 space-y-4">
          {trips.length > 0 && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] text-[19px]">
                  search
                </span>
                <input
                  id="trip-history-search-input"
                  type="text"
                  placeholder="Search by market, date, or food item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/[0.08] rounded-xl pl-10 pr-16 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/15 outline-none transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Interactive Market Filter Bar */}
              {uniqueMarkets.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    type="button"
                    onClick={() => setMarketFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      marketFilter === 'all'
                        ? 'bg-[#00567c] text-white'
                        : 'bg-white border border-black/[0.07] text-[#3a3a3c] hover:bg-[#e8e8ed]'
                    }`}
                  >
                    All markets
                  </button>
                  {uniqueMarkets.map((mkt) => (
                    <button
                      key={mkt}
                      type="button"
                      onClick={() => setMarketFilter(mkt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        marketFilter === mkt
                          ? 'bg-[#00567c] text-white'
                          : 'bg-white border border-black/[0.07] text-[#3a3a3c] hover:bg-[#e8e8ed]'
                      }`}
                    >
                      {mkt.replace(' Market', '')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trips List */}
          {filteredTrips.length > 0 ? (
            <div
              id="history-list"
              className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden divide-y divide-black/[0.05]"
            >
              {filteredTrips.map((trip: Trip) => {
                const isSelectedDesktop = activeDesktopTrip?.id === trip.id;
                const leadItem = trip.items[0];
                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => handleTripClick(trip)}
                    className={`w-full px-4 py-3.5 flex justify-between items-center gap-3 text-left transition-colors ${
                      isSelectedDesktop
                        ? 'lg:bg-[#00567c]/[0.07] hover:bg-[#00567c]/[0.1]'
                        : 'hover:bg-[#f5f5f7]/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {leadItem ? (
                        <FoodIconBadge
                          name={leadItem.name}
                          category={leadItem.category}
                          size="sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[#f2f2f7] text-[#00567c] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1d1d1f] text-sm sm:text-[15px] truncate">
                          {trip.market}
                        </div>
                        <div className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1.5">
                          <span>{trip.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{trip.itemsCount || trip.items.length} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono-num font-bold text-base text-[#1d1d1f]">
                          ₦{trip.total.toLocaleString('en-NG')}
                        </div>
                        {trip.pctChange ? (
                          <div
                            className={`text-xs font-mono-num font-semibold flex items-center justify-end gap-0.5 mt-0.5 ${
                              trip.isPositiveChange ? 'text-[#b91c1c]' : 'text-[#15803d]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {trip.isPositiveChange ? 'arrow_upward' : 'arrow_downward'}
                            </span>
                            <span>{trip.pctChange}%</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#86868b] mt-0.5">Saved</div>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-[#aeaeb2] lg:hidden">
                        chevron_right
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              id="empty-state"
              className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-black/[0.06] shadow-2xs"
            >
              <div className="w-16 h-16 bg-[#f2f2f7] rounded-2xl flex items-center justify-center mb-4 text-[#6e6e73]">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <h3 className="font-display text-base font-bold text-[#1d1d1f] mb-1">
                {searchQuery || marketFilter !== 'all'
                  ? 'No trips match your search'
                  : 'No market trips saved yet'}
              </h3>
              <p className="text-[#6e6e73] text-xs sm:text-sm mb-5 max-w-xs">
                {searchQuery || marketFilter !== 'all'
                  ? 'Try clearing your search or checking all markets.'
                  : 'Record your first market run to keep track of spending and food prices.'}
              </p>
              {searchQuery || marketFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMarketFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#f2f2f7] text-[#1d1d1f] text-xs font-semibold hover:bg-[#e5e5ea]"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  id="trip-history-log-new-btn"
                  type="button"
                  onClick={() => navigateTo('log-choice')}
                  className="bg-[#00567c] text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-[#004361] transition-colors flex items-center gap-1.5 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Record Market Run</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Detail Inspector Pane (Desktop Master-Detail) */}
        <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-22">
          {activeDesktopTrip ? (
            <TripDetailPanel trip={activeDesktopTrip} />
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.06] p-12 text-center shadow-2xs">
              <span className="material-symbols-outlined text-4xl text-[#aeaeb2] mb-2 block">
                receipt_long
              </span>
              <p className="font-display font-semibold text-base text-[#1d1d1f]">
                Pick a trip to see your receipt
              </p>
              <p className="text-xs text-[#6e6e73] mt-1">
                Click any market run on the left to review items, update prices, or check food price trends.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
