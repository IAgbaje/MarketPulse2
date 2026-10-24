import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const SetBudgetScreen: React.FC = () => {
  const { budget, updateBudget, navigateTo, goBack } = useMarketPulse();

  const [targetAmount, setTargetAmount] = useState<string>(budget.monthlyTarget.toString());
  const [frequency, setFrequency] = useState<'Weekly' | 'Fortnightly' | 'Monthly'>(budget.frequency || 'Weekly');
  const [isCategoryExpanded, setIsCategoryExpanded] = useState<boolean>(false);

  const [produceBudget, setProduceBudget] = useState<string>(
    budget.categoryBudgets?.produce?.budget?.toString() || '35000'
  );
  const [proteinBudget, setProteinBudget] = useState<string>(
    budget.categoryBudgets?.proteins?.budget?.toString() || '45000'
  );
  const [pantryBudget, setPantryBudget] = useState<string>(
    budget.categoryBudgets?.pantry?.budget?.toString() || '40000'
  );

  const handleSaveBudget = () => {
    const numTarget = parseInt(targetAmount.replace(/[^0-9]/g, ''), 10) || 85000;
    const numProduce = parseInt(produceBudget.replace(/[^0-9]/g, ''), 10) || 35000;
    const numProtein = parseInt(proteinBudget.replace(/[^0-9]/g, ''), 10) || 45000;
    const numPantry = parseInt(pantryBudget.replace(/[^0-9]/g, ''), 10) || 40000;

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
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={goBack}
          className="flex items-center text-[#40484e] hover:text-[#00567c] transition-colors text-sm mb-3 font-medium"
        >
          <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          Back
        </button>
        <h2 className="text-2xl font-bold text-[#191c1f] tracking-tight mb-1">
          Set your budget
        </h2>
        <p className="text-[#40484e] text-sm">
          Let's plan your household spending to keep things on track.
        </p>
      </div>

      {/* Monthly Target Amount Card */}
      <section className="bg-white border border-[#c0c7cf]/40 rounded-2xl p-5 sm:p-6 shadow-xs mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#00567c]" />
        <label className="block text-xs font-bold text-[#40484e] uppercase tracking-wider mb-2">
          Monthly Target Amount
        </label>
        <div className="relative mb-3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-2xl text-[#191c1f]">
            ₦
          </span>
          <input
            id="budget-target-amount-input"
            type="text"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 text-3xl font-extrabold border-0 bg-[#f2f3f7] rounded-xl focus:ring-2 focus:ring-[#00567c] focus:bg-white transition-all tabular-nums text-[#191c1f] outline-none"
            placeholder="85,000"
          />
        </div>

        <div className="flex items-start gap-2 bg-[#cbe3f7]/30 text-[#00567c] p-3.5 rounded-xl text-xs font-medium border border-[#cbe3f7]">
          <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">info</span>
          <p>
            Based on your recent ₦18,400 shop, assuming you're shopping roughly weekly.
          </p>
        </div>
      </section>

      {/* Frequency Section */}
      <section className="mb-6">
        <h3 className="text-xs font-bold text-[#40484e] uppercase tracking-wider mb-3 px-1">
          Frequency
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {(['Weekly', 'Fortnightly', 'Monthly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setFrequency(freq)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-100 flex items-center gap-1.5 active:scale-95 ${
                frequency === freq
                  ? 'border-2 border-[#00567c] bg-[#2a6f97] text-white shadow-xs'
                  : 'border border-[#c0c7cf]/60 bg-white text-[#40484e] hover:bg-[#f2f3f7]'
              }`}
            >
              {frequency === freq && (
                <span className="material-symbols-outlined text-[16px]">check</span>
              )}
              <span>{freq}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Per-Category Budgets Accordion */}
      <section className="mb-8 border border-[#c0c7cf]/40 rounded-2xl bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#f2f3f7] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00567c]">category</span>
            <span className="font-semibold text-sm text-[#191c1f]">
              Per-category budgets (Optional)
            </span>
          </div>
          <span className="material-symbols-outlined text-[#40484e]">
            {isCategoryExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {isCategoryExpanded && (
          <div className="p-4 pt-2 border-t border-[#e1e2e6] space-y-3 bg-[#f8f9fd]">
            <p className="text-xs text-[#40484e] mb-3">
              Break down your total budget to see where it goes.
            </p>

            {/* Produce */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-[#191c1f] w-24">Produce</label>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-[#71787f]">
                  ₦
                </span>
                <input
                  type="number"
                  value={produceBudget}
                  onChange={(e) => setProduceBudget(e.target.value)}
                  className="block w-full pl-7 pr-3 py-2 text-sm font-semibold border border-[#c0c7cf]/50 bg-white rounded-lg focus:ring-2 focus:ring-[#00567c] tabular-nums text-[#191c1f]"
                  placeholder="35000"
                />
              </div>
            </div>

            {/* Proteins */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-[#191c1f] w-24">Proteins</label>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-[#71787f]">
                  ₦
                </span>
                <input
                  type="number"
                  value={proteinBudget}
                  onChange={(e) => setProteinBudget(e.target.value)}
                  className="block w-full pl-7 pr-3 py-2 text-sm font-semibold border border-[#c0c7cf]/50 bg-white rounded-lg focus:ring-2 focus:ring-[#00567c] tabular-nums text-[#191c1f]"
                  placeholder="45000"
                />
              </div>
            </div>

            {/* Pantry Staples */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-[#191c1f] w-24">Pantry</label>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-[#71787f]">
                  ₦
                </span>
                <input
                  type="number"
                  value={pantryBudget}
                  onChange={(e) => setPantryBudget(e.target.value)}
                  className="block w-full pl-7 pr-3 py-2 text-sm font-semibold border border-[#c0c7cf]/50 bg-white rounded-lg focus:ring-2 focus:ring-[#00567c] tabular-nums text-[#191c1f]"
                  placeholder="40000"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Confirm Action Button */}
      <div className="mt-4">
        <button
          id="confirm-budget-btn"
          onClick={handleSaveBudget}
          className="w-full bg-[#00567c] text-white font-bold py-4 rounded-xl shadow-xs hover:bg-[#2a6f97] transition-all active:scale-[0.98] duration-150 flex items-center justify-center gap-2 text-base"
        >
          <span>Confirm Budget</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
