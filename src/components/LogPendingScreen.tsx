import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const LogPendingScreen: React.FC = () => {
  const { navigateTo, pendingRawInput } = useMarketPulse();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-16 pb-safe px-6 max-w-md mx-auto w-full items-center justify-between">
      {/* Top close bar is provided by TopAppBar with showClose=true */}

      {/* Main Content Center */}
      <div className="w-full flex flex-col items-center text-center space-y-6 mt-12 my-auto">
        {/* Graphic / Icon Area */}
        <div className="relative w-32 h-32 flex items-center justify-center bg-[#cbe3f7] rounded-full shadow-xs mb-2">
          <span className="material-symbols-outlined text-6xl text-[#00567c] filled">
            inventory_2
          </span>
          {/* Ambient spinning indicator badge */}
          <div className="absolute bottom-0 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <span
              className="material-symbols-outlined text-[#00567c] text-sm animate-spin"
              style={{ animationDuration: '3s' }}
            >
              sync
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2 max-w-xs">
          <h1 className="text-2xl font-bold text-[#191c1f] tracking-tight">
            Item Pending Review
          </h1>
          <p className="text-[#40484e] text-sm leading-relaxed">
            We're adding this to our list soon. You can continue your trip and we'll update it once reviewed.
          </p>
        </div>

        {/* Raw Text Preview */}
        <div className="w-full bg-[#f2f3f7] border border-[#c0c7cf]/40 rounded-2xl p-4 text-left shadow-xs mt-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#71787f] text-[22px] mt-0.5">
              receipt_long
            </span>
            <div className="overflow-hidden">
              <p className="text-[10px] text-[#40484e] font-bold uppercase tracking-wider">
                RAW INPUT
              </p>
              <p className="text-[#191c1f] font-semibold text-sm mt-0.5">
                "{pendingRawInput || 'Bama Mayonnaise 1kg - Oshodi Market'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md pb-8 pt-4 space-y-3">
        <button
          id="pending-continue-trip-btn"
          onClick={() => navigateTo('log-confirm')}
          className="w-full bg-[#00567c] text-white py-4 rounded-xl font-bold text-base hover:bg-[#2a6f97] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <span>Continue Trip</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          id="pending-edit-item-btn"
          onClick={() => navigateTo('log-choice')}
          className="w-full bg-transparent text-[#00567c] py-3 rounded-xl font-semibold text-sm hover:bg-[#eceef1] transition-colors active:scale-[0.98]"
        >
          Edit Item Entry
        </button>
      </div>
    </div>
  );
};
