import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider } from './context/NavigationContext';
import { MarketPulseProvider, useMarketPulse } from './context/MarketPulseContext';
import { DesktopSidebar } from './components/DesktopSidebar';
import { TopAppBar } from './components/TopAppBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNavBar } from './components/BottomNavBar';
import { CommandPalette } from './components/ui/CommandPalette';
import { ToastViewport } from './components/ui/ToastViewport';
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
import { UsageAnalyticsScreen } from './components/UsageAnalyticsScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { trackScreenView, trackSessionEnd, trackFeatureAction } from './lib/analytics';

const MainScreenRouter: React.FC = () => {
  const { currentScreen, activeRegion } = useMarketPulse();
  const prevScreenRef = useRef<string | null>(null);
  const prevRegionRef = useRef<string>(activeRegion.id);
  const currentScreenRef = useRef<string>(currentScreen);
  const currentRegionNameRef = useRef<string>(activeRegion.name);

  currentScreenRef.current = currentScreen;
  currentRegionNameRef.current = activeRegion.name;

  // Track every landing view and screen-to-screen navigation journey
  useEffect(() => {
    const fromScreen = prevScreenRef.current;
    trackScreenView({
      screen: currentScreen,
      fromScreen,
      region: activeRegion.name,
    });
    prevScreenRef.current = currentScreen;
  }, [currentScreen]);

  // Track state switches across desktop & mobile browsers
  useEffect(() => {
    if (prevRegionRef.current !== activeRegion.id) {
      prevRegionRef.current = activeRegion.id;
      trackFeatureAction({
        action: 'switch_state',
        detail: activeRegion.name,
        screen: currentScreenRef.current,
        region: activeRegion.name,
      });
    }
  }, [activeRegion.id, activeRegion.name]);

  // Reliably flush session duration on pagehide / tab switch (iOS Safari + Android Chrome)
  useEffect(() => {
    const handleLeave = () => {
      trackSessionEnd(currentScreenRef.current, currentRegionNameRef.current);
    };
    const handleVis = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    };
    window.addEventListener('pagehide', handleLeave);
    document.addEventListener('visibilitychange', handleVis);
    return () => {
      window.removeEventListener('pagehide', handleLeave);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

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
      case 'usage-analytics':
        return <UsageAnalyticsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isLanding = currentScreen === 'landing';

  const hideBottomNav =
    isLanding ||
    currentScreen === 'log-scan' ||
    currentScreen === 'log-pending' ||
    currentScreen === 'log-confirm' ||
    currentScreen === 'log-choice' ||
    currentScreen === 'log-manual' ||
    currentScreen === 'log-success';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#f5f5f7] text-[#1d1d1f] relative flex flex-col overflow-x-clip selection:bg-[#d4e8f7] selection:text-[#00567c]">
      {!isLanding && <DesktopSidebar />}
      <TopAppBar />
      <OfflineIndicator />
      <NavigationDrawer />
      <CommandPalette />
      <ToastViewport />

      <main className={`flex-1 w-full min-w-0 ${!isLanding ? 'lg:pl-64' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
            className="w-full min-w-0"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideBottomNav && <BottomNavBar />}
    </div>
  );
};

export function App() {
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = React.useState(false);

  React.useEffect(() => {
    const handleQuotaExceeded = () => {
      setGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {gmpQuotaExceeded && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm"
        >
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <ToastProvider>
        <NavigationProvider>
          <MarketPulseProvider>
            <MainScreenRouter />
          </MarketPulseProvider>
        </NavigationProvider>
      </ToastProvider>
    </MotionConfig>
  );
}

export default App;
