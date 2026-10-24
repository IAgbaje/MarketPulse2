import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'appbar' | 'drawer' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'drawer' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'appbar') {
      return (
        <button
          id="pwa-install-appbar-btn"
          onClick={install}
          aria-label="Install MarketPulse app"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cbe3f7] hover:bg-[#2a6f97] text-[#00567c] hover:text-white rounded-full text-xs font-bold transition-all shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span className="hidden sm:inline">Install App</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-drawer-btn"
        onClick={install}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#00567c] text-white rounded-xl font-bold text-xs hover:bg-[#2a6f97] active:scale-98 transition-all shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[18px]">install_mobile</span>
          <span>Install MarketPulse</span>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          PWA
        </span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'appbar' ? (
          <button
            id="pwa-ios-appbar-btn"
            onClick={() => setShowIOSGuide(true)}
            aria-label="Install on iPhone / iPad"
            className="flex items-center gap-1 px-2.5 py-1 bg-[#eceef1] hover:bg-[#cbe3f7] text-[#00567c] rounded-full text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">ios_share</span>
            <span className="hidden sm:inline">Install</span>
          </button>
        ) : (
          <button
            id="pwa-ios-drawer-btn"
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#e7e8ec] hover:bg-[#cbe3f7] text-[#00567c] rounded-xl font-semibold text-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">add_to_home_screen</span>
              <span>Add to Home Screen</span>
            </div>
            <span className="text-[10px] text-[#71787f]">iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#c0c7cf]/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#cbe3f7] text-[#00567c] flex items-center justify-center font-bold">
                  ₦
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#191c1f]">Install MarketPulse</h3>
                  <p className="text-xs text-[#71787f]">Fast offline grocery tracker</p>
                </div>
              </div>

              <div className="bg-[#f8f9fd] p-3.5 rounded-xl border border-[#e1e2e6] text-xs text-[#40484e] space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-bold text-[#00567c]">1.</span> Tap the{' '}
                  <span className="material-symbols-outlined text-sm align-middle">ios_share</span>{' '}
                  <strong>Share</strong> icon at bottom of Safari.
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-[#00567c]">2.</span> Scroll down and select{' '}
                  <strong>"Add to Home Screen"</strong>.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-[#00567c] text-white rounded-xl text-xs font-bold hover:bg-[#2a6f97]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
