import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  BLUEPRINT_CONSTRAINTS,
  sanitizeString,
  sanitizeId,
} from '../lib/firebase';
import {
  ScreenType,
  PriceMapTab,
  Trip,
  TripItem,
  BudgetConfig,
  Commodity,
  UserProfile,
  RegionProfile,
  ItemCategory,
  UnitType,
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_BUDGET,
  INITIAL_COMMODITIES,
  NIGERIAN_REGIONS,
} from '../data/initialData';

interface MarketPulseContextType {
  currentScreen: ScreenType;
  previousScreen: ScreenType | null;
  navigateTo: (screen: ScreenType) => void;
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
  selectTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  commodities: Commodity[];
  selectedCommodity: Commodity;
  selectCommodityById: (id: string) => void;

  budget: BudgetConfig;
  updateBudget: (updates: Partial<BudgetConfig>) => void;

  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

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

const VALID_CATEGORIES: ItemCategory[] = ['Produce', 'Proteins', 'Pantry Staples', 'Household', 'Spices'];
const VALID_ANNOTATIONS = ['history', 'community', 'unsure', 'outlier', 'none'] as const;

export const MarketPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const isBootstrappingRef = useRef<boolean>(false);

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

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(INITIAL_TRIPS[0]);
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

  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('marketpulse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Adanna Okafor',
      household: 'My Household',
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

  // Staging items for active trip capture / scanner
  const [stagingMarket, setStagingMarket] = useState<string>('Mile 12 Market');
  const [stagingDate, setStagingDate] = useState<string>('Today, 14 Oct');
  const [stagingItems, setStagingItems] = useState<TripItem[]>([
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
  ]);

  const [lastLoggedTrip, setLastLoggedTrip] = useState<Trip | null>(null);
  const [pendingRawInput, setPendingRawInput] = useState<string>(
    'Bama Mayonnaise 1kg - Oshodi Market'
  );
  const [isFirstTripDemo, setIsFirstTripDemo] = useState<boolean>(false);
  const [activePriceMapTab, setActivePriceMapTab] = useState<PriceMapTab>('map');
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

  const toggleWatchlistMarket = (marketName: string) => {
    setWatchlistMarkets((prev) => {
      const next = prev.includes(marketName)
        ? prev.filter((m) => m !== marketName)
        : [...prev, marketName];
      localStorage.setItem('marketpulse_watchlist', JSON.stringify(next));
      return next;
    });
  };

  // Helper to persist a Trip and its TripItems to Firestore
  const saveTripToFirestore = async (uid: string, trip: Trip) => {
    const safeTripId = sanitizeId(trip.id);
    const tripPath = `trips/${safeTripId}`;
    try {
      await setDoc(doc(db, 'trips', safeTripId), {
        uid,
        market: sanitizeString(trip.market, BLUEPRINT_CONSTRAINTS.MARKET_MAX_LEN, 'Mile 12 Market'),
        date: sanitizeString(trip.date, BLUEPRINT_CONSTRAINTS.DATE_MAX_LEN, 'Today'),
        rawDate: sanitizeString(trip.rawDate, BLUEPRINT_CONSTRAINTS.DATE_MAX_LEN, new Date().toISOString()),
        itemsCount: Math.max(0, Math.min(500, Math.round(trip.items.length))),
        total: Math.max(0, Math.min(100000000, Number(trip.total) || 0)),
        syncStatus: 'synced',
        pctChange: Math.max(-1000, Math.min(10000, Number(trip.pctChange) || 0)),
        isPositiveChange: Boolean(trip.isPositiveChange),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, tripPath);
    }

    for (const item of trip.items) {
      const safeItemId = sanitizeId(item.id);
      const itemPath = `trips/${safeTripId}/items/${safeItemId}`;
      const safeCategory: ItemCategory = VALID_CATEGORIES.includes(item.category)
        ? item.category
        : 'Household';
      const safeAnnotation = VALID_ANNOTATIONS.includes(item.annotationType as any)
        ? item.annotationType || 'none'
        : 'none';
      try {
        await setDoc(doc(db, 'trips', safeTripId, 'items', safeItemId), {
          uid,
          tripId: safeTripId,
          name: sanitizeString(item.name, BLUEPRINT_CONSTRAINTS.ITEM_NAME_MAX_LEN, 'Grocery Item'),
          category: safeCategory,
          quantity: Math.max(0.01, Math.min(100000, Number(item.quantity) || 1)),
          unit: sanitizeString(item.unit, BLUEPRINT_CONSTRAINTS.UNIT_MAX_LEN, 'kg'),
          unitDetail: sanitizeString(
            item.unitDetail || `${item.quantity} ${item.unit}`,
            BLUEPRINT_CONSTRAINTS.UNIT_DETAIL_MAX_LEN,
            '1 kg'
          ),
          price: Math.max(0, Math.min(100000000, Number(item.price) || 0)),
          annotationType: safeAnnotation,
          annotationText: sanitizeString(item.annotationText || '', BLUEPRINT_CONSTRAINTS.ANNOTATION_TEXT_MAX_LEN, ''),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, itemPath);
      }
    }
  };

  // Track Auth state
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

  // Bootstrap and attach Firestore listeners when authenticated
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;

    const uid = firebaseUser.uid;
    let unsubProfile: (() => void) | undefined;
    let unsubPrivate: (() => void) | undefined;
    let unsubBudget: (() => void) | undefined;
    let unsubTrips: (() => void) | undefined;
    let isCancelled = false;

    const initUserCloudData = async () => {
      if (isBootstrappingRef.current) return;
      isBootstrappingRef.current = true;

      try {
        // 1. Check /users/{uid}
        const userDocRef = doc(db, 'users', uid);
        let userSnap;
        try {
          userSnap = await getDoc(userDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        }

        const displayName = sanitizeString(
          firebaseUser.displayName || userProfile.name,
          BLUEPRINT_CONSTRAINTS.NAME_MAX_LEN,
          'MarketPulse Shopper'
        );
        const initials = sanitizeString(
          displayName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase() || 'MP',
          BLUEPRINT_CONSTRAINTS.AVATAR_INITIALS_MAX_LEN,
          'MP'
        );

        if (!userSnap?.exists()) {
          try {
            await setDoc(userDocRef, {
              uid,
              name: displayName,
              household: sanitizeString(userProfile.household, BLUEPRINT_CONSTRAINTS.HOUSEHOLD_MAX_LEN, 'My Household'),
              location: sanitizeString(userProfile.location, BLUEPRINT_CONSTRAINTS.LOCATION_MAX_LEN, 'Lagos, Nigeria'),
              activeRegionId: sanitizeString(activeRegionId, BLUEPRINT_CONSTRAINTS.REGION_ID_MAX_LEN, 'lagos'),
              avatarInitials: initials,
              twoFactorEnabled: Boolean(userProfile.twoFactorEnabled),
              biometricLock: Boolean(userProfile.biometricLock),
              isSecured: true,
              syncState: 'synced',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
          }
        }

        // 2. Check /users/{uid}/private/info
        const privateDocRef = doc(db, 'users', uid, 'private', 'info');
        let privateSnap;
        try {
          privateSnap = await getDoc(privateDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${uid}/private/info`);
        }

        if (!privateSnap?.exists()) {
          const safeEmail = sanitizeString(
            firebaseUser.email || userProfile.email,
            BLUEPRINT_CONSTRAINTS.EMAIL_MAX_LEN,
            ''
          );
          const safePhone = sanitizeString(userProfile.phone, BLUEPRINT_CONSTRAINTS.PHONE_MAX_LEN, '+234 803 123 4567');
          try {
            await setDoc(privateDocRef, {
              uid,
              email: safeEmail,
              phone: safePhone,
              contact: safeEmail || safePhone,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${uid}/private/info`);
          }
        }

        // 3. Check /users/{uid}/budgets/current
        const budgetDocRef = doc(db, 'users', uid, 'budgets', 'current');
        let budgetSnap;
        try {
          budgetSnap = await getDoc(budgetDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${uid}/budgets/current`);
        }

        if (!budgetSnap?.exists()) {
          try {
            await setDoc(budgetDocRef, {
              uid,
              monthlyTarget: Math.max(0, Number(budget.monthlyTarget) || 100000),
              spentSoFar: Math.max(0, Number(budget.spentSoFar) || 0),
              currentDay: Math.max(1, Math.min(366, Math.round(budget.currentDay || 14))),
              totalDays: Math.max(1, Math.min(366, Math.round(budget.totalDays || 31))),
              frequency: budget.frequency === 'Weekly' ? 'Weekly' : 'Monthly',
              produceBudget: Math.max(0, Number(budget.categoryBudgets.produce.budget) || 35000),
              produceSpent: Math.max(0, Number(budget.categoryBudgets.produce.spent) || 0),
              proteinsBudget: Math.max(0, Number(budget.categoryBudgets.proteins.budget) || 40000),
              proteinsSpent: Math.max(0, Number(budget.categoryBudgets.proteins.spent) || 0),
              pantryBudget: Math.max(0, Number(budget.categoryBudgets.pantry.budget) || 25000),
              pantrySpent: Math.max(0, Number(budget.categoryBudgets.pantry.spent) || 0),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${uid}/budgets/current`);
          }
        }

        // 4. Check existing trips for this user; seed if empty
        const tripsQuery = query(collection(db, 'trips'), where('uid', '==', uid));
        let existingTripsSnap;
        try {
          existingTripsSnap = await getDocs(tripsQuery);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'trips');
        }

        if (existingTripsSnap && existingTripsSnap.empty) {
          for (const t of trips) {
            await saveTripToFirestore(uid, t);
          }
        }

        if (isCancelled) return;

        // Attach real-time listeners
        unsubProfile = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              if (data.activeRegionId) {
                setActiveRegionIdState(data.activeRegionId);
                localStorage.setItem('marketpulse_region', data.activeRegionId);
              }
              setUserProfile((prev) => ({
                ...prev,
                name: data.name || prev.name,
                household: data.household || prev.household,
                location: data.location || prev.location,
                avatarInitials: data.avatarInitials || prev.avatarInitials,
                twoFactorEnabled: Boolean(data.twoFactorEnabled),
                biometricLock: Boolean(data.biometricLock),
                isSecured: true,
                syncState: 'synced',
              }));
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
          }
        );

        unsubPrivate = onSnapshot(
          privateDocRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setUserProfile((prev) => ({
                ...prev,
                email: data.email || prev.email,
                phone: data.phone || prev.phone,
                contact: data.contact || prev.contact,
              }));
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${uid}/private/info`);
          }
        );

        unsubBudget = onSnapshot(
          budgetDocRef,
          (snap) => {
            if (snap.exists()) {
              const d = snap.data();
              setBudget({
                monthlyTarget: Number(d.monthlyTarget) || 100000,
                spentSoFar: Number(d.spentSoFar) || 0,
                currentDay: Number(d.currentDay) || 14,
                totalDays: Number(d.totalDays) || 31,
                frequency: d.frequency === 'Weekly' ? 'Weekly' : 'Monthly',
                categoryBudgets: {
                  produce: {
                    budget: Number(d.produceBudget) || 35000,
                    spent: Number(d.produceSpent) || 0,
                  },
                  proteins: {
                    budget: Number(d.proteinsBudget) || 40000,
                    spent: Number(d.proteinsSpent) || 0,
                  },
                  pantry: {
                    budget: Number(d.pantryBudget) || 25000,
                    spent: Number(d.pantrySpent) || 0,
                  },
                },
              });
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${uid}/budgets/current`);
          }
        );

        unsubTrips = onSnapshot(
          tripsQuery,
          async (snap) => {
            const loadedTrips: Trip[] = [];
            for (const tripDoc of snap.docs) {
              const tData = tripDoc.data();
              const tripId = tripDoc.id;
              let items: TripItem[] = [];
              try {
                const itemsSnap = await getDocs(
                  query(collection(db, 'trips', tripId, 'items'), where('uid', '==', uid))
                );
                items = itemsSnap.docs.map((iDoc) => {
                  const iData = iDoc.data();
                  return {
                    id: iDoc.id,
                    name: iData.name,
                    category: iData.category as ItemCategory,
                    quantity: Number(iData.quantity) || 1,
                    unit: iData.unit as UnitType,
                    unitDetail: iData.unitDetail,
                    price: Number(iData.price) || 0,
                    annotationType: iData.annotationType,
                    annotationText: iData.annotationText,
                  };
                });
              } catch (err) {
                handleFirestoreError(err, OperationType.LIST, `trips/${tripId}/items`);
              }

              loadedTrips.push({
                id: tripId,
                market: tData.market,
                date: tData.date,
                rawDate: tData.rawDate,
                itemsCount: Number(tData.itemsCount) || items.length,
                total: Number(tData.total) || 0,
                syncStatus: 'synced',
                pctChange: Number(tData.pctChange) || 0,
                isPositiveChange: Boolean(tData.isPositiveChange),
                items,
              });
            }

            loadedTrips.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));
            if (loadedTrips.length > 0) {
              setTrips(loadedTrips);
              setSelectedTrip((prev) => loadedTrips.find((t) => t.id === prev?.id) || loadedTrips[0]);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'trips');
          }
        );
      } finally {
        isBootstrappingRef.current = false;
      }
    };

    initUserCloudData();

    return () => {
      isCancelled = true;
      if (unsubProfile) unsubProfile();
      if (unsubPrivate) unsubPrivate();
      if (unsubBudget) unsubBudget();
      if (unsubTrips) unsubTrips();
    };
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

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setAuthError(error?.message || 'Unable to sign in with Google.');
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign-Out error:', error);
      setAuthError(error?.message || 'Unable to sign out.');
    }
  };

  const setActiveRegionId = (id: string) => {
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

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      updateDoc(doc(db, 'users', uid), {
        activeRegionId: safeRegionId,
        location: newLocation,
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      });
    }
  };

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const target = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(target);
    } else {
      setCurrentScreen('home');
      setScreenHistory(['home']);
    }
  };

  const selectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    navigateTo('trip-detail');
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
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
      const uid = firebaseUser.uid;
      const safeTripId = sanitizeId(id);
      const t = updatedTripObj as Trip;
      updateDoc(doc(db, 'trips', safeTripId), {
        market: sanitizeString(t.market, BLUEPRINT_CONSTRAINTS.MARKET_MAX_LEN, 'Mile 12 Market'),
        date: sanitizeString(t.date, BLUEPRINT_CONSTRAINTS.DATE_MAX_LEN, 'Today'),
        rawDate: sanitizeString(t.rawDate, BLUEPRINT_CONSTRAINTS.DATE_MAX_LEN, new Date().toISOString()),
        itemsCount: Math.max(0, Math.min(500, Math.round(t.items.length))),
        total: Math.max(0, Math.min(100000000, Number(t.total) || 0)),
        syncStatus: 'synced',
        pctChange: Math.max(-1000, Math.min(10000, Number(t.pctChange) || 0)),
        isPositiveChange: Boolean(t.isPositiveChange),
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        handleFirestoreError(error, OperationType.UPDATE, `trips/${safeTripId}`);
      });
    }
  };

  const deleteTrip = (id: string) => {
    const tripToDelete = trips.find((t) => t.id === id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (selectedTrip?.id === id) {
      setSelectedTrip(null);
    }

    if (firebaseUser && tripToDelete) {
      const safeTripId = sanitizeId(id);
      (async () => {
        for (const item of tripToDelete.items) {
          const safeItemId = sanitizeId(item.id);
          try {
            await deleteDoc(doc(db, 'trips', safeTripId, 'items', safeItemId));
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `trips/${safeTripId}/items/${safeItemId}`);
          }
        }
        try {
          await deleteDoc(doc(db, 'trips', safeTripId));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `trips/${safeTripId}`);
        }
      })();
    }
  };

  const selectCommodityById = (id: string) => {
    const found = commodities.find((c) => c.id === id);
    if (found) {
      setSelectedCommodity(found);
      navigateTo('commodity-detail');
    }
  };

  const addStagingItem = (item: Omit<TripItem, 'id'>) => {
    const newItem: TripItem = {
      ...item,
      id: `stg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setStagingItems((prev) => [...prev, newItem]);
  };

  const removeStagingItem = (id: string) => {
    setStagingItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateStagingItem = (id: string, updates: Partial<TripItem>) => {
    setStagingItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const clearStaging = () => {
    setStagingItems([]);
  };

  const saveStagingTrip = (): Trip => {
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
      const uid = firebaseUser.uid;
      saveTripToFirestore(uid, newTrip);
      updateDoc(doc(db, 'users', uid, 'budgets', 'current'), {
        spentSoFar: Math.max(0, Number(nextBudget.spentSoFar) || 0),
        produceSpent: Math.max(0, Number(nextBudget.categoryBudgets.produce.spent) || 0),
        proteinsSpent: Math.max(0, Number(nextBudget.categoryBudgets.proteins.spent) || 0),
        pantrySpent: Math.max(0, Number(nextBudget.categoryBudgets.pantry.spent) || 0),
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/budgets/current`);
      });
    }

    return newTrip;
  };

  const updateBudget = (updates: Partial<BudgetConfig>) => {
    const next: BudgetConfig = { ...budget, ...updates };
    setBudget(next);

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      updateDoc(doc(db, 'users', uid, 'budgets', 'current'), {
        monthlyTarget: Math.max(0, Number(next.monthlyTarget) || 100000),
        spentSoFar: Math.max(0, Number(next.spentSoFar) || 0),
        currentDay: Math.max(1, Math.min(366, Math.round(next.currentDay || 14))),
        totalDays: Math.max(1, Math.min(366, Math.round(next.totalDays || 31))),
        frequency: next.frequency === 'Weekly' ? 'Weekly' : 'Monthly',
        produceBudget: Math.max(0, Number(next.categoryBudgets.produce.budget) || 0),
        produceSpent: Math.max(0, Number(next.categoryBudgets.produce.spent) || 0),
        proteinsBudget: Math.max(0, Number(next.categoryBudgets.proteins.budget) || 0),
        proteinsSpent: Math.max(0, Number(next.categoryBudgets.proteins.spent) || 0),
        pantryBudget: Math.max(0, Number(next.categoryBudgets.pantry.budget) || 0),
        pantrySpent: Math.max(0, Number(next.categoryBudgets.pantry.spent) || 0),
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/budgets/current`);
      });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const next = { ...userProfile, ...updates };
    setUserProfile(next);

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      const safeName = sanitizeString(next.name, BLUEPRINT_CONSTRAINTS.NAME_MAX_LEN, 'MarketPulse Shopper');
      const initials = sanitizeString(
        safeName
          .split(' ')
          .map((p) => p[0])
          .join('')
          .toUpperCase() || 'MP',
        BLUEPRINT_CONSTRAINTS.AVATAR_INITIALS_MAX_LEN,
        'MP'
      );

      updateDoc(doc(db, 'users', uid), {
        name: safeName,
        household: sanitizeString(next.household, BLUEPRINT_CONSTRAINTS.HOUSEHOLD_MAX_LEN, 'My Household'),
        location: sanitizeString(next.location, BLUEPRINT_CONSTRAINTS.LOCATION_MAX_LEN, 'Lagos, Nigeria'),
        avatarInitials: initials,
        twoFactorEnabled: Boolean(next.twoFactorEnabled),
        biometricLock: Boolean(next.biometricLock),
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      });

      if (updates.email !== undefined || updates.phone !== undefined || updates.contact !== undefined) {
        updateDoc(doc(db, 'users', uid, 'private', 'info'), {
          email: sanitizeString(next.email, BLUEPRINT_CONSTRAINTS.EMAIL_MAX_LEN, ''),
          phone: sanitizeString(next.phone, BLUEPRINT_CONSTRAINTS.PHONE_MAX_LEN, ''),
          contact: sanitizeString(next.contact || next.email, BLUEPRINT_CONSTRAINTS.CONTACT_MAX_LEN, ''),
          updatedAt: serverTimestamp(),
        }).catch((error) => {
          handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/private/info`);
        });
      }
    }
  };

  const secureAccount = (contact: string) => {
    updateProfile({
      contact,
      isSecured: true,
      syncState: firebaseUser ? 'synced' : 'local_only',
    });
  };

  const exportData = (format: 'csv' | 'json') => {
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
  };

  const deleteAllData = () => {
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
      const uid = firebaseUser.uid;
      currentTrips.forEach((t) => deleteTrip(t.id));
      updateBudget(emptyBudget);
    }
  };

  const resetToSampleData = () => {
    setTrips(INITIAL_TRIPS);
    setSelectedTrip(INITIAL_TRIPS[0]);
    setBudget(INITIAL_BUDGET);
    localStorage.setItem('marketpulse_trips', JSON.stringify(INITIAL_TRIPS));
    localStorage.setItem('marketpulse_budget', JSON.stringify(INITIAL_BUDGET));

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      INITIAL_TRIPS.forEach((t) => saveTripToFirestore(uid, t));
      updateBudget(INITIAL_BUDGET);
    }
  };

  const previousScreen =
    screenHistory.length > 1 ? screenHistory[screenHistory.length - 2] : null;

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
        selectTrip,
        updateTrip,
        deleteTrip,
        commodities,
        selectedCommodity,
        selectCommodityById,
        budget,
        updateBudget,
        isDrawerOpen,
        setDrawerOpen,
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
