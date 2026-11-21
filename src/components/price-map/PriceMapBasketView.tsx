import React from 'react';
import { BASKET_BASELINE, BASKET_OPTIONS } from '../../data/priceMapData';

interface PriceMapBasketViewProps {
  onLogAtMarket: (marketName?: string) => void;
}

export const PriceMapBasketView: React.FC<PriceMapBasketViewProps> = ({ onLogAtMarket }) => {
  const bestOption = BASKET_OPTIONS[0];
  const maxSavings = Math.abs(bestOption.diffVsBaseline);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Baseline Summary */}
      <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-900/8 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Your Usual Basket
            </span>
            <span className="font-mono-num text-xs font-semibold text-[#00567c]">
              {BASKET_BASELINE.totalCount} staple items
            </span>
          </div>

          <div>
            <div className="text-xs text-[#64748b]">Baseline at {BASKET_BASELINE.marketName}</div>
            <div className="font-display font-mono-num text-3xl font-extrabold text-[#111827] tracking-tight mt-0.5">
              ₦{BASKET_BASELINE.totalPrice.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-[#15803d]/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803d]">
              <span className="material-symbols-outlined text-[16px]">savings</span>
              <span>Best Basket Opportunity</span>
            </div>
            <p className="text-xs text-[#166534] leading-relaxed">
              Switching your weekly basket to <strong>{bestOption.marketName}</strong> saves{' '}
              <strong className="font-mono-num">₦{maxSavings.toLocaleString()}</strong> (100% item
              coverage).
            </p>
          </div>

          <button
            type="button"
            onClick={() => onLogAtMarket(BASKET_BASELINE.marketName)}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-900/12 text-[#111827] font-semibold text-xs hover:bg-[#eef2f6] transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Log New Baseline Trip</span>
          </button>
        </div>
      </aside>

      {/* Right Ranked Market Baskets */}
      <section className="lg:col-span-8 space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#111827]">
            Nearby Market Basket Comparison
          </h2>
          <p className="text-xs text-[#64748b]">
            Estimated total cost for your last 12 recurring household staples across Lagos markets
          </p>
        </div>

        <div className="space-y-3.5">
          {BASKET_OPTIONS.map((opt) => {
            const savesMoney = opt.diffVsBaseline < 0;
            return (
              <div
                key={opt.id}
                className={`bg-white rounded-2xl p-5 border shadow-2xs transition-colors ${
                  opt.isBestValue
                    ? 'border-[#15803d]/40 ring-1 ring-[#15803d]/15'
                    : 'border-slate-900/8'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono-num font-bold text-sm shrink-0 ${
                        opt.isBestValue
                          ? 'bg-[#ecfdf5] text-[#15803d]'
                          : 'bg-[#eef2f6] text-[#475569]'
                      }`}
                    >
                      #{opt.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-base text-[#111827]">
                          {opt.marketName}
                        </h3>
                        {opt.isBestValue && (
                          <span className="text-[11px] font-bold text-[#15803d] bg-[#ecfdf5] px-2 py-0.5 rounded-md">
                            Best Value
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5 font-mono-num">
                        {opt.type} · {opt.distanceKm} km · {opt.updatedText}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-slate-900/8 pt-3 sm:pt-0">
                    <div className="font-display font-mono-num text-2xl font-extrabold text-[#111827]">
                      ₦{opt.totalPrice.toLocaleString()}
                    </div>
                    <div
                      className={`font-mono-num text-xs font-bold mt-0.5 ${
                        savesMoney ? 'text-[#15803d]' : 'text-[#b91c1c]'
                      }`}
                    >
                      {savesMoney
                        ? `Save ₦${Math.abs(opt.diffVsBaseline).toLocaleString()} vs usual`
                        : `+₦${opt.diffVsBaseline.toLocaleString()} more than usual`}
                    </div>
                  </div>
                </div>

                {/* Coverage Bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-900/8 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#475569] font-medium">
                      Item price coverage ({opt.coveredCount} of {opt.totalCount} items)
                    </span>
                    <span className="font-mono-num font-bold text-[#111827]">
                      {opt.coveragePct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#eef2f6] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        opt.coveragePct === 100 ? 'bg-[#15803d]' : 'bg-[#00567c]'
                      }`}
                      style={{ width: `${opt.coveragePct}%` }}
                    />
                  </div>

                  {opt.missingItemsNote && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#fffbeb] border border-[#b45309]/20 flex items-start gap-2 text-xs text-[#92400e]">
                      <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                        info
                      </span>
                      <span>{opt.missingItemsNote}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onLogAtMarket(opt.marketName)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00567c] text-white hover:bg-[#003e5a] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
                      <span>Shop &amp; Log at {opt.marketName.replace(' Market', '')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
