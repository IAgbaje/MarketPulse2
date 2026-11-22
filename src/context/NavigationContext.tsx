import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScreenType, PriceMapTab } from '../types';

const VALID_SCREENS: ScreenType[] = [
  'landing',
  'home',
  'price-map',
  'weekly-report',
  'log-choice',
  'log-scan',
  'log-manual',
  'log-confirm',
  'log-pending',
  'log-success',
  'history',
  'trip-detail',
  'commodity-detail',
  'budget',
  'set-budget',
  'data-management',
  'data-mgmt',
  'account-security',
  'secure-account',
  'usage-analytics',
];

const VALID_PRICE_MAP_TABS: PriceMapTab[] = ['map', 'markets', 'basket'];

interface ParsedHashRoute {
  screen: ScreenType;
  priceMapTab?: PriceMapTab;
  entityId?: string;
}

function getDefaultInitialScreen(): ScreenType {
  if (typeof window === 'undefined') return 'landing';
  try {
    return localStorage.getItem('mp_onboarded') === '1' ? 'home' : 'landing';
  } catch {
    return 'landing';
  }
}

function parseHashRoute(hashStr: string): ParsedHashRoute {
  const cleaned = hashStr.replace(/^#\/?/, '').trim();
  if (!cleaned) return { screen: getDefaultInitialScreen() };

  const [pathPart, queryPart] = cleaned.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const rawScreen = segments[0] as ScreenType;

  const screen: ScreenType = VALID_SCREENS.includes(rawScreen) ? rawScreen : 'home';
  const entityId = segments[1] ? decodeURIComponent(segments[1]) : undefined;

  let priceMapTab: PriceMapTab | undefined;
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const t = params.get('tab') as PriceMapTab | null;
    if (t && VALID_PRICE_MAP_TABS.includes(t)) {
      priceMapTab = t;
    }
  } else if (screen === 'price-map' && entityId && VALID_PRICE_MAP_TABS.includes(entityId as PriceMapTab)) {
    priceMapTab = entityId as PriceMapTab;
  }

  return { screen, priceMapTab, entityId };
}

function buildHashUrl(screen: ScreenType, options?: { tab?: PriceMapTab; entityId?: string }): string {
  if (screen === 'price-map' && options?.tab) {
    return `#/${screen}?tab=${options.tab}`;
  }
  if (options?.entityId) {
    return `#/${screen}/${encodeURIComponent(options.entityId)}`;
  }
  return `#/${screen}`;
}

interface NavigationContextValue {
  currentScreen: ScreenType;
  previousScreen: ScreenType | null;
  activePriceMapTab: PriceMapTab;
  routeEntityId: string | null;
  isDrawerOpen: boolean;
  isCommandPaletteOpen: boolean;
  navigateTo: (screen: ScreenType, options?: { tab?: PriceMapTab; entityId?: string; replace?: boolean }) => void;
  setActivePriceMapTab: (tab: PriceMapTab) => void;
  goBack: () => void;
  setDrawerOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = parseHashRoute(typeof window !== 'undefined' ? window.location.hash : '');

  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialRoute.screen);
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([initialRoute.screen]);
  const [activePriceMapTab, setActivePriceMapTabState] = useState<PriceMapTab>(
    initialRoute.priceMapTab || 'map'
  );
  const [routeEntityId, setRouteEntityId] = useState<string | null>(initialRoute.entityId || null);
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Ensure initial URL hash exists cleanly without pushing a duplicate history entry
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.hash) {
      window.history.replaceState({ screen: initialRoute.screen }, '', buildHashUrl(initialRoute.screen));
    }
  }, []);

  // Listen for browser Back/Forward (popstate & hashchange)
  useEffect(() => {
    const syncFromLocation = () => {
      const parsed = parseHashRoute(window.location.hash);
      setCurrentScreen(parsed.screen);
      if (parsed.priceMapTab) {
        setActivePriceMapTabState(parsed.priceMapTab);
      }
      setRouteEntityId(parsed.entityId || null);
      setDrawerOpen(false);
      setCommandPaletteOpen(false);
      setScreenHistory((prev) => {
        if (prev[prev.length - 1] === parsed.screen) return prev;
        return [...prev.slice(-15), parsed.screen];
      });
    };

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  // Global keyboard shortcuts: Cmd/Ctrl+K or '/' for Command Palette, Escape to dismiss overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (!isTyping && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (isDrawerOpen) {
          setDrawerOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isDrawerOpen]);

  const navigateTo = useCallback(
    (screen: ScreenType, options?: { tab?: PriceMapTab; entityId?: string; replace?: boolean }) => {
      const nextTab = options?.tab ?? (screen === 'price-map' ? activePriceMapTab : undefined);
      if (options?.tab) {
        setActivePriceMapTabState(options.tab);
      }
      setRouteEntityId(options?.entityId ?? null);
      setCurrentScreen(screen);
      setDrawerOpen(false);
      setCommandPaletteOpen(false);

      setScreenHistory((prev) => {
        if (options?.replace) {
          return [...prev.slice(0, -1), screen];
        }
        return [...prev.slice(-19), screen];
      });

      const targetHash = buildHashUrl(screen, { tab: nextTab, entityId: options?.entityId });
      if (typeof window !== 'undefined' && window.location.hash !== targetHash) {
        if (options?.replace) {
          window.history.replaceState({ screen, tab: nextTab, entityId: options?.entityId }, '', targetHash);
        } else {
          window.history.pushState({ screen, tab: nextTab, entityId: options?.entityId }, '', targetHash);
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activePriceMapTab]
  );

  const setActivePriceMapTab = useCallback(
    (tab: PriceMapTab) => {
      setActivePriceMapTabState(tab);
      if (currentScreen === 'price-map' && typeof window !== 'undefined') {
        const targetHash = buildHashUrl('price-map', { tab });
        if (window.location.hash !== targetHash) {
          window.history.replaceState({ screen: 'price-map', tab }, '', targetHash);
        }
      }
    },
    [currentScreen]
  );

  const goBack = useCallback(() => {
    if (screenHistory.length > 1) {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return;
      }
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const target = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(target);
    } else {
      navigateTo('home', { replace: true });
    }
  }, [screenHistory, navigateTo]);

  const previousScreen =
    screenHistory.length > 1 ? screenHistory[screenHistory.length - 2] : null;

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        previousScreen,
        activePriceMapTab,
        routeEntityId,
        isDrawerOpen,
        isCommandPaletteOpen,
        navigateTo,
        setActivePriceMapTab,
        goBack,
        setDrawerOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
};
