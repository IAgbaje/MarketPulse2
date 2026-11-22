import React from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ScreenType } from '../types';

interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  screen: ScreenType;
  matchScreens: ScreenType[];
  onClick?: () => void;
}

export const DesktopSidebar: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    setActivePriceMapTab,
    userProfile,
    firebaseUser,
    signInWithGoogle,
    setCommandPaletteOpen,
  } = useMarketPulse();

  if (currentScreen === 'landing') {
    return null;
  }

  const primaryNav: NavItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      screen: 'home',
      matchScreens: ['home'],
    },
    {
      id: 'price-map',
      label: 'Price Map',
      icon: 'map',
      screen: 'price-map',
      matchScreens: ['price-map'],
      onClick: () => {
        setActivePriceMapTab('map');
        navigateTo('price-map', { tab: 'map' });
      },
    },
    {
      id: 'history',
      label: 'My Market Trips',
      icon: 'receipt_long',
      screen: 'history',
      matchScreens: ['history', 'trip-detail'],
    },
    {
      id: 'trends',
      label: 'Food Prices',
      icon: 'trending_up',
      screen: 'commodity-detail',
      matchScreens: ['commodity-detail'],
    },
    {
      id: 'budget',
      label: 'Food Budget',
      icon: 'account_balance_wallet',
      screen: 'budget',
      matchScreens: ['budget', 'set-budget'],
    },
    {
      id: 'weekly',
      label: 'Weekly Summary',
      icon: 'insights',
      screen: 'weekly-report',
      matchScreens: ['weekly-report'],
    },
  ];

  const utilityNav: NavItemConfig[] = [
    {
      id: 'sync',
      label: 'Keep Records Safe',
      icon: 'cloud_sync',
      screen: 'account-security',
      matchScreens: ['account-security', 'secure-account'],
    },
    {
      id: 'data',
      label: 'Export & Data',
      icon: 'database',
      screen: 'data-management',
      matchScreens: ['data-management', 'data-mgmt'],
    },
    {
      id: 'analytics',
      label: 'Usage Insights',
      icon: 'bar_chart',
      screen: 'usage-analytics',
      matchScreens: ['usage-analytics'],
    },
    {
      id: 'tour',
      label: 'About MarketPulse',
      icon: 'public',
      screen: 'landing',
      matchScreens: ['landing'],
    },
  ];

  const isLogFlow =
    currentScreen === 'log-choice' ||
    currentScreen === 'log-scan' ||
    currentScreen === 'log-manual' ||
    currentScreen === 'log-confirm' ||
    currentScreen === 'log-pending' ||
    currentScreen === 'log-success';

  const avatarInitials =
    (userProfile.avatarInitials && userProfile.avatarInitials.trim()) ||
    userProfile.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'AO';

  return (
    <aside
      aria-label="Primary Sidebar Navigation"
      className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-[#f2f2f7]/95 backdrop-blur-xl border-r border-black/[0.06] z-40 select-none"
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-black/[0.05] shrink-0">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-[10px] bg-[#00567c] text-white flex items-center justify-center font-display font-extrabold text-base shadow-2xs group-hover:bg-[#004361] transition-colors">
            M
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-[#00567c]">
            MarketPulse
          </span>
        </button>
      </div>

      {/* Primary Action + Quick Search */}
      <div className="px-3.5 pt-3.5 pb-2.5 space-y-2 shrink-0">
        <button
          id="sidebar-log-shop-btn"
          type="button"
          onClick={() => navigateTo('log-choice')}
          className={`w-full h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs whitespace-nowrap ${
            isLogFlow
              ? 'bg-[#003852] text-white ring-2 ring-[#00567c]/25'
              : 'bg-[#00567c] hover:bg-[#004361] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">add</span>
          <span>Record Market Run</span>
        </button>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-9 px-3 rounded-xl bg-white/90 border border-black/[0.07] hover:border-[#00567c]/35 text-xs text-[#6e6e73] flex items-center justify-between transition-colors shadow-2xs"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[16px] text-[#86868b]">search</span>
            <span>Find food or market...</span>
          </span>
          <kbd className="text-[10px] font-mono-num font-semibold text-[#6e6e73] bg-[#f5f5f7] px-1.5 py-0.5 rounded border border-black/[0.06]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Lists (no ugly scrollbar, Apple macOS compact spacing) */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-1.5 space-y-4">
        <nav aria-label="Main Menu" className="space-y-0.5">
          <div className="px-3 pb-1 text-[11px] font-semibold text-[#86868b]">
            Market &amp; Spending
          </div>
          {primaryNav.map((item) => {
            const isActive = item.matchScreens.includes(currentScreen);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.onClick ? item.onClick() : navigateTo(item.screen))}
                className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#003852] font-semibold'
                    : 'text-[#3a3a3c] hover:text-[#1d1d1f] hover:bg-black/[0.04] font-medium'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-sidebar-active"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                    className="absolute inset-0 bg-white shadow-2xs border border-black/[0.05] rounded-xl"
                  />
                )}
                <span
                  className={`material-symbols-outlined text-[19px] relative z-10 ${
                    isActive ? 'filled text-[#00567c]' : 'text-[#6e6e73]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="relative z-10 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <nav aria-label="Settings & Tools" className="space-y-0.5 pt-3 border-t border-black/[0.06]">
          <div className="px-3 pb-1 text-[11px] font-semibold text-[#86868b]">
            Settings
          </div>
          {utilityNav.map((item) => {
            const isActive = item.matchScreens.includes(currentScreen);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.screen)}
                className={`relative w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#003852] font-semibold'
                    : 'text-[#3a3a3c] hover:text-[#1d1d1f] hover:bg-black/[0.04] font-medium'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-sidebar-active"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                    className="absolute inset-0 bg-white shadow-2xs border border-black/[0.05] rounded-xl"
                  />
                )}
                <span
                  className={`material-symbols-outlined text-[18px] relative z-10 ${
                    isActive ? 'filled text-[#00567c]' : 'text-[#6e6e73]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="relative z-10 truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-1.5 px-1">
            <PWAInstallButton variant="drawer" />
          </div>
        </nav>
      </div>

      {/* Compact Household & Sync Footer */}
      <div className="p-3 border-t border-black/[0.06] bg-white/70 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('account-security')}
            className="w-9 h-9 rounded-full overflow-hidden bg-[#00567c] text-white flex items-center justify-center text-xs font-bold tracking-tight shrink-0 hover:ring-2 hover:ring-[#00567c]/30 transition-all shadow-2xs"
            aria-label="Open account settings"
          >
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={userProfile.name || 'Account'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{avatarInitials}</span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#1d1d1f] truncate">
              {userProfile.household || 'My Home'}
            </div>
            {firebaseUser ? (
              <div className="text-[11px] text-[#15803d] font-medium flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                <span>Backed up online</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="text-[11px] text-[#00567c] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Back up with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
