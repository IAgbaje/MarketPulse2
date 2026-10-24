import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { Trip } from '../types';

export const TripHistoryScreen: React.FC = () => {
  const { trips, selectTrip, navigateTo } = useMarketPulse();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = trips.filter((t) =>
    t.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#191c1f] tracking-tight mb-1">
          Trip history
        </h2>
        <p className="text-[#40484e] text-sm">
          Your recent market visits and total spend.
        </p>

        {/* Search Bar */}
        {trips.length > 0 && (
          <div className="mt-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71787f] text-[20px]">
              search
            </span>
            <input
              id="trip-history-search-input"
              type="text"
              placeholder="Search markets or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#c0c7cf]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#191c1f] placeholder-[#71787f] focus:outline-none focus:ring-2 focus:ring-[#00567c]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71787f] hover:text-[#191c1f]"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* History List */}
      {filteredTrips.length > 0 ? (
        <div id="history-list" className="space-y-3">
          {filteredTrips.map((trip: Trip) => (
            <div
              key={trip.id}
              onClick={() => selectTrip(trip)}
              className="block bg-white rounded-xl p-4 border border-[#c0c7cf]/40 hover:bg-[#f2f3f7] transition-all shadow-xs active:scale-[0.99] duration-150 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-[#191c1f] text-base">
                    {trip.market}
                  </div>
                  <div className="text-xs text-[#40484e] mt-0.5">
                    {trip.date} • {trip.itemsCount || trip.items.length} items
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg tabular-nums text-[#191c1f]">
                    ₦{trip.total.toLocaleString()}
                  </div>
                  {trip.pctChange !== undefined ? (
                    <div
                      className={`inline-flex items-center text-xs mt-0.5 px-2 py-0.5 rounded font-semibold ${
                        trip.isPositiveChange
                          ? 'text-[#ba1a1a] bg-[#ffdad6]/40'
                          : 'text-[#006e1c] bg-[#c4eed0]/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] mr-0.5">
                        {trip.isPositiveChange ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span className="tabular-nums">{trip.pctChange}%</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-xs text-[#71787f] mt-0.5 px-1.5 py-0.5">
                      <span className="font-medium">No previous data</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          id="empty-state"
          className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-[#c0c7cf]/30"
        >
          <div className="w-20 h-20 bg-[#eceef1] rounded-full flex items-center justify-center mb-5 text-[#71787f]">
            <span className="material-symbols-outlined text-4xl">receipt_long</span>
          </div>
          <h3 className="text-lg font-bold text-[#191c1f] mb-1">
            {searchQuery ? 'No trips matched your search' : 'No trips recorded yet'}
          </h3>
          <p className="text-[#40484e] text-sm mb-6 max-w-[280px]">
            {searchQuery
              ? 'Try searching with another market name or food item.'
              : 'Log your first trip to see your history here.'}
          </p>
          <button
            id="trip-history-log-new-btn"
            onClick={() => navigateTo('log-choice')}
            className="bg-[#00567c] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#2a6f97] active:scale-95 transition-all shadow-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Log new trip</span>
          </button>
        </div>
      )}
    </div>
  );
};
