import { User as FirebaseUser } from 'firebase/auth';
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
  db,
  handleFirestoreError,
  OperationType,
  BLUEPRINT_CONSTRAINTS,
  sanitizeString,
  sanitizeId,
} from './firebase';
import { Trip, TripItem, BudgetConfig, UserProfile, ItemCategory, UnitType } from '../types';
import { normalizeBudgetFrequency } from './budgetCycle';

const VALID_CATEGORIES: ItemCategory[] = [
  'Produce',
  'Proteins',
  'Pantry Staples',
  'Fruits',
  'Tubers & Roots',
  'Spices',
  'Dairy & Drinks',
  'Household',
];
const VALID_ANNOTATIONS = ['history', 'community', 'unsure', 'outlier', 'none'] as const;

export async function saveTripToFirestore(uid: string, trip: Trip): Promise<void> {
  if (!db) return;
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
    const safeAnnotation = VALID_ANNOTATIONS.includes(item.annotationType as (typeof VALID_ANNOTATIONS)[number])
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
}

export async function updateTripInFirestore(trip: Trip): Promise<void> {
  if (!db) return;
  const safeTripId = sanitizeId(trip.id);
  try {
    await updateDoc(doc(db, 'trips', safeTripId), {
      market: sanitizeString(trip.market, BLUEPRINT_CONSTRAINTS.MARKET_MAX_LEN, 'Mile 12 Market'),
      date: sanitizeString(trip.date, BLUEPRINT_CONSTRAINTS.DATE_MAX_LEN, 'Today'),
      rawDate: sanitizeString(trip.rawDate, BLUEPRINT_CONSTRAINTS.DATE_MAX_LEN, new Date().toISOString()),
      itemsCount: Math.max(0, Math.min(500, Math.round(trip.items.length))),
      total: Math.max(0, Math.min(100000000, Number(trip.total) || 0)),
      syncStatus: 'synced',
      pctChange: Math.max(-1000, Math.min(10000, Number(trip.pctChange) || 0)),
      isPositiveChange: Boolean(trip.isPositiveChange),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `trips/${safeTripId}`);
  }
}

export async function deleteTripFromFirestore(trip: Trip): Promise<void> {
  if (!db) return;
  const safeTripId = sanitizeId(trip.id);
  for (const item of trip.items) {
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
}

export async function updateBudgetInFirestore(uid: string, next: BudgetConfig): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'users', uid, 'budgets', 'current'), {
      monthlyTarget: Math.max(0, Number(next.monthlyTarget) || 100000),
      spentSoFar: Math.max(0, Number(next.spentSoFar) || 0),
      currentDay: Math.max(1, Math.min(366, Math.round(next.currentDay || 14))),
      totalDays: Math.max(1, Math.min(366, Math.round(next.totalDays || 31))),
      frequency: normalizeBudgetFrequency(next.frequency),
      produceBudget: Math.max(0, Number(next.categoryBudgets.produce.budget) || 0),
      produceSpent: Math.max(0, Number(next.categoryBudgets.produce.spent) || 0),
      proteinsBudget: Math.max(0, Number(next.categoryBudgets.proteins.budget) || 0),
      proteinsSpent: Math.max(0, Number(next.categoryBudgets.proteins.spent) || 0),
      pantryBudget: Math.max(0, Number(next.categoryBudgets.pantry.budget) || 0),
      pantrySpent: Math.max(0, Number(next.categoryBudgets.pantry.spent) || 0),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/budgets/current`);
  }
}

export async function updateBudgetSpendInFirestore(uid: string, nextBudget: BudgetConfig): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'users', uid, 'budgets', 'current'), {
      spentSoFar: Math.max(0, Number(nextBudget.spentSoFar) || 0),
      produceSpent: Math.max(0, Number(nextBudget.categoryBudgets.produce.spent) || 0),
      proteinsSpent: Math.max(0, Number(nextBudget.categoryBudgets.proteins.spent) || 0),
      pantrySpent: Math.max(0, Number(nextBudget.categoryBudgets.pantry.spent) || 0),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/budgets/current`);
  }
}

