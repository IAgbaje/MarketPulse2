import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { TripDetailPanel } from './TripDetailPanel';

export const TripDetailScreen: React.FC = () => {
  const { selectedTrip, goBack, navigateTo } = useMarketPulse();

  if (!selectedTrip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center pt-24">
        <p className="text-[#475569] text-sm mb-4">No trip selected.</p>
        <button
          type="button"
          onClick={() => navigateTo('history')}
          className="bg-[#00567c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#004361]"
        >
          View all trips
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-18 lg:pt-22 pb-28 lg:pb-12">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center text-[#475569] hover:text-[#00567c] transition-colors text-xs font-semibold mb-4"
      >
        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
        Back to Trip History
      </button>

      <TripDetailPanel
        trip={selectedTrip}
        onDeleted={() => navigateTo('history', { replace: true })}
      />
    </div>
  );
};
