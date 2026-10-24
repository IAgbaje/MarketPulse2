import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const BudgetScreen: React.FC = () => {
  const { budget, navigateTo } = useMarketPulse();

  const remaining = Math.max(0, budget.monthlyTarget - budget.spentSoFar);
  const spentPct = Math.min(100, Math.round((budget.spentSoFar / budget.monthlyTarget) * 100));
  const dayProgressPct = Math.round((budget.currentDay / budget.totalDays) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-3xl mx-auto w-full space-y-6">
      {/* Top: Budget Overview */}
      <section className="w-full space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-bold text-[#40484e] uppercase tracking-wider">
            August Budget
          </h2>
          <button
            onClick={() => navigateTo('set-budget')}
            className="text-xs font-semibold text-[#00567c] hover:underline"
          >
            Edit Budget
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#c0c7cf]/30 w-full">
          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-[#40484e] text-xs font-medium mb-1">Spent so far</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#191c1f] tracking-tight tabular-nums">
                ₦{budget.spentSoFar.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#40484e] text-xs font-medium mb-1">Remaining</p>
              <p className="text-xl sm:text-2xl font-bold text-[#00567c] tabular-nums">
                ₦{remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Pace Bar */}
          <div className="relative w-full h-3.5 bg-[#e1e2e6] rounded-full overflow-hidden mb-2">
            <div
              className="absolute top-0 left-0 h-full bg-[#00567c] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${spentPct}%` }}
            />
            {/* Day Marker */}
            <div
              className="absolute top-0 w-1 h-full bg-white shadow-xs z-10"
              style={{ left: `${dayProgressPct}%` }}
              title={`Day ${budget.currentDay}`}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-[#40484e]">
            <span>₦0</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              Day {budget.currentDay} of {budget.totalDays}
            </span>
            <span className="tabular-nums">₦{budget.monthlyTarget.toLocaleString()} Total</span>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e1e2e6] flex items-start gap-2.5 text-xs sm:text-sm text-[#191c1f]">
            <span className="material-symbols-outlined text-[#00567c] text-[18px] shrink-0 mt-0.5">
              info
            </span>
            <p className="leading-snug">
              You are slightly under your expected pace for this point in the month.
            </p>
          </div>
        </div>
      </section>

      {/* Middle: Category Breakdown */}
      <section className="w-full space-y-3">
        <h2 className="text-xs font-bold text-[#40484e] uppercase tracking-wider px-1">
          Category breakdown
        </h2>
        <div className="bg-white rounded-2xl shadow-xs border border-[#c0c7cf]/30 overflow-hidden divide-y divide-[#e1e2e6]/70">
          {/* Proteins */}
          {(() => {
            const spent = budget.categoryBudgets?.proteins?.spent ?? 45000;
            const target = budget.categoryBudgets?.proteins?.budget ?? 40800;
            const diff = spent - target;
            const pct = Math.min(100, Math.round((spent / (target || 1)) * 100));
            return (
              <div className="p-4 flex items-center justify-between hover:bg-[#f2f3f7] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#cbe3f7] flex items-center justify-center text-[#00567c] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">restaurant</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1f] text-sm">Proteins</p>
                    <div className="w-28 sm:w-36 h-1.5 bg-[#e1e2e6] rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#00567c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base text-[#191c1f] tabular-nums">₦{spent.toLocaleString()}</p>
                  {diff > 0 ? (
                    <p className="text-xs text-[#ba1a1a] font-semibold flex items-center justify-end gap-0.5 mt-0.5 tabular-nums">
                      <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                      ₦{diff.toLocaleString()} over budget
                    </p>
                  ) : (
                    <p className="text-xs text-[#006e1c] font-semibold flex items-center justify-end gap-0.5 mt-0.5 tabular-nums">
                      <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
                      ₦{Math.abs(diff).toLocaleString()} under budget
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Produce */}
          {(() => {
            const spent = budget.categoryBudgets?.produce?.spent ?? 32000;
            const target = budget.categoryBudgets?.produce?.budget ?? 33500;
            const diff = spent - target;
            const pct = Math.min(100, Math.round((spent / (target || 1)) * 100));
            return (
              <div className="p-4 flex items-center justify-between hover:bg-[#f2f3f7] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#cbe3f7] flex items-center justify-center text-[#00567c] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">eco</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1f] text-sm">Produce</p>
                    <div className="w-28 sm:w-36 h-1.5 bg-[#e1e2e6] rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#00567c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base text-[#191c1f] tabular-nums">₦{spent.toLocaleString()}</p>
                  {diff > 0 ? (
                    <p className="text-xs text-[#ba1a1a] font-semibold flex items-center justify-end gap-0.5 mt-0.5 tabular-nums">
                      <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                      ₦{diff.toLocaleString()} over budget
                    </p>
                  ) : (
                    <p className="text-xs text-[#006e1c] font-semibold flex items-center justify-end gap-0.5 mt-0.5 tabular-nums">
                      <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
                      ₦{Math.abs(diff).toLocaleString()} under budget
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Pantry Staples */}
          {(() => {
            const spent = budget.categoryBudgets?.pantry?.spent ?? 40500;
            const target = budget.categoryBudgets?.pantry?.budget ?? 38400;
            const diff = spent - target;
            const pct = Math.min(100, Math.round((spent / (target || 1)) * 100));
            return (
              <div className="p-4 flex items-center justify-between hover:bg-[#f2f3f7] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#cbe3f7] flex items-center justify-center text-[#00567c] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1f] text-sm">Pantry Staples</p>
                    <div className="w-28 sm:w-36 h-1.5 bg-[#e1e2e6] rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#00567c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base text-[#191c1f] tabular-nums">₦{spent.toLocaleString()}</p>
                  {diff > 0 ? (
                    <p className="text-xs text-[#ba1a1a] font-semibold flex items-center justify-end gap-0.5 mt-0.5 tabular-nums">
                      <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                      ₦{diff.toLocaleString()} over budget
                    </p>
                  ) : (
                    <p className="text-xs text-[#006e1c] font-semibold flex items-center justify-end gap-0.5 mt-0.5 tabular-nums">
                      <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
                      ₦{Math.abs(diff).toLocaleString()} under budget
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <button
          onClick={() => navigateTo('set-budget')}
          className="w-full py-2.5 text-xs font-bold text-[#00567c] hover:bg-[#eceef1] transition-colors rounded-xl flex items-center justify-center gap-1"
        >
          <span>Adjust category targets</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </section>

      {/* Bottom: Variance Decomposition */}
      <section className="w-full space-y-3">
        <h2 className="text-xs font-bold text-[#40484e] uppercase tracking-wider px-1">
          Why your spend changed
        </h2>
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#c0c7cf]/30 relative overflow-hidden w-full">
          <p className="text-xs sm:text-sm text-[#40484e] mb-5">
            Compared to last month, your overall grocery cost went up. Here is exactly why:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Prices Card */}
            <div className="bg-[#f2f3f7] p-4 rounded-2xl flex flex-col">
              <span className="text-[11px] text-[#40484e] font-bold uppercase tracking-wider mb-1.5">
                Prices
              </span>
              <div className="flex items-center gap-1 text-[#ba1a1a]">
                <span className="font-extrabold text-lg sm:text-xl tabular-nums">+₦9,200</span>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </div>
              <p className="text-[11px] text-[#71787f] mt-1.5 leading-tight">
                Same items cost more this month.
              </p>
            </div>

            {/* Volume Card */}
            <div className="bg-[#f2f3f7] p-4 rounded-2xl flex flex-col">
              <span className="text-[11px] text-[#40484e] font-bold uppercase tracking-wider mb-1.5">
                Volume
              </span>
              <div className="flex items-center gap-1 text-[#ba1a1a]">
                <span className="font-extrabold text-lg sm:text-xl tabular-nums">+₦3,100</span>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </div>
              <p className="text-[11px] text-[#71787f] mt-1.5 leading-tight">
                You bought more of your usual items.
              </p>
            </div>
          </div>

          {/* Reconciliation Lines */}
          <div className="space-y-2.5 mb-5 border-t border-[#e1e2e6] pt-4">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#191c1f] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#71787f] text-[16px]">
                  add_circle
                </span>
                New items
              </span>
              <span className="font-bold text-[#191c1f] tabular-nums">+₦4,500</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#191c1f] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#71787f] text-[16px]">
                  do_not_disturb_on
                </span>
                Stopped buying
              </span>
              <span className="font-bold text-[#191c1f] tabular-nums">-₦2,500</span>
            </div>
          </div>

          {/* Total Change */}
          <div className="bg-[#eceef1] rounded-xl p-3.5 flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-[#191c1f]">Total change</span>
            <div className="flex items-center gap-1 text-[#191c1f]">
              <span className="font-extrabold text-base tabular-nums">+₦14,300</span>
              <span className="material-symbols-outlined text-[#00567c] text-[18px]">
                check
              </span>
            </div>
          </div>

          {/* Narrative Context */}
          <div className="flex items-start gap-2.5 bg-[#cbe3f7]/30 p-3.5 rounded-xl border border-[#cbe3f7]">
            <span className="material-symbols-outlined text-[#00567c] text-[20px] mt-0.5 shrink-0">
              lightbulb
            </span>
            <p className="text-xs text-[#191c1f] leading-relaxed">
              You switched fresh tomatoes <span className="material-symbols-outlined text-[13px] align-middle px-0.5">arrow_forward</span> paste, saved <strong>₦1,400</strong> (already counted above).
            </p>
          </div>

          <p className="text-[11px] text-[#71787f] mt-4 text-center">
            Based on 62% of last month's spend · 3 lines excluded
          </p>
        </div>
      </section>
    </div>
  );
};
