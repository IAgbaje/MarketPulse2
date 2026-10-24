import React from 'react';
import { MarketPulseProvider, useMarketPulse } from './context/MarketPulseContext';
import { TopAppBar } from './components/TopAppBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNavBar } from './components/BottomNavBar';
import { LandingPageScreen } from './components/LandingPageScreen';
import { HomeScreen } from './components/HomeScreen';
import { PriceMapScreen } from './components/PriceMapScreen';
import { WeeklyReportScreen } from './components/WeeklyReportScreen';
import { LogChoiceScreen } from './components/LogChoiceScreen';
import { LogScanScreen } from './components/LogScanScreen';
import { LogPendingScreen } from './components/LogPendingScreen';
import { LogConfirmScreen } from './components/LogConfirmScreen';
import { LogSuccessScreen } from './components/LogSuccessScreen';
import { TripHistoryScreen } from './components/TripHistoryScreen';
import { TripDetailScreen } from './components/TripDetailScreen';
import { CommodityDetailScreen } from './components/CommodityDetailScreen';
import { BudgetScreen } from './components/BudgetScreen';
import { SetBudgetScreen } from './components/SetBudgetScreen';
import { DataManagementScreen } from './components/DataManagementScreen';
import { AccountSecurityScreen } from './components/AccountSecurityScreen';
import { OfflineIndicator } from './components/OfflineIndicator';

const MainScreenRouter: React.FC = () => {
  const { currentScreen } = useMarketPulse();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPageScreen />;
      case 'home':
        return <HomeScreen />;
      case 'price-map':
        return <PriceMapScreen />;
      case 'weekly-report':
        return <WeeklyReportScreen />;
      case 'log-choice':
      case 'log-manual':
        return <LogChoiceScreen />;
      case 'log-scan':
        return <LogScanScreen />;
      case 'log-pending':
        return <LogPendingScreen />;
      case 'log-confirm':
        return <LogConfirmScreen />;
      case 'log-success':
        return <LogSuccessScreen />;
      case 'history':
        return <TripHistoryScreen />;
      case 'trip-detail':
        return <TripDetailScreen />;
      case 'commodity-detail':
        return <CommodityDetailScreen />;
      case 'budget':
        return <BudgetScreen />;
      case 'set-budget':
        return <SetBudgetScreen />;
      case 'data-management':
      case 'data-mgmt':
        return <DataManagementScreen />;
      case 'account-security':
      case 'secure-account':
        return <AccountSecurityScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Hide bottom navbar on full-screen immersion workflows and marketing landing page
  const hideBottomNav =
    currentScreen === 'landing' ||
    currentScreen === 'log-scan' ||
    currentScreen === 'log-pending' ||
    currentScreen === 'log-confirm' ||
    currentScreen === 'log-choice' ||
    currentScreen === 'log-manual' ||
    currentScreen === 'log-success';

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#191c1f] relative flex flex-col font-sans selection:bg-[#cbe3f7] selection:text-[#00567c]">
      <TopAppBar />
      <OfflineIndicator />
      <NavigationDrawer />

      <main className="flex-1 w-full">{renderScreen()}</main>

      {!hideBottomNav && <BottomNavBar />}
    </div>
  );
};

export function App() {
  return (
    <MarketPulseProvider>
      <MainScreenRouter />
    </MarketPulseProvider>
  );
}

export default App;
