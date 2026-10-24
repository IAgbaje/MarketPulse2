export type ScreenType =
  | 'landing'
  | 'home'
  | 'price-map'
  | 'weekly-report'
  | 'log-choice'
  | 'log-scan'
  | 'log-manual'
  | 'log-confirm'
  | 'log-pending'
  | 'log-success'
  | 'history'
  | 'trip-detail'
  | 'commodity-detail'
  | 'budget'
  | 'set-budget'
  | 'data-management'
  | 'data-mgmt'
  | 'account-security'
  | 'secure-account';

export type PriceMapTab = 'map' | 'markets' | 'basket';

export interface UserProfile {
  name: string;
  household: string;
  location: string;
  email: string;
  phone: string;
  contact: string;
  avatarInitials: string;
  twoFactorEnabled: boolean;
  biometricLock: boolean;
  isSecured: boolean;
  syncState: 'syncing' | 'synced' | 'local_only';
}

export interface RegionProfile {
  id: string;
  name: string;
  state: string;
  tagline: string;
  markets: string[];
  priceMultiplier: number;
}

export type UnitType =
  | 'kg'
  | 'bag'
  | 'basket'
  | 'paint'
  | 'derica'
  | 'L'
  | 'pack'
  | 'bunch'
  | 'pieces'
  | 'sachet'
  | 'tuber';

export type ItemCategory = 'Produce' | 'Proteins' | 'Pantry Staples' | 'Household' | 'Spices';

export interface TripItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: UnitType;
  unitDetail?: string; // e.g. "1 big basket (~40kg)", "1 bag (medium)"
  price: number;
  previousPrice?: number;
  annotationType?: 'history' | 'community' | 'unsure' | 'outlier' | 'none';
  annotationText?: string;
}

export interface Trip {
  id: string;
  market: string;
  date: string;
  rawDate: string; // ISO or sortable
  itemsCount: number;
  total: number;
  syncStatus: 'local_only' | 'synced';
  pctChange?: number;
  isPositiveChange?: boolean; // true = price up (red), false = price down (green)
  items: TripItem[];
}

export interface BudgetConfig {
  monthlyTarget: number;
  spentSoFar: number;
  currentDay: number;
  totalDays: number;
  frequency: 'Weekly' | 'Fortnightly' | 'Monthly';
  categoryBudgets: {
    produce: { budget: number; spent: number };
    proteins: { budget: number; spent: number };
    pantry: { budget: number; spent: number };
  };
}

export interface Commodity {
  id: string;
  name: string;
  category: ItemCategory;
  unitDescription: string;
  emoji: string;
  latestPrice: number;
  latestMarket: string;
  recencyText: string;
  priceChangeAmount: number;
  priceChangePct: number;
  vsPeriodText: string;
  isPriceUp: boolean;
  crowdRangeMin: number;
  crowdRangeMax: number;
  crowdReportsCount: number;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: (number | null)[];
      color: string;
    }[];
  };
  loggedPurchases: {
    id: string;
    market: string;
    date: string;
    quantityDesc: string;
    totalAmount: number;
    unitPriceDesc: string;
  }[];
}

export interface MarketPriceMover {
  id: string;
  name: string;
  market: string;
  reportsCount: number;
  price: number;
  increaseAmount: number;
}
