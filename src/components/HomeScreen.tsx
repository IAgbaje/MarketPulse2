import React, { useMemo } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { INITIAL_PRICE_MOVERS } from '../data/initialData';
import {
  LATEST_OFFICIAL_CPI,
  computeBasketInflationSummary,
} from '../data/foodInflationData';
import { FoodIconBadge } from './ui/FoodIconBadge';

export const HomeScreen: React.FC = () => {
  const {
    navigateTo,
    selectTrip,
    trips,
    budget,
    commodities,
    selectCommodityById,
    activeRegion,
    setActivePriceMapTab,
    userProfile,
  } = useMarketPulse();

  const basketInflation = useMemo(
    () => computeBasketInflationSummary(commodities, activeRegion.priceMultiplier || 1),
    [commodities, activeRegion.priceMultiplier]
  );

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

  const spentPacePct = Math.min(100, Math.round((budget.spentSoFar / (budget.monthlyTarget || 1)) * 100));
  const monthElapsedPct = Math.round((budget.currentDay / (budget.totalDays || 30)) * 100);
  const isOverPace = spentPacePct > monthElapsedPct;
  const remainingBudget = Math.max(0, budget.monthlyTarget - budget.spentSoFar);
  const overAmount = Math.max(
    0,
    budget.spentSoFar - budget.monthlyTarget * (budget.currentDay / (budget.totalDays || 30))
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-[72px] lg:pt-24 pb-24 lg:pb-12">
      {/* Desktop Welcome Greeting */}
      <div className="hidden lg:flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-extrabold text-[#1d1d1f] tracking-tight">
            Welcome back, {userProfile.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">
            {activeRegion.name} · {activeRegion.tagline}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('weekly-report')}
            className="px-4 py-2 rounded-xl bg-white border border-black/[0.08] hover:bg-[#e8e8ed]/70 text-xs font-semibold text-[#1d1d1f] transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00567c]">insights</span>
            <span>Weekly Summary</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('log-scan')}
            className="px-4 py-2 rounded-xl bg-[#00567c]/10 hover:bg-[#00567c] text-[#00567c] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">document_scanner</span>
            <span>Snap Receipt</span>
          </button>
        </div>
      </div>

      {/* Top Row: Budget Pace Hero + Quick Intelligence Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        {/* Monthly Food Money Hero (7 cols on desktop) */}
        <section className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center gap-2 mb-4">
              <h2 className="font-display text-sm font-semibold text-[#6e6e73]">
                This Month&apos;s Food Money
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo('budget')}
                  className="text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                >
                  See breakdown
                </button>
                <button
                  id="home-adjust-budget-btn"
                  type="button"
                  onClick={() => navigateTo('set-budget')}
                  className="text-xs font-semibold text-[#00567c] hover:underline shrink-0"
                >
                  Change budget
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#1d1d1f] tabular-nums tracking-tight">
                  ₦{budget.spentSoFar.toLocaleString('en-NG')}
                </p>
                {isOverPace ? (
                  <p className="text-sm font-medium text-[#b45309] mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] shrink-0">warning</span>
                    <span>
                      ₦{Math.round(overAmount || 4200).toLocaleString('en-NG')} faster than planned
                      for Day {budget.currentDay}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm font-medium text-[#15803d] mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
                    <span>Your food money is stretching nicely this month</span>
                  </p>
                )}
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end gap-4 sm:gap-1 text-xs text-[#6e6e73]">
                <div>
                  Budget{' '}
                  <span className="font-mono-num font-semibold text-[#1d1d1f]">
                    ₦{budget.monthlyTarget.toLocaleString('en-NG')}
                  </span>
                </div>
                <div>
                  Money left{' '}
                  <span className="font-mono-num font-semibold text-[#00567c]">
                    ₦{remainingBudget.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Multi-segment Pace Progress Bar */}
            <div className="relative w-full h-3 rounded-full bg-[#f2f2f7] overflow-hidden isolate mb-2.5">
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 w-0.5 bg-[#1d1d1f]/65 z-20"
                style={{ left: `${monthElapsedPct}%` }}
                title={`Day ${budget.currentDay} expected pace`}
              />
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#00567c] z-10 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(spentPacePct, monthElapsedPct)}%` }}
              />
              {isOverPace && (
                <div
                  className="absolute top-0 bottom-0 bg-[#d97706] z-10 transition-all duration-500 ease-out"
                  style={{
                    left: `${monthElapsedPct}%`,
                    width: `${Math.min(spentPacePct - monthElapsedPct, 100 - monthElapsedPct)}%`,
                  }}
                />
              )}
            </div>

            <div className="flex justify-between text-xs font-medium text-[#6e6e73]">
              <span>
                Day {budget.currentDay} of {budget.totalDays}
              </span>
              <span className="font-mono-num font-semibold text-[#1d1d1f]">
                {spentPacePct}% spent
              </span>
            </div>
          </div>
        </section>

        {/* Quick Market Tools (5 cols on desktop) */}
        <section className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => {
              setActivePriceMapTab('basket');
              navigateTo('price-map', { tab: 'basket' });
            }}
            className="bg-white p-4 rounded-2xl border border-black/[0.06] hover:border-[#00567c]/35 hover:shadow-xs transition-all flex items-center justify-between gap-3 text-left group min-h-[68px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[#15803d] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                  Cheapest Market Bag
                </div>
                <div className="text-xs text-[#15803d] font-medium tabular-nums leading-snug mt-0.5 truncate">
                  Save ₦3,300 at {activeRegion.markets[0]?.replace(' Market', '') || 'Mile 12'}
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#aeaeb2] group-hover:text-[#00567c] group-hover:translate-x-0.5 transition-all text-[20px] shrink-0">
              chevron_right
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePriceMapTab('map');
              navigateTo('price-map', { tab: 'map' });
            }}
            className="bg-white p-4 rounded-2xl border border-black/[0.06] hover:border-[#00567c]/35 hover:shadow-xs transition-all flex items-center justify-between gap-3 text-left group min-h-[68px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/70 text-[#00567c] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">map</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                  Check Prices Around You
                </div>
                <div className="text-xs text-[#6e6e73] leading-snug mt-0.5 truncate">
                  Compare states and nearby markets
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#aeaeb2] group-hover:text-[#00567c] group-hover:translate-x-0.5 transition-all text-[20px] shrink-0">
              chevron_right
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('weekly-report')}
            className="bg-white p-4 rounded-2xl border border-black/[0.06] hover:border-[#00567c]/35 hover:shadow-xs transition-all flex items-center justify-between gap-3 text-left group min-h-[68px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#00567c] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                  Weekly Summary
                </div>
                <div className="text-xs text-[#00567c] font-medium leading-snug mt-0.5 truncate">
                  Ready to share on WhatsApp
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#aeaeb2] group-hover:text-[#00567c] group-hover:translate-x-0.5 transition-all text-[20px] shrink-0">
              chevron_right
            </span>
          </button>
        </section>
      </div>

      {/* Official CBN / NBS Multi-Year Food & Macro Pulse Strip */}
      <section className="mb-6 bg-white rounded-2xl p-4 sm:px-5 border border-black/[0.06] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#eef6fb] border border-[#00567c]/15 text-[#00567c] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">monitoring</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <h2 className="font-display text-sm font-bold text-[#1d1d1f]">
                Nigeria NBS &amp; CBN Observatory (2023–2026)
              </h2>
              <span aria-hidden="true" className="text-[#aeaeb2]">·</span>
              <span className="font-semibold text-[#00567c]">{LATEST_OFFICIAL_CPI.month}</span>
            </div>
            <p className="text-xs text-[#6e6e73] mt-0.5 leading-snug">
              Food CPI{' '}
              <strong className="font-mono-num text-[#1d1d1f]">
                {LATEST_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}%
              </strong>{' '}
              · MPR{' '}
              <strong className="font-mono-num text-[#1d1d1f]">
                {LATEST_OFFICIAL_CPI.cbnMpr.toFixed(1)}%
              </strong>{' '}
              · NFEM{' '}
              <strong className="font-mono-num text-[#1d1d1f]">
                ₦{LATEST_OFFICIAL_CPI.usdNgnOfficial.toLocaleString('en-NG')}/$
              </strong>{' '}
              · {activeRegion.state.replace(' State', '')} {commodities.length}-staple basket:{' '}
              <strong
                className={`font-mono-num ${
                  basketInflation.basketMoMPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                }`}
              >
                {basketInflation.basketMoMPct > 0 ? '+' : ''}
                {basketInflation.basketMoMPct.toFixed(1)}% MoM
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('commodity-detail', { entityId: 'inflation' })}
          className="px-4 py-2.5 min-h-[42px] rounded-xl bg-[#00567c]/10 hover:bg-[#00567c] text-[#00567c] hover:text-white text-xs font-semibold transition-colors whitespace-nowrap self-start md:self-auto shrink-0 flex items-center gap-1.5"
        >
          <span>Explore 2023–2026 Data</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </section>

      {/* Bottom Row: Side-by-side Price Movers & Recent Market Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Section 2: Prices That Went Up */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-[#1d1d1f]">
                Prices that went up
              </h2>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                {activeRegion.name} · Latest shopper reports
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActivePriceMapTab('markets');
                  navigateTo('price-map', { tab: 'markets' });
                }}
                className="text-xs font-semibold text-[#00567c] hover:bg-[#f2f2f7] px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Where it&apos;s cheaper
              </button>
              <button
                id="home-view-trends-btn"
                type="button"
                onClick={() => navigateTo('commodity-detail')}
                className="text-xs font-semibold text-[#00567c] hover:bg-[#f2f2f7] px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                All prices →
              </button>
            </div>
          </div>

          <div className="divide-y divide-black/[0.05]">
            {regionalMovers.map((mover) => (
              <button
                key={mover.id}
                type="button"
                onClick={() => {
                  if (mover.id === 'mover-1') selectCommodityById('palm-oil-5l');
                  else if (mover.id === 'mover-2') selectCommodityById('onions-dry');
                  else selectCommodityById('veg-oil-5l');
                }}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3.5 hover:bg-[#f5f5f7]/70 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <FoodIconBadge name={mover.name} size="md" />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-[15px] text-[#1d1d1f] group-hover:text-[#00567c] transition-colors truncate">
                      {mover.name}
                    </div>
                    <div className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="truncate">{mover.market}</span>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">{mover.reportsCount} shoppers reported</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono-num text-base font-bold text-[#1d1d1f]">
                    ₦{mover.price.toLocaleString('en-NG')}
                  </div>
                  <div className="text-xs text-[#b91c1c] font-semibold flex items-center justify-end gap-0.5 font-mono-num mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    <span>₦{mover.increaseAmount.toLocaleString('en-NG')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 3: Recent Market Runs */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-[#1d1d1f]">
                Recent market runs
              </h2>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                {trips.length} saved {trips.length === 1 ? 'trip' : 'trips'}
              </p>
            </div>
            <button
              id="home-view-all-trips-btn"
              type="button"
              onClick={() => navigateTo('history')}
              className="text-xs font-semibold text-[#00567c] hover:bg-[#f2f2f7] px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              See all →
            </button>
          </div>

          {trips.length > 0 ? (
            <div className="divide-y divide-black/[0.05]">
              {trips.slice(0, 4).map((trip) => {
                const leadItem = trip.items[0];
                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => selectTrip(trip)}
                    className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#f5f5f7]/70 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {leadItem ? (
                        <FoodIconBadge
                          name={leadItem.name}
                          category={leadItem.category}
                          size="md"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#f2f2f7] text-[#00567c] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-[15px] text-[#1d1d1f] group-hover:text-[#00567c] transition-colors truncate">
                          {trip.market}
                        </div>
                        <div className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1.5">
                          <span>{trip.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{trip.itemsCount || trip.items.length} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div className="font-mono-num text-base font-bold text-[#1d1d1f]">
                          ₦{trip.total.toLocaleString('en-NG')}
                        </div>
                        {trip.pctChange ? (
                          <div
                            className={`text-xs font-semibold flex items-center justify-end gap-0.5 font-mono-num mt-0.5 ${
                              trip.isPositiveChange ? 'text-[#b91c1c]' : 'text-[#15803d]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {trip.isPositiveChange ? 'arrow_upward' : 'arrow_downward'}
                            </span>
                            <span>{trip.pctChange}%</span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#86868b] mt-0.5">Saved</div>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-[#aeaeb2] group-hover:text-[#00567c] text-[18px] hidden sm:inline">
                        chevron_right
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-[#1d1d1f]">No market trips saved yet</p>
              <p className="text-xs text-[#6e6e73] mt-1 mb-4">
                Record your first market run to track what you spend and spot fair prices.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('log-choice')}
                className="px-4 py-2 rounded-xl bg-[#00567c] text-white text-xs font-semibold hover:bg-[#004361]"
              >
                Record Market Run
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile-only Floating Action Button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button
          id="home-fab-log-shop"
          type="button"
          onClick={() => navigateTo('log-choice')}
          className="bg-[#00567c] text-white hover:bg-[#004361] rounded-2xl px-5 h-13 shadow-lg shadow-[#00567c]/25 flex items-center gap-2 transition-all active:scale-95 font-semibold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Record Market Run</span>
        </button>
      </div>
    </div>
  );
};
