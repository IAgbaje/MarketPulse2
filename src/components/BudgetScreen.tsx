import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { CategoryIconBadge } from './ui/FoodIconBadge';
import { ItemCategory } from '../types';

export const BudgetScreen: React.FC = () => {
  const { budget, navigateTo } = useMarketPulse();

  const remaining = Math.max(0, budget.monthlyTarget - budget.spentSoFar);
  const spentPct = Math.min(100, Math.round((budget.spentSoFar / (budget.monthlyTarget || 1)) * 100));
  const dayProgressPct = Math.round((budget.currentDay / (budget.totalDays || 30)) * 100);
  const isAheadOfPace = spentPct <= dayProgressPct;

  const categories: {
    id: string;
    category: ItemCategory;
    label: string;
    examples: string;
    spent: number;
    target: number;
  }[] = [
    {
      id: 'proteins',
      category: 'Proteins',
      label: 'Meat, Fish & Eggs',
      examples: 'Beef, chicken, fish, eggs, crayfish',
      spent: budget.categoryBudgets?.proteins?.spent ?? 45000,
      target: budget.categoryBudgets?.proteins?.budget ?? 40800,
    },
    {
      id: 'produce',
      category: 'Produce',
      label: 'Fresh Produce',
      examples: 'Tomatoes, pepper, onions, veggies',
      spent: budget.categoryBudgets?.produce?.spent ?? 32000,
      target: budget.categoryBudgets?.produce?.budget ?? 33500,
    },
    {
      id: 'pantry',
      category: 'Pantry Staples',
      label: 'Rice, Oil & Dry Food',
      examples: 'Rice, beans, garri, palm oil, semo',
      spent: budget.categoryBudgets?.pantry?.spent ?? 40500,
      target: budget.categoryBudgets?.pantry?.budget ?? 38400,
    },
  ];

  const frequencyLabel =
    budget.frequency === 'Weekly'
      ? 'Every Week'
      : budget.frequency === 'Fortnightly'
      ? 'Every 2 Weeks'
      : 'Monthly';

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16 lg:pt-20 pb-28 lg:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              This Month&apos;s Food Money
            </h1>
            <p className="text-sm text-[#6e6e73] mt-1">
              See how your market spending is going and where the extra cost came from.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('set-budget')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00567c] text-white hover:bg-[#003e5a] active:scale-[0.99] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 self-start sm:self-auto shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
            <span>Change Food Budget</span>
          </button>
        </header>

        {/* Desktop 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Budget Pace Hero + Food Groups */}
          <div className="lg:col-span-7 space-y-5">
            {/* Budget Overview Card */}
            <section className="bg-white p-5 sm:p-6 rounded-2xl border border-black/[0.06] shadow-2xs space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#6e6e73]">
                  Shopping rhythm · {frequencyLabel}
                </span>
                <span
                  className={`font-mono-num text-xs font-semibold ${
                    isAheadOfPace ? 'text-[#15803d]' : 'text-[#b45309]'
                  }`}
                >
                  {spentPct}% spent · Day {budget.currentDay} of {budget.totalDays}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <p className="text-xs font-medium text-[#6e6e73] mb-1">Spent so far</p>
                  <p className="font-display font-mono-num text-3xl sm:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">
                    ₦{budget.spentSoFar.toLocaleString('en-NG')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#6e6e73] mb-1">Money left</p>
                  <p className="font-display font-mono-num text-2xl sm:text-3xl font-bold text-[#00567c]">
                    ₦{remaining.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>

              {/* Pace Bar */}
              <div className="space-y-2">
                <div className="relative w-full h-3 bg-[#f2f2f7] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#00567c] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${spentPct}%` }}
                  />
                  {/* Day Marker */}
                  <div
                    className="absolute top-0 w-0.5 h-full bg-[#1d1d1f]/70 z-10"
                    style={{ left: `${dayProgressPct}%` }}
                    title={`Day ${budget.currentDay} pace marker`}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-medium text-[#6e6e73] font-mono-num">
                  <span>₦0</span>
                  <span>Expected by today: {dayProgressPct}%</span>
                  <span className="text-[#1d1d1f] font-semibold">
                    ₦{budget.monthlyTarget.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.06] flex items-start gap-2.5 text-xs sm:text-sm text-[#3a3a3c]">
                <span className="material-symbols-outlined text-[#00567c] text-[18px] shrink-0 mt-0.5">
                  {isAheadOfPace ? 'check_circle' : 'schedule'}
                </span>
                <p className="leading-relaxed">
                  {isAheadOfPace
                    ? 'You are right on track — your food money is stretching well for this time of the month.'
                    : 'Your spending is moving a bit faster than the days of the month. Keep an eye on big buys.'}
                </p>
              </div>
            </section>

            {/* Food Group Breakdown */}
            <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between gap-2">
                <h2 className="font-display font-bold text-base text-[#1d1d1f]">
                  Spending by Food Group
                </h2>
                <button
                  type="button"
                  onClick={() => navigateTo('set-budget')}
                  className="text-xs font-semibold text-[#00567c] hover:underline whitespace-nowrap"
                >
                  Edit limits →
                </button>
              </div>

              <div className="divide-y divide-black/[0.06]">
                {categories.map((cat) => {
                  const diff = cat.spent - cat.target;
                  const over = diff > 0;
                  const pct = Math.min(100, Math.round((cat.spent / (cat.target || 1)) * 100));
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => navigateTo('set-budget')}
                      className="w-full text-left p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-[#f5f5f7]/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <CategoryIconBadge category={cat.category} size="md" />
                        <div className="min-w-0 flex-1 max-w-xs">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-[#1d1d1f] truncate">
                              {cat.label}
                            </p>
                            <span className="font-mono-num text-[11px] text-[#6e6e73] shrink-0">
                              limit ₦{cat.target.toLocaleString('en-NG')}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#86868b] truncate mt-0.5">
                            {cat.examples}
                          </p>
                          <div className="w-full h-1.5 bg-[#f2f2f7] rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                over ? 'bg-[#b91c1c]' : 'bg-[#00567c]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-display font-mono-num font-bold text-base text-[#1d1d1f]">
                          ₦{cat.spent.toLocaleString('en-NG')}
                        </p>
                        <p
                          className={`font-mono-num text-xs font-semibold flex items-center justify-end gap-0.5 mt-0.5 ${
                            over ? 'text-[#b91c1c]' : 'text-[#15803d]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {over ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                          <span>
                            ₦{Math.abs(diff).toLocaleString('en-NG')} {over ? 'over' : 'left'}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Why You Spent More (Plain Nigerian English) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20">
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs space-y-5">
              <div>
                <span className="text-xs font-semibold text-[#00567c]">
                  Month-on-Month Check
                </span>
                <h2 className="font-display font-bold text-lg text-[#1d1d1f] mt-1">
                  Why you spent more this month
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 leading-relaxed">
                  We split what came from market prices rising versus buying extra food compared to
                  last month.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.04]">
                  <span className="text-[11px] text-[#6e6e73] font-semibold">
                    Market Prices Rose
                  </span>
                  <div className="flex items-center gap-1 text-[#b91c1c] mt-1.5">
                    <span className="font-display font-mono-num font-extrabold text-xl">
                      +₦9,200
                    </span>
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </div>
                  <p className="text-[11px] text-[#6e6e73] mt-1 leading-snug">
                    Same food items cost more in the market.
                  </p>
                </div>

                <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.04]">
                  <span className="text-[11px] text-[#6e6e73] font-semibold">
                    You Bought More Food
                  </span>
                  <div className="flex items-center gap-1 text-[#b91c1c] mt-1.5">
                    <span className="font-display font-mono-num font-extrabold text-xl">
                      +₦3,100
                    </span>
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </div>
                  <p className="text-[11px] text-[#6e6e73] mt-1 leading-snug">
                    You picked up bigger sizes or extra portions.
                  </p>
                </div>
              </div>

              {/* Reconciliation Lines */}
              <div className="space-y-3 pt-4 border-t border-black/[0.06] text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#3a3a3c] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#86868b] text-[17px]">
                      add_circle
                    </span>
                    New things you bought
                  </span>
                  <span className="font-mono-num font-semibold text-[#1d1d1f]">+₦4,500</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#3a3a3c] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#86868b] text-[17px]">
                      do_not_disturb_on
                    </span>
                    Things you skipped
                  </span>
                  <span className="font-mono-num font-semibold text-[#15803d]">-₦2,500</span>
                </div>
              </div>

              {/* Net Total */}
              <div className="bg-[#f2f2f7] rounded-xl p-3.5 flex justify-between items-center">
                <span className="font-semibold text-sm text-[#1d1d1f]">Total Difference</span>
                <div className="flex items-center gap-1.5 text-[#1d1d1f]">
                  <span className="font-display font-mono-num font-extrabold text-base">
                    +₦14,300
                  </span>
                  <span className="material-symbols-outlined text-[#00567c] text-[18px]">
                    verified
                  </span>
                </div>
              </div>

              {/* Smart Swap Callout */}
              <div className="flex items-start gap-2.5 bg-[#00567c]/[0.06] p-3.5 rounded-xl border border-[#00567c]/12">
                <span className="material-symbols-outlined text-[#00567c] text-[19px] mt-0.5 shrink-0">
                  lightbulb
                </span>
                <p className="text-xs text-[#1d1d1f] leading-relaxed">
                  Buying tin tomatoes instead of fresh basket saved you{' '}
                  <strong className="font-mono-num">₦1,400</strong> this month (already counted in
                  the total above).
                </p>
              </div>

              <p className="text-[11px] text-[#86868b] text-center">
                Compared with 62% of what you bought last month · 3 one-off buys left out
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
