import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const LogSuccessScreen: React.FC = () => {
  const { lastLoggedTrip, navigateTo, isFirstTripDemo, setIsFirstTripDemo, selectTrip } = useMarketPulse();
  const [showFirstTripState, setShowFirstTripState] = useState(isFirstTripDemo);

  const tripTotal = lastLoggedTrip ? lastLoggedTrip.total : 25100;
  const marketName = lastLoggedTrip ? lastLoggedTrip.market : 'Mile 12';

  const handleDone = () => {
    navigateTo('home');
  };

  const handleViewDetails = () => {
    if (lastLoggedTrip) {
      selectTrip(lastLoggedTrip);
    } else {
      navigateTo('history');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-24 px-4 md:px-6 max-w-md mx-auto w-full relative">
      {/* Ambient background accent */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-[#c8e6ff]/40 to-transparent pointer-events-none rounded-b-[3rem]" />

      <div className="flex-1 flex flex-col gap-6 relative z-10">
        {/* Toggle between Standard & First Trip Demo State */}
        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-full border border-[#c0c7cf]/30 shadow-2xs text-xs">
          <span className="text-[#40484e] font-medium">Preview state:</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setShowFirstTripState(false);
                setIsFirstTripDemo(false);
              }}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                !showFirstTripState ? 'bg-[#00567c] text-white' : 'text-[#40484e]'
              }`}
            >
              Movers
            </button>
            <button
              onClick={() => {
                setShowFirstTripState(true);
                setIsFirstTripDemo(true);
              }}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                showFirstTripState ? 'bg-[#00567c] text-white' : 'text-[#40484e]'
              }`}
            >
              First Trip
            </button>
          </div>
        </div>

        {/* Hero Section: Total Spend */}
        {!showFirstTripState ? (
          <section className="flex flex-col items-center justify-center text-center pt-7 pb-8 px-6 bg-white rounded-3xl shadow-xs border border-[#c0c7cf]/40 relative overflow-hidden">
            <div className="flex items-center justify-center w-12 h-12 bg-[#c8e6ff] rounded-full mb-3 text-[#00567c] shadow-inner">
              <span className="material-symbols-outlined text-2xl filled">
                check_circle
              </span>
            </div>

            <h2 className="text-[#40484e] text-xs font-bold mb-1 uppercase tracking-wider">
              Total Spend
            </h2>

            <div className="text-4xl sm:text-5xl font-extrabold text-[#00567c] tabular-nums tracking-tight mb-3">
              ₦{tripTotal.toLocaleString()}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ffdad6]/40 rounded-full border border-[#ffdad6]">
              <span className="material-symbols-outlined text-sm text-[#ba1a1a]">
                arrow_upward
              </span>
              <span className="text-xs font-semibold text-[#ba1a1a]">
                ₦2,400 more than your last shop at {marketName}
              </span>
            </div>
          </section>
        ) : (
          /* Alternative State: First Trip */
          <section className="flex flex-col items-center justify-center text-center pt-8 pb-8 px-6 bg-white rounded-3xl shadow-xs border border-[#c0c7cf]/40">
            <div className="w-14 h-14 bg-[#cbe3f7] text-[#00567c] rounded-2xl flex items-center justify-center mb-4 rotate-3">
              <span className="material-symbols-outlined text-3xl filled">flag</span>
            </div>

            <h2 className="text-[#40484e] text-xs font-bold mb-1 uppercase tracking-wider">
              Total Spend
            </h2>

            <div className="text-4xl sm:text-5xl font-extrabold text-[#00567c] tabular-nums tracking-tight mb-4">
              ₦{tripTotal.toLocaleString()}
            </div>

            <div className="bg-[#eceef1] p-3.5 rounded-xl w-full border border-[#c0c7cf]/30">
              <div className="flex items-start gap-2.5 text-left">
                <span className="material-symbols-outlined text-[#00567c] text-[18px] mt-0.5 shrink-0 filled">
                  info
                </span>
                <p className="text-[#191c1f] text-xs font-medium leading-relaxed">
                  This is your starting point — next time we'll show you what changed.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Movers List Section (Visible on standard state) */}
        {!showFirstTripState && (
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-[#191c1f] text-base">Top Movers</h3>
              <span className="text-[11px] font-semibold text-[#40484e] bg-[#eceef1] px-2.5 py-0.5 rounded-md">
                Since last trip
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-[#c0c7cf]/40 overflow-hidden divide-y divide-[#e1e2e6]/70">
              {lastLoggedTrip && lastLoggedTrip.items && lastLoggedTrip.items.length > 0 ? (
                lastLoggedTrip.items.slice(0, 4).map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center p-3.5 hover:bg-[#f2f3f7] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f2f3f7] flex items-center justify-center text-xl shadow-inner border border-[#e1e2e6]">
                        {item.name.toLowerCase().includes('tomato')
                          ? '🍅'
                          : item.name.toLowerCase().includes('pepper')
                          ? '🌶️'
                          : item.name.toLowerCase().includes('onion')
                          ? '🧅'
                          : item.name.toLowerCase().includes('oil')
                          ? '🛢️'
                          : item.name.toLowerCase().includes('fish')
                          ? '🐟'
                          : item.name.toLowerCase().includes('rice')
                          ? '🌾'
                          : '🛒'}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#191c1f] block leading-tight">{item.name}</span>
                        <span className="text-xs text-[#71787f]">{item.unitDetail || `${item.quantity} ${item.unit}`}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-bold text-sm text-[#00567c] tabular-nums">
                        ₦{item.price.toLocaleString()}
                      </div>
                      {item.previousPrice ? (
                        <span className={`text-[11px] font-semibold tabular-nums flex items-center gap-0.5 ${item.price > item.previousPrice ? 'text-[#ba1a1a]' : 'text-[#006e1c]'}`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {item.price > item.previousPrice ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                          ₦{Math.abs(item.price - item.previousPrice).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#71787f]">Recorded</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Fallback sample item 1 */}
                  <div className="flex justify-between items-center p-3.5 hover:bg-[#f2f3f7] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f2f3f7] flex items-center justify-center text-xl shadow-inner border border-[#e1e2e6]">
                        🍅
                      </div>
                      <span className="font-semibold text-sm text-[#191c1f]">Tomatoes</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-[#ba1a1a] font-bold text-sm gap-0.5 tabular-nums">
                        <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                        +₦300
                      </div>
                      <span className="text-[11px] text-[#ba1a1a] font-semibold tabular-nums">
                        (14% ↑)
                      </span>
                    </div>
                  </div>

                  {/* Fallback sample item 2 */}
                  <div className="flex justify-between items-center p-3.5 hover:bg-[#f2f3f7] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f2f3f7] flex items-center justify-center text-xl shadow-inner border border-[#e1e2e6]">
                        🧅
                      </div>
                      <span className="font-semibold text-sm text-[#191c1f]">Onions</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-[#ba1a1a] font-bold text-sm gap-0.5 tabular-nums">
                        <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                        +₦500
                      </div>
                      <span className="text-[11px] text-[#ba1a1a] font-semibold tabular-nums">
                        (20% ↑)
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="mt-auto pt-4 flex flex-col gap-2.5">
          <button
            id="trip-logged-done-btn"
            onClick={handleDone}
            className="w-full py-4 bg-[#00567c] text-white rounded-xl font-bold text-base hover:bg-[#2a6f97] active:scale-[0.98] transition-all shadow-xs"
          >
            Done
          </button>

          <button
            id="trip-logged-view-details-btn"
            onClick={handleViewDetails}
            className="w-full py-3 text-[#00567c] font-semibold text-sm hover:bg-[#cbe3f7]/30 active:bg-[#cbe3f7]/50 rounded-xl transition-colors"
          >
            View trip details
          </button>
        </section>
      </div>
    </div>
  );
};
