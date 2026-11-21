import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { AdaptiveSheet } from './ui/AdaptiveSheet';

export const DataManagementScreen: React.FC = () => {
  const { exportData, deleteAllData, resetToSampleData, trips } = useMarketPulse();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const handleConfirmDelete = () => {
    deleteAllData();
    setShowDeleteSheet(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 lg:pt-24 pb-28 lg:pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Clean Header (TopAppBar already handles Back navigation) */}
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Export &amp; Data
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Download a copy of your market trips for your own records, or start fresh anytime.
          </p>
        </header>

        {/* Desktop 2-Column Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Export Card */}
          <section className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/70 text-[#00567c] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">download</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#1d1d1f]">
                  Download My Records
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 leading-relaxed">
                  Save a copy of your <strong className="font-mono-num">{trips.length}</strong>{' '}
                  market trips, food prices, and monthly budget straight to your device.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="export-csv-btn"
                type="button"
                onClick={() => exportData('csv')}
                className="min-h-[44px] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-[#00567c] text-white rounded-xl font-semibold text-xs hover:bg-[#003e5a] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                <span>Download Spreadsheet (CSV)</span>
              </button>

              <button
                id="export-json-btn"
                type="button"
                onClick={() => exportData('json')}
                className="min-h-[44px] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-xl font-semibold text-xs border border-black/[0.08] hover:bg-[#e8e8ed] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                <span>Download Backup (JSON)</span>
              </button>
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-3 text-xs text-[#6e6e73]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                Saved right on your phone
              </span>
              <button
                type="button"
                onClick={resetToSampleData}
                className="font-semibold text-[#00567c] hover:underline whitespace-nowrap"
              >
                Load Sample Lagos Data
              </button>
            </div>
          </section>

          {/* Delete Data Card */}
          <section className="bg-white rounded-2xl p-6 border border-red-200/80 shadow-2xs space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/70 text-[#b91c1c] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#b91c1c]">
                  Clear All Records
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 leading-relaxed">
                  Permanently wipe all saved market trips, food budgets, and price records from this
                  phone and your cloud backup.
                </p>
              </div>
            </div>

            <div className="bg-red-50/70 p-4 rounded-xl border border-red-200/70 space-y-1.5">
              <h3 className="font-bold text-[#b91c1c] text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Cannot be undone</span>
              </h3>
              <ul className="text-xs text-[#7f1d1d] space-y-1 list-disc list-inside">
                <li>Every saved market run and food price will be wiped.</li>
                <li>Your monthly food budget will reset to zero.</li>
              </ul>
            </div>

            <button
              id="open-delete-confirm-btn"
              type="button"
              onClick={() => setShowDeleteSheet(true)}
              className="min-h-[44px] inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#b91c1c] text-white rounded-xl font-semibold text-xs hover:bg-[#991b1b] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">delete</span>
              <span>Clear All My Records</span>
            </button>
          </section>
        </div>
      </div>

      {/* Adaptive Confirmation Sheet / Modal */}
      <AdaptiveSheet
        open={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        title="Clear all market records?"
        subtitle="This wipes all your saved market trips and food budget targets."
        maxWidthClass="md:max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#3a3a3c] leading-relaxed">
            You are about to remove <strong className="font-mono-num">{trips.length}</strong> market
            trips and reset your food budget. It&apos;s a good idea to download a CSV copy first.
          </p>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteSheet(false)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-black/[0.09] text-[#1d1d1f] font-semibold text-xs hover:bg-[#f2f2f7] transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-all-btn"
              type="button"
              onClick={handleConfirmDelete}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#b91c1c] text-white font-semibold text-xs hover:bg-[#991b1b] transition-colors"
            >
              Yes, Clear Everything
            </button>
          </div>
        </div>
      </AdaptiveSheet>
    </div>
  );
};
