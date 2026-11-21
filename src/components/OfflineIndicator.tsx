import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      role="status"
      aria-live="polite"
      className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-[70] flex items-center justify-between gap-3 bg-[#111827] text-white px-4 py-2.5 rounded-xl shadow-lg border border-amber-500/40"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">
          wifi_off
        </span>
        <span className="text-xs font-semibold">
          Offline Mode — Local prices cached &amp; editable
        </span>
      </div>
      <span className="text-[11px] text-amber-300 font-semibold whitespace-nowrap">
        Auto-syncs online
      </span>
    </div>
  );
};
