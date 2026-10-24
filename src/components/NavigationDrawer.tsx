import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PWAInstallButton } from './PWAInstallButton';

export const NavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setDrawerOpen,
    navigateTo,
    currentScreen,
    userProfile,
    firebaseUser,
    signInWithGoogle,
    setActivePriceMapTab,
  } = useMarketPulse();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <nav
        id="main-navigation-drawer"
        aria-label="Main Navigation"
        className="relative z-10 flex flex-col h-full w-80 max-w-[85vw] bg-[#f2f3f7] shadow-2xl border-r border-[#c0c7cf]/40 transition-transform duration-300 ease-in-out transform translate-x-0"
      >
        {/* Header Profile */}
        <div className="p-6 border-b border-[#c0c7cf]/40 bg-[#f8f9fd]">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2a6f97] bg-[#00567c] text-white flex items-center justify-center font-bold shrink-0">
              {firebaseUser?.photoURL ? (
                <img
                  alt={userProfile.name}
                  className="object-cover w-full h-full"
                  src={firebaseUser.photoURL}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{userProfile.avatarInitials}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg text-[#191c1f] truncate">{userProfile.household}</h2>
              <p className="text-sm text-[#40484e] truncate">{userProfile.location}</p>
            </div>
          </div>
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 text-xs text-[#006e1c] mt-3 bg-[#c4eed0]/50 py-1 px-2.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[15px]">cloud_done</span>
              <span className="font-semibold">Synced with Google Cloud</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 text-xs text-[#00567c] mt-3 bg-[#cbe3f7] hover:bg-[#2a6f97] hover:text-white transition-colors py-1.5 px-3 rounded-full w-fit font-bold"
            >
              <span className="material-symbols-outlined text-[15px]">login</span>
              <span>Sign in with Google to Sync</span>
            </button>
          )}
        </div>

        {/* Links List */}
        <div className="flex-1 py-4 overflow-y-auto px-2 space-y-1">
          <button
            id="drawer-link-home"
            onClick={() => navigateTo('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'home'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span className={`material-symbols-outlined ${currentScreen === 'home' ? 'filled' : ''}`}>
              home
            </span>
            <span>Home Dashboard</span>
          </button>

          <button
            id="drawer-link-price-map"
            onClick={() => {
              setActivePriceMapTab('map');
              navigateTo('price-map');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'price-map'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                currentScreen === 'price-map' ? 'filled' : ''
              }`}
            >
              map
            </span>
            <span>Price Map & Basket Hub</span>
          </button>

          <button
            id="drawer-link-weekly-report"
            onClick={() => navigateTo('weekly-report')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'weekly-report'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                currentScreen === 'weekly-report' ? 'filled' : ''
              }`}
            >
              insights
            </span>
            <span>Weekly Wrap-up (WhatsApp)</span>
          </button>

          <button
            id="drawer-link-history"
            onClick={() => navigateTo('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'history'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span
              className={`material-symbols-outlined ${currentScreen === 'history' ? 'filled' : ''}`}
            >
              receipt_long
            </span>
            <span>Trip History</span>
          </button>

          <button
            id="drawer-link-budget"
            onClick={() => navigateTo('budget')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'budget' || currentScreen === 'set-budget'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Budget & Variance Insights</span>
          </button>

          <button
            id="drawer-link-commodity"
            onClick={() => navigateTo('commodity-detail')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'commodity-detail'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span className="material-symbols-outlined">trending_up</span>
            <span>Commodity Price Trends</span>
          </button>

          <div className="pt-3 my-2 border-t border-[#c0c7cf]/40" />

          <button
            id="drawer-link-landing"
            onClick={() => navigateTo('landing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'landing'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span className="material-symbols-outlined">public</span>
            <span>Product Tour & Landing Page</span>
          </button>

          <button
            id="drawer-link-account-sync"
            onClick={() => navigateTo('secure-account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'secure-account' || currentScreen === 'account-security'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span className="material-symbols-outlined">cloud_sync</span>
            <span>Silent Backup & Cloud Sync</span>
          </button>

          <button
            id="drawer-link-data-mgmt"
            onClick={() => navigateTo('data-mgmt')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
              currentScreen === 'data-mgmt' || currentScreen === 'data-management'
                ? 'bg-[#cbe3f7] text-[#00567c] font-bold'
                : 'text-[#191c1f] hover:bg-[#e7e8ec]'
            }`}
          >
            <span className="material-symbols-outlined">database</span>
            <span>Data Management</span>
          </button>

          <button
            id="drawer-link-set-budget"
            onClick={() => navigateTo('set-budget')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#40484e] hover:bg-[#e7e8ec] transition-colors font-medium text-left"
          >
            <span className="material-symbols-outlined">tune</span>
            <span>Set Target Budget</span>
          </button>

          <div className="pt-2 px-2">
            <PWAInstallButton variant="drawer" />
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#c0c7cf]/40 bg-[#f8f9fd] text-xs text-[#71787f] flex items-center justify-between">
          <span>MarketPulse v1.3</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Offline-ready
          </span>
        </div>
      </nav>
    </div>
  );
};
