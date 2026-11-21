import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { FoodIconBadge } from './ui/FoodIconBadge';

export const LogSuccessScreen: React.FC = () => {
  const { lastLoggedTrip, navigateTo, isFirstTripDemo, setIsFirstTripDemo, selectTrip } =
    useMarketPulse();
  const [showFirstTripState, setShowFirstTripState] = useState(isFirstTripDemo);

  const tripTotal = lastLoggedTrip ? lastLoggedTrip.total : 25100;
  const marketName = lastLoggedTrip ? lastLoggedTrip.market : 'Mile 12 Market';

  const handleViewDetails = () => {
    if (lastLoggedTrip) {
      selectTrip(lastLoggedTrip);
    } else {
      navigateTo('history');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16 pb-20 px-4 sm:px-6">
      <div className="max-w-lg mx-auto pt-6 space-y-5">
        {/* Segmented Preview Mode */}
        <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2 rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-xs">
          <span className="text-[#6e6e73] font-medium">Summary view</span>
          <div className="inline-grid grid-cols-2 bg-[#f2f2f7] p-0.5 rounded-xl">
            {(
              [
                { id: false, label: 'Price Changes' },
                { id: true, label: 'First Run' },
              ] as const
            ).map((opt) => {
              const active = showFirstTripState === opt.id;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setShowFirstTripState(opt.id);
                    setIsFirstTripDemo(opt.id);
                  }}
                  className={`relative px-3 py-1 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap ${
                    active ? 'text-[#00567c]' : 'text-[#6e6e73]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="log-success-mode"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Summary Card */}
        {!showFirstTripState ? (
          <section className="flex flex-col items-center text-center py-8 px-6 bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-12 h-12 bg-[#ecfdf5] rounded-2xl flex items-center justify-center text-[#15803d]">
              <span className="material-symbols-outlined text-2xl filled">check_circle</span>
            </div>

            <div className="text-xs font-semibold text-[#6e6e73]">
              Market Run Saved · {marketName}
            </div>

            <div className="font-display font-mono-num text-4xl sm:text-5xl font-extrabold text-[#1d1d1f] tracking-tight">
              ₦{tripTotal.toLocaleString()}
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c81e1e]">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              <span className="font-mono-num">
                ₦2,400 higher than your last run at {marketName}
              </span>
            </div>
          </section>
        ) : (
          <section className="flex flex-col items-center text-center py-8 px-6 bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="w-12 h-12 bg-[#d4e8f7] text-[#00567c] rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl filled">flag</span>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#6e6e73]">First Market Run Saved</div>
              <div className="font-display font-mono-num text-4xl sm:text-5xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
                ₦{tripTotal.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#f5f5f7] p-3.5 rounded-xl w-full flex items-start gap-2.5 text-left">
              <span className="material-symbols-outlined text-[#00567c] text-[18px] mt-0.5 shrink-0">
                info
              </span>
              <p className="text-[#48484a] text-xs leading-relaxed">
                Nice start! Next time you buy these same items, we&apos;ll immediately show you what
                went up or dropped in price.
              </p>
            </div>
          </section>
        )}

        {/* Logged Items List with Food Icons */}
        {!showFirstTripState && (
          <section className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-[#1d1d1f]">Items You Logged</h2>
              <span className="text-xs text-[#6e6e73]">Vs last time</span>
            </div>

            <div className="divide-y divide-black/[0.05]">
              {lastLoggedTrip && lastLoggedTrip.items && lastLoggedTrip.items.length > 0 ? (
                lastLoggedTrip.items.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-center gap-3 px-5 py-3.5 hover:bg-[#f5f5f7]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FoodIconBadge name={item.name} category={item.category} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-[#1d1d1f] block truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-[#6e6e73]">
                          {item.unitDetail || `${item.quantity} ${item.unit}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono-num font-bold text-sm text-[#1d1d1f]">
                        ₦{item.price.toLocaleString()}
                      </div>
                      {item.previousPrice ? (
                        <span
                          className={`font-mono-num text-[11px] font-semibold inline-flex items-center gap-0.5 ${
                            item.price > item.previousPrice ? 'text-[#c81e1e]' : 'text-[#15803d]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {item.price > item.previousPrice ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                          ₦{Math.abs(item.price - item.previousPrice).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#86868b]">Saved</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FoodIconBadge name="Tomatoes" category="Produce" size="sm" />
                      <span className="font-semibold text-sm text-[#1d1d1f]">Tomatoes</span>
                    </div>
                    <span className="font-mono-num text-sm font-bold text-[#c81e1e]">
                      +₦300 (↑ 14%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FoodIconBadge name="Onions" category="Produce" size="sm" />
                      <span className="font-semibold text-sm text-[#1d1d1f]">Onions</span>
                    </div>
                    <span className="font-mono-num text-sm font-bold text-[#c81e1e]">
                      +₦500 (↑ 20%)
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            id="trip-logged-done-btn"
            type="button"
            onClick={() => navigateTo('home')}
            className="w-full min-h-[48px] py-3 bg-[#00567c] text-white rounded-xl font-semibold text-sm hover:bg-[#004361] transition-colors shadow-xs"
          >
            Done · Back to Home
          </button>

          <button
            id="trip-logged-view-details-btn"
            type="button"
            onClick={handleViewDetails}
            className="w-full min-h-[44px] py-2.5 text-[#00567c] font-semibold text-xs hover:bg-[#d4e8f7]/40 rounded-xl transition-colors"
          >
            See Full Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
