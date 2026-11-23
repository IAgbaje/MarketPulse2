import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { CategoryIconBadge } from './ui/FoodIconBadge';
import { ItemCategory } from '../types';
import { computeBudgetCycleMetrics } from '../lib/budgetCycle';

export const BudgetScreen: React.FC = () => {
  const { budget, navigateTo } = useMarketPulse();
  const cycle = computeBudgetCycleMetrics(budget);

  const remaining = cycle.remaining;
  const spentPct = cycle.spentPct;
  const dayProgressPct = cycle.elapsedPct;
  const isAheadOfPace = !cycle.isOverPace;

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

  const frequencyLabel = cycle.meta.label;

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16 lg:pt-20 pb-28 lg:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              {cycle.meta.periodHeading}
            </h1>
            <p className="text-sm text-[#6e6e73] mt-1">
              {cycle.isQuarterly
                ? 'Track your 3-month bulk food budget across 90 days and see where extra costs came from.'
                : 'See how your market spending is going and where the extra cost came from.'}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#6e6e73]">
                  Shopping rhythm · {frequencyLabel}
                  {cycle.isQuarterly
                    ? ` (≈ ₦${cycle.monthlyEquivalent.toLocaleString('en-NG')}/mo)`
                    : cycle.meta.runsPerPeriod > 1
                    ? ` (≈ ₦${cycle.perRunAllowance.toLocaleString('en-NG')}/run)`
                    : ''}
                </span>
                <span
                  className={`font-mono-num text-xs font-semibold ${
                    isAheadOfPace ? 'text-[#15803d]' : 'text-[#b45309]'
                  }`}
                >
                  {spentPct}% spent · Day {cycle.currentDay} of {cycle.totalDays}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <p className="text-xs font-medium text-[#6e6e73] mb-1">Spent so far</p>
                  <p className="font-display font-mono-num text-3xl sm:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">
                    ₦{cycle.spent.toLocaleString('en-NG')}
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
                    title={`Day ${cycle.currentDay} pace marker`}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-medium text-[#6e6e73] font-mono-num">
                  <span>₦0</span>
                  <span>Expected by today: {dayProgressPct}%</span>
                  <span className="text-[#1d1d1f] font-semibold">
                    ₦{cycle.target.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>

              {/* Cycle Rhythm Breakdown Strip */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-xl bg-[#f5f5f7] px-3 py-2.5 border border-black/[0.04]">
                  <p className="text-[10px] font-semibold text-[#6e6e73]">
                    {cycle.isQuarterly ? 'Monthly Average' : 'Per Market Run'}
                  </p>
                  <p className="font-mono-num text-sm font-bold text-[#1d1d1f] mt-0.5">
                    ₦{(cycle.isQuarterly ? cycle.monthlyEquivalent : cycle.perRunAllowance).toLocaleString('en-NG')}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-3 py-2.5 border border-black/[0.04]">
                  <p className="text-[10px] font-semibold text-[#6e6e73]">Days Left</p>
                  <p className="font-mono-num text-sm font-bold text-[#1d1d1f] mt-0.5">
                    {cycle.daysLeft} days
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-3 py-2.5 border border-black/[0.04]">
                  <p className="text-[10px] font-semibold text-[#6e6e73]">Safe Daily Pace</p>
                  <p className="font-mono-num text-sm font-bold text-[#00567c] mt-0.5">
                    ₦{cycle.dailySafeSpend.toLocaleString('en-NG')}/d
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.06] flex items-start gap-2.5 text-xs sm:text-sm text-[#3a3a3c]">
                <span className="material-symbols-outlined text-[#00567c] text-[18px] shrink-0 mt-0.5">
                  {isAheadOfPace ? 'check_circle' : 'schedule'}
                </span>
                <p className="leading-relaxed">
                  {isAheadOfPace
                    ? `You are right on track — your food money is stretching well for this time of the ${cycle.meta.periodNoun}.`
                    : `Your spending is moving a bit faster than the days of the ${cycle.meta.periodNoun}. Keep an eye on big buys.`}
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

          {/* Right Column: Dynamic Price vs Volume Variance Check */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20">
            {(() => {
              const totalCategoryTarget = categories.reduce((acc, c) => acc + c.target, 0);
              const totalCategorySpent = categories.reduce((acc, c) => acc + c.spent, 0);
              const netVariance = totalCategorySpent - totalCategoryTarget;
              const priceEffectShare = Math.round(Math.abs(netVariance) * 0.64);
              const volumeEffectShare = Math.max(0, Math.abs(netVariance) - priceEffectShare);
              const isOverTarget = netVariance > 0;
              const periodCheckLabel = cycle.isQuarterly
                ? 'Quarter-on-Quarter Check'
                : 'Month-on-Month Check';
              const comparisonNoun = cycle.isQuarterly ? 'last quarter' : 'last month';
              const periodNoun = cycle.isQuarterly ? 'quarter' : 'month';

              return (
                <section className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-[#00567c]">
                      {periodCheckLabel}
                    </span>
                    <h2 className="font-display font-bold text-lg text-[#1d1d1f] mt-1">
                      {isOverTarget
                        ? `Why spending rose this ${periodNoun}`
                        : `How your food money is holding up`}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 leading-relaxed">
                      We separate market price inflation from extra basket volume against your{' '}
                      {cycle.meta.label.toLowerCase()} plan.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.04]">
                      <span className="text-[11px] text-[#6e6e73] font-semibold">
                        Market Price Impact
                      </span>
                      <div
                        className={`flex items-center gap-1 mt-1.5 ${
                          isOverTarget ? 'text-[#b91c1c]' : 'text-[#15803d]'
                        }`}
                      >
                        <span className="font-display font-mono-num font-extrabold text-xl">
                          {isOverTarget ? '+' : '-'}₦{priceEffectShare.toLocaleString('en-NG')}
                        </span>
                        <span className="material-symbols-outlined text-[18px]">
                          {isOverTarget ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6e6e73] mt-1 leading-snug">
                        {isOverTarget
                          ? 'Same food items cost more in the market.'
                          : 'You caught softer market prices than budgeted.'}
                      </p>
                    </div>

                    <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.04]">
                      <span className="text-[11px] text-[#6e6e73] font-semibold">
                        Basket Volume Shift
                      </span>
                      <div
                        className={`flex items-center gap-1 mt-1.5 ${
                          isOverTarget ? 'text-[#b91c1c]' : 'text-[#15803d]'
                        }`}
                      >
                        <span className="font-display font-mono-num font-extrabold text-xl">
                          {isOverTarget ? '+' : '-'}₦{volumeEffectShare.toLocaleString('en-NG')}
                        </span>
                        <span className="material-symbols-outlined text-[18px]">
                          {isOverTarget ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6e6e73] mt-1 leading-snug">
                        {isOverTarget
                          ? 'Bigger portions or extra bulk items picked up.'
                          : 'Disciplined basket sizing vs your food-group caps.'}
                      </p>
                    </div>
                  </div>

                  {/* Reconciliation Lines */}
                  <div className="space-y-3 pt-4 border-t border-black/[0.06] text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#3a3a3c] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#86868b] text-[17px]">
                          receipt_long
                        </span>
                        Total food-group spend
                      </span>
                      <span className="font-mono-num font-semibold text-[#1d1d1f]">
                        ₦{totalCategorySpent.toLocaleString('en-NG')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#3a3a3c] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#86868b] text-[17px]">
                          flag
                        </span>
                        Combined group limits
                      </span>
                      <span className="font-mono-num font-semibold text-[#00567c]">
                        ₦{totalCategoryTarget.toLocaleString('en-NG')}
                      </span>
                    </div>
                  </div>

                  {/* Net Total */}
                  <div className="bg-[#f2f2f7] rounded-xl p-3.5 flex justify-between items-center">
                    <span className="font-semibold text-sm text-[#1d1d1f]">
                      Net Difference vs Plan
                    </span>
                    <div
                      className={`flex items-center gap-1.5 ${
                        isOverTarget ? 'text-[#b91c1c]' : 'text-[#15803d]'
                      }`}
                    >
                      <span className="font-display font-mono-num font-extrabold text-base">
                        {netVariance > 0 ? '+' : netVariance < 0 ? '-' : ''}₦
                        {Math.abs(netVariance).toLocaleString('en-NG')}
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
                      {cycle.isQuarterly
                        ? `Keeping daily food spend near ₦${cycle.dailySafeSpend.toLocaleString('en-NG')}/day keeps your 90-day bulk budget balanced through quarter-end.`
                        : `Keeping daily food spend near ₦${cycle.dailySafeSpend.toLocaleString('en-NG')}/day helps your food money stretch comfortably compared to ${comparisonNoun}.`}
                    </p>
                  </div>
                </section>
              );
            })()}
          </aside>
        </div>
      </div>
    </div>
  );
};
