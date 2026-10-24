import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const BottomNavBar: React.FC = () => {
  const { currentScreen, navigateTo } = useMarketPulse();

  const getActiveTab = (): 'home' | 'price-map' | 'log' | 'history' | 'budget' => {
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
      className="fixed bottom-0 left-0 right-0 w-full bg-[#f8f9fd]/95 backdrop-blur-md border-t border-[#c0c7cf]/40 shadow-sm z-50 flex justify-around items-center px-1.5 py-2 md:py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {/* 1. Home Tab */}
      <button
        id="bottom-nav-home"
        onClick={() => navigateTo('home')}
        className={`flex flex-col items-center justify-center transition-all duration-150 flex-1 py-1 ${
          activeTab === 'home'
            ? 'bg-[#2a6f97] text-white px-3 py-1.5 shadow-xs rounded-full'
            : 'text-[#40484e] hover:bg-[#eceef1] rounded-xl active:scale-95'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[21px] mb-0.5 ${
            activeTab === 'home' ? 'filled' : ''
          }`}
        >
          home
        </span>
        <span
          className={`text-[10px] sm:text-[11px] leading-tight ${
            activeTab === 'home' ? 'font-bold' : 'font-medium'
          }`}
        >
          Home
        </span>
      </button>

      {/* 2. Price Map Tab */}
      <button
        id="bottom-nav-price-map"
        onClick={() => navigateTo('price-map')}
        className={`flex flex-col items-center justify-center transition-all duration-150 flex-1 py-1 ${
          activeTab === 'price-map'
            ? 'bg-[#2a6f97] text-white px-3 py-1.5 shadow-xs rounded-full'
            : 'text-[#40484e] hover:bg-[#eceef1] rounded-xl active:scale-95'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[21px] mb-0.5 ${
            activeTab === 'price-map' ? 'filled' : ''
          }`}
        >
          map
        </span>
        <span
          className={`text-[10px] sm:text-[11px] leading-tight whitespace-nowrap ${
            activeTab === 'price-map' ? 'font-bold' : 'font-medium'
          }`}
        >
          Price Map
        </span>
      </button>

      {/* 3. Log Tab */}
      <button
        id="bottom-nav-log"
        onClick={() => navigateTo('log-choice')}
        className={`flex flex-col items-center justify-center transition-all duration-150 flex-1 py-1 ${
          activeTab === 'log'
            ? 'bg-[#2a6f97] text-white px-3 py-1.5 shadow-xs rounded-full'
            : 'text-[#40484e] hover:bg-[#eceef1] rounded-xl active:scale-95'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[21px] mb-0.5 ${
            activeTab === 'log' ? 'filled' : ''
          }`}
        >
          add_circle
        </span>
        <span
          className={`text-[10px] sm:text-[11px] leading-tight ${
            activeTab === 'log' ? 'font-bold' : 'font-medium'
          }`}
        >
          Log
        </span>
      </button>

      {/* 4. History Tab */}
      <button
        id="bottom-nav-history"
        onClick={() => navigateTo('history')}
        className={`flex flex-col items-center justify-center transition-all duration-150 flex-1 py-1 ${
          activeTab === 'history'
            ? 'bg-[#2a6f97] text-white px-3 py-1.5 shadow-xs rounded-full'
            : 'text-[#40484e] hover:bg-[#eceef1] rounded-xl active:scale-95'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[21px] mb-0.5 ${
            activeTab === 'history' ? 'filled' : ''
          }`}
        >
          history
        </span>
        <span
          className={`text-[10px] sm:text-[11px] leading-tight ${
            activeTab === 'history' ? 'font-bold' : 'font-medium'
          }`}
        >
          History
        </span>
      </button>

      {/* 5. Budget Tab */}
      <button
        id="bottom-nav-budget"
        onClick={() => navigateTo('budget')}
        className={`flex flex-col items-center justify-center transition-all duration-150 flex-1 py-1 ${
          activeTab === 'budget'
            ? 'bg-[#2a6f97] text-white px-3 py-1.5 shadow-xs rounded-full'
            : 'text-[#40484e] hover:bg-[#eceef1] rounded-xl active:scale-95'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[21px] mb-0.5 ${
            activeTab === 'budget' ? 'filled' : ''
          }`}
        >
          account_balance_wallet
        </span>
        <span
          className={`text-[10px] sm:text-[11px] leading-tight ${
            activeTab === 'budget' ? 'font-bold' : 'font-medium'
          }`}
        >
          Budget
        </span>
      </button>
    </nav>
  );
};
