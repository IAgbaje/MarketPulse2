import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  BLUEPRINT_CONSTRAINTS,
  sanitizeString,
} from '../lib/firebase';
import {
  saveTripToFirestore,
  updateTripInFirestore,
  deleteTripFromFirestore,
  updateBudgetInFirestore,
  updateBudgetSpendInFirestore,
  updateRegionInFirestore,
  updateProfileInFirestore,
  subscribeUserCloudData,
} from '../lib/firestoreSync';
import { useNavigation } from './NavigationContext';
import { useToast } from './ToastContext';
import {
  ScreenType,
  PriceMapTab,
  Trip,
  TripItem,
  BudgetConfig,
  Commodity,
  UserProfile,
  RegionProfile,
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_BUDGET,
  INITIAL_COMMODITIES,
  NIGERIAN_REGIONS,
} from '../data/initialData';
import { formatMarketDate } from '../components/ui/CalendarPicker';

const DEFAULT_STAGING_ITEMS: TripItem[] = [
  {
    id: 'stg-1',
    name: 'Tomatoes (Basket)',
    category: 'Produce',
    quantity: 1,
    unit: 'basket',
    unitDetail: '1 basket',
    price: 18500,
    previousPrice: 15000,
    annotationType: 'history',
    annotationText: 'You paid ₦15,000 on 4 Aug',
  },
  {
    id: 'stg-2',
    name: 'Rodo Pepper',
    category: 'Produce',
    quantity: 4,
    unit: 'kg',
    unitDetail: '4 kg',
    price: 1500,
    annotationType: 'community',
    annotationText: 'Others at Mile 12 paid ₦1,400–₦1,600 · 8 reports',
  },
  {
    id: 'stg-3',
    name: 'Palm Oil',
    category: 'Pantry Staples',
    quantity: 5,
    unit: 'L',
    unitDetail: '5 liters',
    price: 4200,
    annotationType: 'none',
  },
  {
    id: 'stg-4',
    name: 'Onions (Dry)',
    category: 'Produce',
    quantity: 1,
    unit: 'bag',
    unitDetail: '1 bag',
    price: 2500,
    annotationType: 'unsure',
    annotationText: 'Unsure if this is correct. Tap to verify.',
  },
  {
    id: 'stg-5',
    name: 'Rice (Local)',
    category: 'Pantry Staples',
    quantity: 1,
    unit: 'derica',
    unitDetail: '1 derica',
    price: 3800,
    annotationType: 'outlier',
    annotationText: 'Check this: unusually high for today',
  },
  {
    id: 'stg-6',
    name: 'Maggi Star',
    category: 'Spices',
    quantity: 2,
    unit: 'pack',
    unitDetail: '2 packs',
    price: 1200,
    annotationType: 'none',
  },
  {
    id: 'stg-7',
    name: 'Salt (Dangote)',
    category: 'Spices',
    quantity: 1,
    unit: 'sachet',
    unitDetail: '1 sachet',
    price: 200,
    annotationType: 'none',
  },
  {
    id: 'stg-8',
    name: 'Smoked Fish',
    category: 'Proteins',
    quantity: 3,
    unit: 'pieces',
    unitDetail: '3 pieces',
    price: 3200,
    annotationType: 'none',
  },
];

interface MarketPulseContextType {
  currentScreen: ScreenType;
  previousScreen: ScreenType | null;
  navigateTo: (screen: ScreenType, options?: { tab?: PriceMapTab; entityId?: string; replace?: boolean }) => void;
  goBack: () => void;

  // Firebase Auth State
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Regional Markets
  regions: RegionProfile[];
  activeRegion: RegionProfile;
  setActiveRegionId: (id: string) => void;
  availableMarkets: string[];

  trips: Trip[];
  selectedTrip: Trip | null;
  setSelectedTripOnly: (trip: Trip | null) => void;
  selectTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  restoreTrip: (trip: Trip) => void;

  commodities: Commodity[];
  selectedCommodity: Commodity;
  selectCommodityById: (id: string, navigate?: boolean) => void;

  budget: BudgetConfig;
  updateBudget: (updates: Partial<BudgetConfig>) => void;

  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Logging & Staging Flow
  stagingMarket: string;
  setStagingMarket: (market: string) => void;
  stagingDate: string;
  setStagingDate: (date: string) => void;
  stagingItems: TripItem[];
  setStagingItems: React.Dispatch<React.SetStateAction<TripItem[]>>;
  addStagingItem: (item: Omit<TripItem, 'id'>) => void;
  removeStagingItem: (id: string) => void;
  updateStagingItem: (id: string, updates: Partial<TripItem>) => void;
  clearStaging: () => void;
  saveStagingTrip: () => Trip;

