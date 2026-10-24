import React, { useMemo } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { INITIAL_PRICE_MOVERS } from '../data/initialData';

export const HomeScreen: React.FC = () => {
  const {
    navigateTo,
    selectTrip,
    trips,
    budget,
    selectCommodityById,
    activeRegion,
    setActivePriceMapTab,
  } = useMarketPulse();

  const regionalMovers = useMemo(() => {
    return INITIAL_PRICE_MOVERS.map((mover, idx) => {
      const market = activeRegion.markets[idx % activeRegion.markets.length];
      const adjustedPrice = Math.round((mover.price * activeRegion.priceMultiplier) / 100) * 100;
      const adjustedIncrease =
        Math.round((mover.increaseAmount * activeRegion.priceMultiplier) / 50) * 50;
      return {
        ...mover,
        market,
        price: adjustedPrice,
        increaseAmount: adjustedIncrease,
      };
    });
  }, [activeRegion]);

  const spentPacePct = Math.min(100, Math.round((budget.spentSoFar / budget.monthlyTarget) * 100));
  const monthElapsedPct = Math.round((budget.currentDay / budget.totalDays) * 100);
  const isOverPace = spentPacePct > monthElapsedPct;
  const overAmount = Math.max(
    0,
    budget.spentSoFar - budget.monthlyTarget * (budget.currentDay / budget.totalDays)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Top Quick Intelligence Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
        <button
          onClick={() => {
            setActivePriceMapTab('basket');
            navigateTo('price-map');
          }}
          className="bg-white p-3.5 rounded-2xl border border-[#c0c7cf]/40 shadow-2xs hover:border-[#00567c] transition-all flex items-center justify-between gap-2 text-left group min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#191c1f] leading-snug">
                Cheapest Basket
              </div>
              <div className="text-[11px] text-[#16a34a] font-semibold tabular-nums leading-snug mt-0.5">
                Save ₦3,300 at {activeRegion.markets[0]?.replace(' Market', '') || 'Mile 12'}
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#71787f] group-hover:text-[#00567c] text-[18px] shrink-0">
            chevron_right
          </span>
        </button>

        <button
          onClick={() => {
            setActivePriceMapTab('map');
            navigateTo('price-map');
          }}
          className="bg-white p-3.5 rounded-2xl border border-[#c0c7cf]/40 shadow-2xs hover:border-[#00567c] transition-all flex items-center justify-between gap-2 text-left group min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#cbe3f7] text-[#00567c] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">map</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#191c1f] leading-snug">
                Live Price Map
              </div>
              <div className="text-[11px] text-[#40484e] leading-snug mt-0.5">
                National &amp; LGA Choropleth
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#71787f] group-hover:text-[#00567c] text-[18px] shrink-0">
            chevron_right
          </span>
        </button>

        <button
          onClick={() => navigateTo('weekly-report')}
          className="bg-white p-3.5 rounded-2xl border border-[#c0c7cf]/40 shadow-2xs hover:border-[#00567c] transition-all flex items-center justify-between gap-2 text-left group min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00567c] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#191c1f] leading-snug">
                Weekly Wrap-up
              </div>
              <div className="text-[11px] text-[#00567c] font-semibold leading-snug mt-0.5">
                Share on WhatsApp
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#71787f] group-hover:text-[#00567c] text-[18px] shrink-0">
            chevron_right
          </span>
        </button>
      </div>

      {/* Section 1: Monthly Budget Pace Indicator */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-[#c0c7cf]/30 mb-6">
        <div className="flex justify-between items-center gap-2 mb-3">
          <h2 className="text-xs font-bold text-[#40484e] uppercase tracking-wider">
            Monthly Budget Pace
          </h2>
          <button
            id="home-adjust-budget-btn"
            onClick={() => navigateTo('set-budget')}
            className="text-xs font-semibold text-[#00567c] hover:underline shrink-0"
          >
            Adjust
          </button>
        </div>

        <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#191c1f] tabular-nums tracking-tight">
              ₦{budget.spentSoFar.toLocaleString()}
            </p>
            {isOverPace ? (
              <p className="text-sm font-medium text-[#714800] mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] shrink-0">warning</span>
                <span>₦{Math.round(overAmount || 4200).toLocaleString()} over your budget so far</span>
              </p>
            ) : (
              <p className="text-sm font-medium text-[#00567c] mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
                <span>You are on track with your target</span>
              </p>
            )}
          </div>
          <div className="text-xs text-[#40484e] font-medium md:text-right">
            Target:{' '}
            <span className="tabular-nums font-semibold">
              ₦{budget.monthlyTarget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Multi-segment Pace Progress Bar */}
        <div className="relative w-full h-4 rounded-full bg-[#e1e2e6] overflow-hidden isolate mb-2">
          {/* Target line (month elapsed line) */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 w-0.5 bg-[#71787f] z-20"
            style={{ left: `${monthElapsedPct}%` }}
            title={`Day ${budget.currentDay} Target`}
          />
          {/* Safe spend fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#00567c] z-10 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(spentPacePct, monthElapsedPct)}%` }}
          />
          {/* Over pace fill (tertiary tone, never harsh red) */}
          {isOverPace && (
            <div
              className="absolute top-0 bottom-0 bg-[#714800] z-10 transition-all duration-500 ease-out"
              style={{
                left: `${monthElapsedPct}%`,
                width: `${Math.min(spentPacePct - monthElapsedPct, 100 - monthElapsedPct)}%`,
              }}
            />
          )}
        </div>

        <div className="flex justify-between text-xs font-semibold text-[#40484e]">
          <span>
            Day {budget.currentDay} of {budget.totalDays}
          </span>
          <span className="tabular-nums">{spentPacePct}% spent</span>
        </div>
      </section>

      {/* Section 2: Movers this month */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-3.5">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#191c1f] leading-snug">Prices went up</h2>
            <p className="text-xs text-[#71787f] font-medium leading-relaxed mt-0.5">
              In {activeRegion.name} · {activeRegion.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setActivePriceMapTab('markets');
                navigateTo('price-map');
              }}
              className="text-xs font-bold text-[#00567c] bg-[#eceef1] hover:bg-[#cbe3f7]/50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Find cheapest →
            </button>
            <button
              id="home-view-trends-btn"
              onClick={() => navigateTo('commodity-detail')}
              className="text-xs font-bold text-[#00567c] bg-[#eceef1] hover:bg-[#cbe3f7]/50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              All price trends
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {regionalMovers.map((mover) => (
            <div
              key={mover.id}
              onClick={() => {
                if (mover.id === 'mover-1') selectCommodityById('rice-50kg');
                else if (mover.id === 'mover-2') selectCommodityById('tomatoes-fresh');
                else selectCommodityById('palm-oil-25l');
              }}
              className="bg-white rounded-xl p-4 flex flex-col justify-between shadow-xs border border-[#c0c7cf]/30 hover:bg-[#f2f3f7] transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#191c1f] text-base leading-snug">
                    {mover.name}
                  </h3>
                  <p className="text-xs text-[#40484e] mt-0.5">
                    {mover.reportsCount} reports this week
                  </p>
                </div>
                <span className="bg-[#eceef1] text-[#00567c] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 max-w-[140px] sm:max-w-[170px] truncate text-right">
                  {mover.market}
                </span>
              </div>

              <div className="flex justify-between items-end gap-2">
                <p className="text-xl font-bold text-[#191c1f] tabular-nums">
                  ₦{mover.price.toLocaleString()}
                </p>
                <p className="text-sm text-[#ba1a1a] font-bold flex items-center gap-0.5 tabular-nums bg-[#ffdad6]/40 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[16px] font-bold">
                    arrow_upward
                  </span>
                  ₦{mover.increaseAmount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Recent trips */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-[#191c1f]">Recent trips</h2>
          <button
            id="home-view-all-trips-btn"
            onClick={() => navigateTo('history')}
            className="text-sm font-semibold text-[#00567c] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="space-y-2.5">
          {trips.slice(0, 3).map((trip) => (
            <div
              key={trip.id}
              onClick={() => selectTrip(trip)}
              className="bg-white rounded-xl p-4 flex justify-between items-center shadow-xs border border-[#c0c7cf]/30 hover:bg-[#f2f3f7] transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#cbe3f7] text-[#00567c] flex items-center justify-center group-hover:bg-[#00567c] group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1f] text-base leading-snug">
                    {trip.market}
                  </h3>
                  <p className="text-xs text-[#40484e] mt-0.5">
                    {trip.date} • {trip.itemsCount || trip.items.length} items
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-[#191c1f] tabular-nums">
                  ₦{trip.total.toLocaleString()}
                </p>
                {trip.pctChange ? (
                  <div
                    className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 ${
                      trip.isPositiveChange
                        ? 'text-[#ba1a1a] bg-[#ffdad6]/40'
                        : 'text-[#006e1c] bg-[#c4eed0]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px] mr-0.5">
                      {trip.isPositiveChange ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    <span className="tabular-nums">{trip.pctChange}%</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#71787f]">Recorded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button: Log a shop */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
        <button
          id="home-fab-log-shop"
          onClick={() => navigateTo('log-choice')}
          className="bg-[#2a6f97] text-white hover:bg-[#00567c] rounded-2xl px-5 py-3.5 shadow-lg flex items-center gap-2 transition-all active:scale-95 duration-150 group font-semibold text-sm tracking-wide"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">
            add
          </span>
          <span>Log a shop</span>
        </button>
      </div>
    </div>
  );
};
