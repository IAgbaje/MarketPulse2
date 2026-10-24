import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const DataManagementScreen: React.FC = () => {
  const { exportData, deleteAllData, resetToSampleData, goBack, navigateTo } = useMarketPulse();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleExportCSV = () => {
    exportData('csv');
    setFeedbackMessage('Exported CSV successfully.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleExportJSON = () => {
    exportData('json');
    setFeedbackMessage('Exported JSON successfully.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleConfirmDelete = () => {
    deleteAllData();
    setShowDeleteConfirm(false);
    setFeedbackMessage('All local data was permanently deleted.');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-3xl mx-auto w-full">
      {/* Back to Settings Link */}
      <div className="mb-6 mt-1">
        <button
          id="data-mgmt-back-btn"
          onClick={goBack}
          className="inline-flex items-center text-sm font-medium text-[#00567c] hover:underline mb-3"
        >
          <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          Back to Settings
        </button>
        <h2 className="text-2xl font-bold text-[#191c1f] tracking-tight mb-1">
          Data Management
        </h2>
        <p className="text-[#40484e] text-sm leading-relaxed">
          Control your household market data. Export it for your own records, or permanently delete it from our systems.
        </p>
      </div>

      {feedbackMessage && (
        <div className="mb-5 p-3.5 bg-[#cbe3f7] text-[#00567c] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Export Section (Calm, constructive action) */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 mb-6 border border-[#c0c7cf]/40 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#cbe3f7] text-[#00567c] rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">download</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#191c1f] mb-1">
              Export my data
            </h3>
            <p className="text-xs sm:text-sm text-[#40484e] mb-5 leading-relaxed">
              Download a copy of all your logged market prices, shopping trips, and historical trends. This is useful if you want to keep your own spreadsheet or backup.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="inline-flex justify-center items-center gap-2 px-5 py-3 bg-[#00567c] text-white rounded-full font-semibold text-xs hover:bg-[#2a6f97] active:scale-[0.98] transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                <span>Download as CSV</span>
              </button>

              <button
                id="export-json-btn"
                onClick={handleExportJSON}
                className="inline-flex justify-center items-center gap-2 px-5 py-3 bg-[#e7e8ec] text-[#191c1f] rounded-full font-semibold text-xs border border-[#c0c7cf]/60 hover:bg-[#eceef1] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                <span>Download as JSON</span>
              </button>
            </div>

            <p className="text-[11px] text-[#71787f] mt-3.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Your export file will be generated securely on this device.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Delete Section (Destructive, high friction) */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#ffdad6] relative overflow-hidden shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">delete_forever</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#ba1a1a] mb-1">
              Delete my data
            </h3>
            <p className="text-xs sm:text-sm text-[#40484e] mb-4 leading-relaxed">
              Permanently erase all your market logs, household settings, and price history from MarketPulse.
            </p>

            <div className="bg-[#ffdad6]/30 p-4 rounded-xl border border-[#ffdad6] mb-5">
              <h4 className="font-bold text-[#ba1a1a] text-xs flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                This action cannot be undone
              </h4>
              <ul className="text-xs text-[#40484e] space-y-1.5 list-disc list-inside">
                <li>All your price entries will be erased immediately.</li>
                <li>Your contributions to community market averages will be removed.</li>
                <li>You will lose access to your historical spending trends.</li>
              </ul>
            </div>

            {showDeleteConfirm ? (
              <div className="p-4 bg-[#ffdad6]/40 rounded-xl border border-[#ba1a1a]/40 space-y-3">
                <p className="text-xs font-bold text-[#ba1a1a]">
                  Are you absolutely certain? This will wipe your history.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-white text-[#40484e] text-xs font-semibold rounded-lg border border-[#c0c7cf]"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-delete-all-btn"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold rounded-lg hover:bg-red-700 active:scale-95"
                  >
                    Yes, delete everything
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="open-delete-confirm-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex justify-center items-center gap-2 px-5 py-3 bg-[#ba1a1a] text-white rounded-full font-semibold text-xs hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                <span>Delete all my data</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Restore Demo Data Utility */}
      <div className="mt-8 text-center">
        <button
          onClick={resetToSampleData}
          className="text-xs text-[#71787f] hover:text-[#00567c] underline"
        >
          Reset and restore Lagos sample market data
        </button>
      </div>
    </div>
  );
};
