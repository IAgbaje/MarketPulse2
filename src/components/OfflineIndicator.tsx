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
      className="fixed top-18 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-[70] flex items-center justify-between gap-3 bg-[#191c1f] text-white px-4 py-2.5 rounded-xl shadow-lg border border-amber-500/40 animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <span className="text-xs font-semibold">
          Offline Mode — Local prices cached & accessible
        </span>
      </div>
      <span className="text-[11px] text-amber-300 font-medium whitespace-nowrap bg-amber-950/50 px-2 py-0.5 rounded">
        Syncs on reconnect
      </span>
    </div>
  );
};