  lastLoggedTrip: Trip | null;
  pendingRawInput: string;
  setPendingRawInput: (input: string) => void;

  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  secureAccount: (contact: string) => void;
  exportData: (format: 'csv' | 'json') => void;
  deleteAllData: () => void;
  resetToSampleData: () => void;

  // View state helpers
  isFirstTripDemo: boolean;
  setIsFirstTripDemo: (val: boolean) => void;
  activePriceMapTab: PriceMapTab;
  setActivePriceMapTab: (tab: PriceMapTab) => void;
  watchlistMarkets: string[];
  toggleWatchlistMarket: (marketName: string) => void;
}

const MarketPulseContext = createContext<MarketPulseContextType | undefined>(undefined);

export const MarketPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
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
  } = useNavigation();
  const { showToast } = useToast();

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeRegionId, setActiveRegionIdState] = useState<string>(() => {
    return localStorage.getItem('marketpulse_region') || 'lagos';
  });

  const activeRegion = NIGERIAN_REGIONS.find((r) => r.id === activeRegionId) || NIGERIAN_REGIONS[0];
  const availableMarkets = activeRegion.markets;

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('marketpulse_trips');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRIPS;
  });

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(() => trips[0] || null);
  const [commodities] = useState<Commodity[]>(INITIAL_COMMODITIES);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(INITIAL_COMMODITIES[0]);

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem('marketpulse_budget');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BUDGET;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('marketpulse_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          avatarInitials:
            (parsed.avatarInitials && String(parsed.avatarInitials).trim()) || 'AO',
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Adanna Okafor',
      household: 'My Home',
      location: 'Lagos, Nigeria',
      email: 'adanna.okafor@example.com',
      phone: '+234 803 123 4567',
      contact: '+234 803 123 4567',
      avatarInitials: 'AO',
      twoFactorEnabled: true,
      biometricLock: true,
      isSecured: false,
      syncState: 'local_only',
    };
  });

  const [stagingMarket, setStagingMarket] = useState<string>(activeRegion.markets[0] || 'Mile 12 Market');
  const [stagingDate, setStagingDate] = useState<string>(() => formatMarketDate(new Date()));
  const [stagingItems, setStagingItems] = useState<TripItem[]>(DEFAULT_STAGING_ITEMS);

  const [lastLoggedTrip, setLastLoggedTrip] = useState<Trip | null>(null);
  const [pendingRawInput, setPendingRawInput] = useState<string>('Bama Mayonnaise 1kg - Oshodi Market');
  const [isFirstTripDemo, setIsFirstTripDemo] = useState<boolean>(false);

  const [watchlistMarkets, setWatchlistMarkets] = useState<string[]>(() => {
    const saved = localStorage.getItem('marketpulse_watchlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['Mile 12 Market'];
      }
    }
    return ['Mile 12 Market'];
  });

  // Sync URL entityId to selected trip or commodity on browser Back/Forward
  useEffect(() => {
    if (!routeEntityId) return;
    if (currentScreen === 'trip-detail' || currentScreen === 'history') {
      const matched = trips.find((t) => t.id === routeEntityId);
      if (matched) setSelectedTrip(matched);
    } else if (currentScreen === 'commodity-detail') {
      const matched = commodities.find((c) => c.id === routeEntityId);
      if (matched) setSelectedCommodity(matched);
    }
  }, [currentScreen, routeEntityId, trips, commodities]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (!user) {
        setUserProfile((prev) => ({
          ...prev,
          isSecured: false,
          syncState: 'local_only',
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore real-time sync when signed in
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;
    return subscribeUserCloudData({
      firebaseUser,
      userProfile,
      activeRegionId,
      budget,
      trips,
      onRegionSync: (regionId) => {
        setActiveRegionIdState(regionId);
        localStorage.setItem('marketpulse_region', regionId);
      },
      onProfileSync: (updater) => setUserProfile(updater),
      onBudgetSync: (nextBudget) => setBudget(nextBudget),
      onTripsSync: (loadedTrips) => {
        setTrips(loadedTrips);
        setSelectedTrip((prev) => loadedTrips.find((t) => t.id === prev?.id) || loadedTrips[0] || null);
      },
    });
  }, [isAuthReady, firebaseUser]);

  // LocalStorage fallback persistence
  useEffect(() => {
    localStorage.setItem('marketpulse_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('marketpulse_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('marketpulse_user', JSON.stringify(userProfile));
  }, [userProfile]);

  const toggleWatchlistMarket = useCallback(
    (marketName: string) => {
      setWatchlistMarkets((prev) => {
        const exists = prev.includes(marketName);
        const next = exists ? prev.filter((m) => m !== marketName) : [...prev, marketName];
        localStorage.setItem('marketpulse_watchlist', JSON.stringify(next));
        showToast({
          message: exists ? `Removed ${marketName} from watchlist` : `Watching ${marketName}`,
          tone: exists ? 'default' : 'success',
        });
        return next;
      });
    },
    [showToast]
  );

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast({
        message: 'Connected to Google Cloud',
        description: 'Your trips and budget now sync across devices.',
        tone: 'success',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      console.error('Google Sign-In error:', error);
      setAuthError(msg);
      showToast({ message: 'Google Sign-In failed', description: msg, tone: 'danger' });
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      showToast({ message: 'Signed out of cloud sync', tone: 'default' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to sign out.';
      console.error('Sign-Out error:', error);
      setAuthError(msg);
    }
  };

  const setActiveRegionId = useCallback(
    (id: string) => {
      const safeRegionId = sanitizeString(id, BLUEPRINT_CONSTRAINTS.REGION_ID_MAX_LEN, 'lagos');
      setActiveRegionIdState(safeRegionId);
      localStorage.setItem('marketpulse_region', safeRegionId);
      const reg = NIGERIAN_REGIONS.find((r) => r.id === safeRegionId) || NIGERIAN_REGIONS[0];
      setStagingMarket(reg.markets[0]);
      const newLocation = sanitizeString(`${reg.name}, Nigeria`, BLUEPRINT_CONSTRAINTS.LOCATION_MAX_LEN, 'Lagos, Nigeria');

      setUserProfile((prev) => ({
        ...prev,
        location: newLocation,
      }));

      showToast({
        message: `Market hub switched to ${reg.name}`,
        description: reg.tagline,
        tone: 'default',
      });

      if (firebaseUser) {
        updateRegionInFirestore(firebaseUser.uid, safeRegionId, newLocation);
      }
    },
    [firebaseUser, showToast]
  );

  const selectTrip = useCallback(
    (trip: Trip) => {
      setSelectedTrip(trip);
      navigateTo('trip-detail', { entityId: trip.id });
    },
    [navigateTo]
  );

  const updateTrip = useCallback(
    (id: string, updates: Partial<Trip>) => {
      let updatedTripObj: Trip | null = null;
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updated: Trip = { ...t, ...updates };
            if (updates.items) {
              updated.itemsCount = updates.items.length;
              updated.total = updates.items.reduce((acc, curr) => acc + (curr.price || 0), 0);
            }
            if (selectedTrip?.id === id) {
              setSelectedTrip(updated);
            }
            updatedTripObj = updated;
            return updated;
          }
          return t;
        })
      );

      if (firebaseUser && updatedTripObj) {
        updateTripInFirestore(updatedTripObj);
      }
    },
    [firebaseUser, selectedTrip]
  );

  const restoreTrip = useCallback(
    (trip: Trip) => {
      setTrips((prev) => {
        if (prev.some((t) => t.id === trip.id)) return prev;
        const next = [trip, ...prev].sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));
        return next;
      });
      setSelectedTrip(trip);
      if (firebaseUser) {
        saveTripToFirestore(firebaseUser.uid, trip);
      }
      showToast({ message: `Restored ${trip.market} trip`, tone: 'success' });
    },
    [firebaseUser, showToast]
  );

  const deleteTrip = useCallback(
    (id: string) => {
      const tripToDelete = trips.find((t) => t.id === id);
      if (!tripToDelete) return;

      const remaining = trips.filter((t) => t.id !== id);
      setTrips(remaining);
      if (selectedTrip?.id === id) {
        setSelectedTrip(remaining[0] || null);
      }

      if (firebaseUser) {
        deleteTripFromFirestore(tripToDelete);
      }

      showToast({
        message: `Deleted ${tripToDelete.market} trip`,
        description: `₦${tripToDelete.total.toLocaleString()} · ${tripToDelete.itemsCount || tripToDelete.items.length} items`,
        tone: 'default',
        action: {
          label: 'Undo',
          onClick: () => restoreTrip(tripToDelete),
        },
      });
    },
    [trips, selectedTrip, firebaseUser, showToast, restoreTrip]
  );

  const selectCommodityById = useCallback(
    (id: string, shouldNavigate = true) => {
      const found = commodities.find((c) => c.id === id);
      if (found) {
        setSelectedCommodity(found);
        if (shouldNavigate) {
          navigateTo('commodity-detail', { entityId: found.id });
        }
      }
    },
    [commodities, navigateTo]
  );

  const addStagingItem = useCallback((item: Omit<TripItem, 'id'>) => {
    const newItem: TripItem = {
      ...item,
      id: `stg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setStagingItems((prev) => [...prev, newItem]);
  }, []);

  const removeStagingItem = useCallback(
    (id: string) => {
      let removed: TripItem | undefined;
      setStagingItems((prev) => {
        removed = prev.find((i) => i.id === id);
        return prev.filter((i) => i.id !== id);
      });
      if (removed) {
        const snapshot = removed;
        showToast({
          message: `Removed ${snapshot.name}`,
          action: {
            label: 'Undo',
            onClick: () => setStagingItems((prev) => [...prev, snapshot]),
          },
        });
      }
    },
    [showToast]
  );

  const updateStagingItem = useCallback((id: string, updates: Partial<TripItem>) => {
    setStagingItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const clearStaging = useCallback(() => {
    setStagingItems([]);
  }, []);

  const saveStagingTrip = useCallback((): Trip => {
    const total = stagingItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      market: stagingMarket || 'Mile 12 Market',
      date: stagingDate || 'Today',
      rawDate: new Date().toISOString(),
      itemsCount: stagingItems.length,
      total,
      syncStatus: firebaseUser ? 'synced' : 'local_only',
      pctChange: 5.4,
      isPositiveChange: true,
      items: [...stagingItems],
    };

    setTrips((prev) => [newTrip, ...prev]);
    setLastLoggedTrip(newTrip);
    setSelectedTrip(newTrip);

    let addProduce = 0;
    let addProteins = 0;
    let addPantry = 0;
    stagingItems.forEach((item) => {
      if (item.category === 'Produce') addProduce += item.price;
      else if (item.category === 'Proteins') addProteins += item.price;
      else addPantry += item.price;
    });

    const nextBudget: BudgetConfig = {
      ...budget,
      spentSoFar: budget.spentSoFar + total,
      categoryBudgets: {
        produce: {
          ...budget.categoryBudgets.produce,
          spent: budget.categoryBudgets.produce.spent + addProduce,
        },
        proteins: {
          ...budget.categoryBudgets.proteins,
          spent: budget.categoryBudgets.proteins.spent + addProteins,
        },
        pantry: {
          ...budget.categoryBudgets.pantry,
          spent: budget.categoryBudgets.pantry.spent + addPantry,
        },
      },
    };
    setBudget(nextBudget);
    setStagingItems([]);

    if (firebaseUser) {
      saveTripToFirestore(firebaseUser.uid, newTrip);
      updateBudgetSpendInFirestore(firebaseUser.uid, nextBudget);
    }

    showToast({
      message: `Saved trip at ${newTrip.market}`,
      description: `₦${newTrip.total.toLocaleString()} across ${newTrip.itemsCount} items`,
      tone: 'success',
    });

    return newTrip;
  }, [stagingItems, stagingMarket, stagingDate, firebaseUser, budget, showToast]);

  const updateBudget = useCallback(
    (updates: Partial<BudgetConfig>) => {
      const next: BudgetConfig = { ...budget, ...updates };
      setBudget(next);

      if (firebaseUser) {
        updateBudgetInFirestore(firebaseUser.uid, next);
      }

      showToast({
        message: 'Budget target updated',
        description: `Monthly target set to ₦${next.monthlyTarget.toLocaleString()}`,
        tone: 'success',
      });
    },
    [budget, firebaseUser, showToast]
  );

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      const next = { ...userProfile, ...updates };
      setUserProfile(next);

      if (firebaseUser) {
        const includePrivate =
          updates.email !== undefined || updates.phone !== undefined || updates.contact !== undefined;
        updateProfileInFirestore(firebaseUser.uid, next, includePrivate);
      }
    },
    [userProfile, firebaseUser]
  );

  const secureAccount = useCallback(
    (contact: string) => {
      updateProfile({
        contact,
        isSecured: true,
        syncState: firebaseUser ? 'synced' : 'local_only',
      });
      showToast({
        message: 'Silent backup secured',
        description: `Recovery contact linked: ${contact}`,
        tone: 'success',
      });
    },
    [updateProfile, firebaseUser, showToast]
  );

  const exportData = useCallback(
    (format: 'csv' | 'json') => {
      if (format === 'json') {
        const dataStr = JSON.stringify({ trips, budget, userProfile }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketpulse-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        let csvContent = 'Date,Market,Item Name,Category,Quantity,Unit,Price (NGN)\n';
        trips.forEach((t) => {
          t.items.forEach((item) => {
            csvContent += `"${t.date}","${t.market}","${item.name}","${item.category}",${item.quantity},"${item.unit}",${item.price}\n`;
          });
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketpulse-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      showToast({
        message: `Exported ${format.toUpperCase()} file`,
        description: `${trips.length} trips saved to your device.`,
        tone: 'success',
      });
    },
    [trips, budget, userProfile, showToast]
  );

  const deleteAllData = useCallback(() => {
    const currentTrips = [...trips];
    setTrips([]);
    setSelectedTrip(null);
    const emptyBudget: BudgetConfig = {
      monthlyTarget: 100000,
      spentSoFar: 0,
      currentDay: 1,
      totalDays: 30,
      frequency: 'Monthly',
      categoryBudgets: {
        produce: { budget: 30000, spent: 0 },
        proteins: { budget: 40000, spent: 0 },
        pantry: { budget: 30000, spent: 0 },
      },
    };
    setBudget(emptyBudget);
    localStorage.removeItem('marketpulse_trips');
    localStorage.removeItem('marketpulse_budget');

    if (firebaseUser) {
      currentTrips.forEach((t) => deleteTripFromFirestore(t));
      updateBudgetInFirestore(firebaseUser.uid, emptyBudget);
    }

    showToast({
      message: 'All market data deleted',
      tone: 'warning',
    });
  }, [trips, firebaseUser, showToast]);

  const resetToSampleData = useCallback(() => {
    setTrips(INITIAL_TRIPS);
    setSelectedTrip(INITIAL_TRIPS[0]);
    setBudget(INITIAL_BUDGET);
    localStorage.setItem('marketpulse_trips', JSON.stringify(INITIAL_TRIPS));
    localStorage.setItem('marketpulse_budget', JSON.stringify(INITIAL_BUDGET));

    if (firebaseUser) {
      INITIAL_TRIPS.forEach((t) => saveTripToFirestore(firebaseUser.uid, t));
      updateBudgetInFirestore(firebaseUser.uid, INITIAL_BUDGET);
    }

    showToast({
      message: 'Sample Lagos market data restored',
      tone: 'success',
    });
  }, [firebaseUser, showToast]);

  return (
    <MarketPulseContext.Provider
      value={{
        currentScreen,
        previousScreen,
        navigateTo,
        goBack,
        firebaseUser,
        isAuthReady,
        authError,
        signInWithGoogle,
        signOutUser,
        regions: NIGERIAN_REGIONS,
        activeRegion,
        setActiveRegionId,
        availableMarkets,
        trips,
        selectedTrip,
        setSelectedTripOnly: setSelectedTrip,
        selectTrip,
        updateTrip,
        deleteTrip,
        restoreTrip,
        commodities,
        selectedCommodity,
        selectCommodityById,
        budget,
        updateBudget,
        isDrawerOpen,
        setDrawerOpen,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        stagingMarket,
        setStagingMarket,
        stagingDate,
        setStagingDate,
        stagingItems,
        setStagingItems,
        addStagingItem,
        removeStagingItem,
        updateStagingItem,
        clearStaging,
        saveStagingTrip,
        lastLoggedTrip,
        pendingRawInput,
        setPendingRawInput,
        userProfile,
        updateProfile,
        secureAccount,
        exportData,
        deleteAllData,
        resetToSampleData,
        isFirstTripDemo,
        setIsFirstTripDemo,
        activePriceMapTab,
        setActivePriceMapTab,
        watchlistMarkets,
        toggleWatchlistMarket,
      }}
    >
      {children}
    </MarketPulseContext.Provider>
  );
};

export const useMarketPulse = () => {
  const context = useContext(MarketPulseContext);
  if (!context) {
    throw new Error('useMarketPulse must be used within a MarketPulseProvider');
  }
  return context;
};
