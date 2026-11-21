import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { NairaInput } from './ui/NairaInput';
import { CategoryIconBadge } from './ui/FoodIconBadge';

const QUICK_MONTHLY_TARGETS = [80000, 120000, 180000, 250000];

export const SetBudgetScreen: React.FC = () => {
  const { budget, updateBudget, navigateTo, goBack } = useMarketPulse();

  const [targetAmount, setTargetAmount] = useState<number | ''>(budget.monthlyTarget || 120000);
  const [frequency, setFrequency] = useState<'Weekly' | 'Fortnightly' | 'Monthly'>(
    budget.frequency || 'Weekly'
  );
  const [isCategoryExpanded, setIsCategoryExpanded] = useState<boolean>(true);

  const [produceBudget, setProduceBudget] = useState<number | ''>(
    budget.categoryBudgets?.produce?.budget ?? 35000
  );
  const [proteinBudget, setProteinBudget] = useState<number | ''>(
    budget.categoryBudgets?.proteins?.budget ?? 45000
  );
  const [pantryBudget, setPantryBudget] = useState<number | ''>(
    budget.categoryBudgets?.pantry?.budget ?? 40000
  );

  const parsedTarget = typeof targetAmount === 'number' ? targetAmount : 0;
  const parsedProduce = typeof produceBudget === 'number' ? produceBudget : 0;
  const parsedProtein = typeof proteinBudget === 'number' ? proteinBudget : 0;
  const parsedPantry = typeof pantryBudget === 'number' ? pantryBudget : 0;
  const categorySum = parsedProduce + parsedProtein + parsedPantry;
  const unallocated = parsedTarget - categorySum;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parsedTarget || 85000;
    const numProduce = parsedProduce || 35000;
    const numProtein = parsedProtein || 45000;
    const numPantry = parsedPantry || 40000;

    updateBudget({
      monthlyTarget: numTarget,
      frequency,
      categoryBudgets: {
        produce: { budget: numProduce, spent: budget.categoryBudgets.produce.spent },
        proteins: { budget: numProtein, spent: budget.categoryBudgets.proteins.spent },
        pantry: { budget: numPantry, spent: budget.categoryBudgets.pantry.spent },
      },
    });

    navigateTo('budget');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 lg:pt-24 pb-28 lg:pb-14">
      <form
        onSubmit={handleSaveBudget}
        className="max-w-2xl mx-auto px-4 sm:px-6 space-y-5"
      >
        {/* Clean Apple HIG Header (TopAppBar already handles Back navigation) */}
        <header className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Set Your Food Budget
          </h1>
          <p className="text-sm text-[#6e6e73]">
            Plan how much your home wants to spend on food each month and split it by food group.
          </p>
        </header>

        {/* Monthly Food Budget Card */}
        <section className="bg-white border border-black/[0.06] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="budget-target-amount-input"
              className="block text-xs font-semibold text-[#6e6e73] tracking-wide"
            >
              Monthly Food Money Target (₦)
            </label>
            <NairaInput
              id="budget-target-amount-input"
              value={targetAmount}
              onChange={setTargetAmount}
              size="lg"
              placeholder="120,000"
              ariaLabel="Monthly food budget target in Naira"
            />
          </div>

          {/* Quick-fill common Nigerian household food budgets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#6e6e73]">Quick pick:</span>
            {QUICK_MONTHLY_TARGETS.map((amt) => {
              const active = parsedTarget === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTargetAmount(amt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono-num transition-colors ${
                    active
                      ? 'bg-[#00567c] text-white'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  ₦{amt.toLocaleString('en-NG')}
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-2.5 bg-[#00567c]/[0.06] text-[#004666] p-3.5 rounded-xl text-xs font-medium border border-[#00567c]/12">
            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0 text-[#00567c]">
              info
            </span>
            <p className="leading-relaxed">
              From your recent market runs, keeping around{' '}
              <strong className="font-mono-num">₦120,000</strong> a month fits how often your home shops.
            </p>
          </div>
        </section>

        {/* How Often Do You Go to Market? */}
        <section className="bg-white border border-black/[0.06] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
          <div>
            <h2 className="text-sm font-bold text-[#1d1d1f]">How often do you go to market?</h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Helps us tell you if you&apos;re spending too fast before month-end.
            </p>
          </div>
          <div className="grid grid-cols-3 bg-[#f2f2f7] p-1 rounded-xl border border-black/[0.05]">
            {(
              [
                { value: 'Weekly', label: 'Every Week' },
                { value: 'Fortnightly', label: 'Every 2 Weeks' },
                { value: 'Monthly', label: 'Once a Month' },
              ] as const
            ).map((freq) => {
              const active = frequency === freq.value;
              return (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value)}
                  className={`relative min-h-[42px] px-2.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    active ? 'text-[#00567c]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="budget-freq-pill"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-black/[0.05]"
                    />
                  )}
                  <span className="relative z-10">{freq.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Split by Food Group */}
        <section className="border border-black/[0.06] rounded-2xl bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
            className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#f5f5f7]/60 transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#00567c]/10 text-[#00567c] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">pie_chart</span>
              </div>
              <div className="min-w-0">
                <span className="font-display font-bold text-sm text-[#1d1d1f] block">
                  Split by Food Group
                </span>
                <span className="text-xs text-[#6e6e73] font-mono-num block mt-0.5">
                  Shared out: ₦{categorySum.toLocaleString('en-NG')}
                  {parsedTarget > 0 && (
                    <span
                      className={`ml-1.5 font-semibold ${
                        unallocated < 0 ? 'text-[#b91c1c]' : 'text-[#00567c]'
                      }`}
                    >
                      ·{' '}
                      {unallocated < 0
                        ? `₦${Math.abs(unallocated).toLocaleString('en-NG')} over target`
                        : `₦${unallocated.toLocaleString('en-NG')} left`}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#86868b] shrink-0">
              {isCategoryExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isCategoryExpanded && (
            <div className="p-5 pt-4 border-t border-black/[0.06] bg-[#f5f5f7]/45 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="produce-budget-input"
                    className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]"
                  >
                    <CategoryIconBadge category="Produce" size="xs" />
                    <span>Fresh Produce</span>
                  </label>
                  <NairaInput
                    id="produce-budget-input"
                    value={produceBudget}
                    onChange={setProduceBudget}
                    size="md"
                    placeholder="35,000"
                    ariaLabel="Fresh produce monthly budget in Naira"
                  />
                  <p className="text-[11px] text-[#6e6e73]">Tomatoes, pepper, onions, veggies</p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="protein-budget-input"
                    className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]"
                  >
                    <CategoryIconBadge category="Proteins" size="xs" />
                    <span>Meat, Fish &amp; Eggs</span>
                  </label>
                  <NairaInput
                    id="protein-budget-input"
                    value={proteinBudget}
                    onChange={setProteinBudget}
                    size="md"
                    placeholder="45,000"
                    ariaLabel="Meat, fish and eggs monthly budget in Naira"
                  />
                  <p className="text-[11px] text-[#6e6e73]">Beef, chicken, fish, crate of eggs</p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="pantry-budget-input"
                    className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]"
                  >
                    <CategoryIconBadge category="Pantry Staples" size="xs" />
                    <span>Rice, Oil &amp; Dry Food</span>
                  </label>
                  <NairaInput
                    id="pantry-budget-input"
                    value={pantryBudget}
                    onChange={setPantryBudget}
                    size="md"
                    placeholder="40,000"
                    ariaLabel="Rice, oil and dry food monthly budget in Naira"
                  />
                  <p className="text-[11px] text-[#6e6e73]">Rice, garri, beans, oil, semo</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={goBack}
            className="w-full sm:w-auto min-h-[46px] px-6 py-3 rounded-xl border border-black/[0.08] bg-white text-[#1d1d1f] hover:bg-[#e8e8ed] font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-budget-btn"
            type="submit"
            className="w-full sm:w-auto min-h-[46px] px-7 py-3 bg-[#00567c] text-white font-semibold rounded-xl shadow-xs hover:bg-[#003e5a] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Save Food Budget</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