export async function updateRegionInFirestore(uid: string, safeRegionId: string, newLocation: string): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'users', uid), {
      activeRegionId: safeRegionId,
      location: newLocation,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function updateProfileInFirestore(
  uid: string,
  next: UserProfile,
  includePrivate: boolean
): Promise<void> {
  if (!db) return;
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

  try {
    await updateDoc(doc(db, 'users', uid), {
      name: safeName,
      household: sanitizeString(next.household, BLUEPRINT_CONSTRAINTS.HOUSEHOLD_MAX_LEN, 'My Household'),
      location: sanitizeString(next.location, BLUEPRINT_CONSTRAINTS.LOCATION_MAX_LEN, 'Lagos, Nigeria'),
      avatarInitials: initials,
      twoFactorEnabled: Boolean(next.twoFactorEnabled),
      biometricLock: Boolean(next.biometricLock),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  if (includePrivate) {
    try {
      await updateDoc(doc(db, 'users', uid, 'private', 'info'), {
        email: sanitizeString(next.email, BLUEPRINT_CONSTRAINTS.EMAIL_MAX_LEN, ''),
        phone: sanitizeString(next.phone, BLUEPRINT_CONSTRAINTS.PHONE_MAX_LEN, ''),
        contact: sanitizeString(next.contact || next.email, BLUEPRINT_CONSTRAINTS.CONTACT_MAX_LEN, ''),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/private/info`);
    }
  }
}

interface BootstrapParams {
  firebaseUser: FirebaseUser;
  userProfile: UserProfile;
  activeRegionId: string;
  budget: BudgetConfig;
  trips: Trip[];
  onRegionSync: (regionId: string) => void;
  onProfileSync: (updater: (prev: UserProfile) => UserProfile) => void;
  onBudgetSync: (budget: BudgetConfig) => void;
  onTripsSync: (trips: Trip[]) => void;
}

export function subscribeUserCloudData(params: BootstrapParams): () => void {
  if (!db) return () => {};
  const firestoreDb = db;
  const {
    firebaseUser,
    userProfile,
    activeRegionId,
    budget,
    trips,
    onRegionSync,
    onProfileSync,
    onBudgetSync,
    onTripsSync,
  } = params;

  const uid = firebaseUser.uid;
  let unsubProfile: (() => void) | undefined;
  let unsubPrivate: (() => void) | undefined;
  let unsubBudget: (() => void) | undefined;
  let unsubTrips: (() => void) | undefined;
  let isCancelled = false;

  const run = async () => {
    const userDocRef = doc(firestoreDb, 'users', uid);
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

    const privateDocRef = doc(firestoreDb, 'users', uid, 'private', 'info');
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

    const budgetDocRef = doc(firestoreDb, 'users', uid, 'budgets', 'current');
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
          frequency: normalizeBudgetFrequency(budget.frequency),
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

    const tripsQuery = query(collection(firestoreDb, 'trips'), where('uid', '==', uid));
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

    unsubProfile = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.activeRegionId) {
            onRegionSync(data.activeRegionId);
          }
          onProfileSync((prev) => ({
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
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}`)
    );

    unsubPrivate = onSnapshot(
      privateDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          onProfileSync((prev) => ({
            ...prev,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            contact: data.contact || prev.contact,
          }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}/private/info`)
    );

    unsubBudget = onSnapshot(
      budgetDocRef,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          onBudgetSync({
            monthlyTarget: Number(d.monthlyTarget) || 100000,
            spentSoFar: Number(d.spentSoFar) || 0,
            currentDay: Number(d.currentDay) || 14,
            totalDays: Number(d.totalDays) || 31,
            frequency: normalizeBudgetFrequency(d.frequency),
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
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}/budgets/current`)
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
              query(collection(firestoreDb, 'trips', tripId, 'items'), where('uid', '==', uid))
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
          onTripsSync(loadedTrips);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'trips')
    );
  };

  run();

  return () => {
    isCancelled = true;
    unsubProfile?.();
    unsubPrivate?.();
    unsubBudget?.();
    unsubTrips?.();
  };
}
