import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const LogPendingScreen: React.FC = () => {
  const { navigateTo, pendingRawInput } = useMarketPulse();

  return (
    <div className="min-h-screen bg-[#f6f8fb] pt-16 pb-safe px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-900/8 shadow-2xs p-6 sm:p-8 text-center space-y-6 my-8">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-[#d4e8f7]/70 rounded-3xl">
          <span className="material-symbols-outlined text-5xl text-[#00567c]">inventory_2</span>
          <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-white border border-slate-900/10 rounded-full flex items-center justify-center shadow-xs">
            <span
              className="material-symbols-outlined text-[#00567c] text-[17px] animate-spin"
              style={{ animationDuration: '3s' }}
            >
              sync
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-extrabold text-[#111827] tracking-tight">
            Item Pending Review
          </h1>
          <p className="text-[#64748b] text-sm leading-relaxed">
            We&apos;re matching this item to our commodity catalog. Continue your trip and
            we&apos;ll classify it automatically.
          </p>
        </div>

        <div className="bg-[#f6f8fb] border border-slate-900/8 rounded-xl p-4 text-left flex items-start gap-3">
          <span className="material-symbols-outlined text-[#64748b] text-[20px] mt-0.5">
            receipt_long
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider">
              Raw Input
            </p>
            <p className="text-[#111827] font-semibold text-sm mt-0.5 break-words">
              &ldquo;{pendingRawInput || 'Bama Mayonnaise 1kg - Oshodi Market'}&rdquo;
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            id="pending-continue-trip-btn"
            type="button"
            onClick={() => navigateTo('log-confirm')}
            className="w-full min-h-[46px] bg-[#00567c] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#003e5a] transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue Trip</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <button
            id="pending-edit-item-btn"
            type="button"
            onClick={() => navigateTo('log-choice')}
            className="w-full min-h-[42px] text-[#00567c] py-2.5 rounded-xl font-semibold text-xs hover:bg-[#eef2f6] transition-colors"
          >
            Edit Item Entry
          </button>
        </div>
      </div>
    </div>
  );
};
