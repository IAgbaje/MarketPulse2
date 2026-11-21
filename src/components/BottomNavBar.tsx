import React from 'react';
import { motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { ScreenType } from '../types';

type TabKey = 'home' | 'price-map' | 'log' | 'history' | 'budget';

interface TabConfig {
  id: TabKey;
  domId: string;
  label: string;
  icon: string;
  target: ScreenType;
}

const MOBILE_TABS: TabConfig[] = [
  { id: 'home', domId: 'bottom-nav-home', label: 'Home', icon: 'home', target: 'home' },
  { id: 'price-map', domId: 'bottom-nav-price-map', label: 'Prices', icon: 'map', target: 'price-map' },
  { id: 'log', domId: 'bottom-nav-log', label: 'Record', icon: 'add_circle', target: 'log-choice' },
  { id: 'history', domId: 'bottom-nav-history', label: 'Trips', icon: 'receipt_long', target: 'history' },
  {
    id: 'budget',
    domId: 'bottom-nav-budget',
    label: 'Budget',
    icon: 'account_balance_wallet',
    target: 'budget',
  },
];

export const BottomNavBar: React.FC = () => {
  const { currentScreen, navigateTo } = useMarketPulse();

  const getActiveTab = (): TabKey => {
    if (currentScreen === 'price-map' || currentScreen === 'commodity-detail') {
      return 'price-map';
    }
    if (
      currentScreen === 'log-choice' ||
      currentScreen === 'log-scan' ||
      currentScreen === 'log-manual' ||
      currentScreen === 'log-confirm' ||
      currentScreen === 'log-pending' ||
      currentScreen === 'log-success'
    ) {
      return 'log';
    }
    if (currentScreen === 'history' || currentScreen === 'trip-detail') {
      return 'history';
    }
    if (
      currentScreen === 'budget' ||
      currentScreen === 'set-budget' ||
      currentScreen === 'weekly-report'
    ) {
      return 'budget';
    }
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 w-full glass-surface border-t border-slate-900/10 z-40 grid grid-cols-5 items-center px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {MOBILE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={tab.domId}
            type="button"
            onClick={() => navigateTo(tab.target)}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center min-h-[48px] py-0.5 transition-colors active:scale-95 select-none"
          >
            {/* Genuine Material 3 Active Icon Pill Indicator */}
            <span className="relative flex items-center justify-center w-14 h-7 rounded-full mb-0.5">
              {isActive && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  className="absolute inset-0 bg-[#d4e8f7] rounded-full"
                />
              )}
              <span
                className={`material-symbols-outlined text-[21px] relative z-10 transition-colors ${
                  isActive ? 'filled text-[#00567c]' : 'text-[#64748b]'
                }`}
              >
                {tab.icon}
              </span>
            </span>
            <span
              className={`text-[11px] leading-tight whitespace-nowrap transition-colors ${
                isActive ? 'font-bold text-[#003852]' : 'font-medium text-[#64748b]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
