export type PriceMapCommodityKey = 'rice' | 'tomatoes' | 'beans' | 'garri' | 'palmoil' | 'onions';

export interface MarketPinData {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  transitCost: number;
  type: 'open' | 'supermarket';
  reportsCount: number;
  updatedAgo: string;
  prices: Record<
    PriceMapCommodityKey,
    {
      price: number;
      deltaPct: number;
      sparkline: string;
    }
  >;
}

export interface CommodityMetaItem {
  key: PriceMapCommodityKey;
  label: string;
  shortLabel: string;
  emoji: string;
  linkedCommodityId: string;
}

export interface ChoroplethTileData {
  id: string;
  name: string;
  marketId?: string;
  logsCount: number;
  priceText: string;
  deltaText: string;
  tone: 'positive' | 'danger' | 'neutral' | 'low-confidence' | 'no-data';
  highlight?: boolean;
}

export interface BasketOption {
  id: string;
  rank: number;
  marketName: string;
  distanceKm: number;
  type: 'Open Market' | 'Supermarket';
  updatedText: string;
  totalPrice: number;
  diffVsBaseline: number;
  coveragePct: number;
  coveredCount: number;
  totalCount: number;
  missingItemsNote?: string;
  isBestValue?: boolean;
}

export const COMMODITY_META: CommodityMetaItem[] = [
  { key: 'rice', label: 'Rice (50kg)', shortLabel: 'Rice (50kg)', emoji: '🌾', linkedCommodityId: 'rice-50kg' },
  { key: 'tomatoes', label: 'Tomatoes (Basket)', shortLabel: 'Tomatoes', emoji: '🍅', linkedCommodityId: 'tomatoes-fresh' },
  { key: 'beans', label: 'Beans (Oloyin)', shortLabel: 'Beans (Oloyin)', emoji: '🫘', linkedCommodityId: 'beans-oloyin' },
  { key: 'garri', label: 'Garri (Paint)', shortLabel: 'Garri (Paint)', emoji: '🥣', linkedCommodityId: 'garri-white' },
  { key: 'palmoil', label: 'Palm Oil (5L)', shortLabel: 'Palm Oil', emoji: '🛢️', linkedCommodityId: 'palm-oil-5l' },
  { key: 'onions', label: 'Onions (Dry Bag)', shortLabel: 'Onions', emoji: '🧅', linkedCommodityId: 'onions-dry' },
];

export const MARKET_PINS: MarketPinData[] = [
  {
    id: 'mile-12',
    name: 'Mile 12 Market',
    area: 'Ketu, Lagos · Open Daily',
    distanceKm: 2.4,
    transitCost: 400,
    type: 'open',
    reportsCount: 14,
    updatedAgo: '2h ago',
    prices: {
      rice: { price: 42500, deltaPct: -4, sparkline: 'M0,25 Q15,20 30,22 T60,15 T90,18 T100,10' },
      tomatoes: { price: 18500, deltaPct: 12, sparkline: 'M0,28 Q20,24 40,20 T70,14 T100,6' },
      beans: { price: 3800, deltaPct: -2, sparkline: 'M0,18 Q25,18 50,16 T80,19 T100,15' },
      garri: { price: 2800, deltaPct: -5, sparkline: 'M0,14 Q25,16 50,18 T80,22 T100,25' },
      palmoil: { price: 4200, deltaPct: 0, sparkline: 'M0,16 Q25,15 50,16 T80,16 T100,16' },
      onions: { price: 2500, deltaPct: -6, sparkline: 'M0,12 Q25,14 50,18 T80,20 T100,24' },
    },
  },
  {
    id: 'daleko',
    name: 'Daleko Market',
    area: 'Mushin, Lagos · Wholesale Hub',
    distanceKm: 6.8,
    transitCost: 700,
    type: 'open',
    reportsCount: 8,
    updatedAgo: '5h ago',
    prices: {
      rice: { price: 43500, deltaPct: 0, sparkline: 'M0,18 Q25,17 50,18 T80,17 T100,18' },
      tomatoes: { price: 19200, deltaPct: 14, sparkline: 'M0,26 Q25,22 50,18 T80,12 T100,8' },
      beans: { price: 3900, deltaPct: 1, sparkline: 'M0,20 Q25,19 50,19 T80,18 T100,17' },
      garri: { price: 2900, deltaPct: 0, sparkline: 'M0,18 Q25,18 50,18 T80,18 T100,18' },
      palmoil: { price: 4300, deltaPct: 2, sparkline: 'M0,20 Q25,19 50,18 T80,17 T100,15' },
      onions: { price: 2600, deltaPct: 0, sparkline: 'M0,18 Q25,18 50,18 T80,18 T100,18' },
    },
  },
  {
    id: 'oyingbo',
    name: 'Oyingbo Market',
    area: 'Lagos Mainland · Open Daily',
    distanceKm: 8.1,
    transitCost: 800,
    type: 'open',
    reportsCount: 11,
    updatedAgo: '4h ago',
    prices: {
      rice: { price: 44000, deltaPct: 2, sparkline: 'M0,22 Q25,20 50,19 T80,16 T100,14' },
      tomatoes: { price: 19500, deltaPct: 15, sparkline: 'M0,28 Q25,24 50,18 T80,12 T100,7' },
      beans: { price: 4000, deltaPct: 3, sparkline: 'M0,22 Q25,20 50,18 T80,16 T100,14' },
      garri: { price: 3000, deltaPct: 4, sparkline: 'M0,24 Q25,22 50,20 T80,17 T100,15' },
      palmoil: { price: 4400, deltaPct: 5, sparkline: 'M0,24 Q25,22 50,19 T80,15 T100,12' },
      onions: { price: 2700, deltaPct: 4, sparkline: 'M0,22 Q25,20 50,18 T80,16 T100,14' },
    },
  },
  {
    id: 'shoprite-ikeja',
    name: 'Shoprite Ikeja City Mall',
    area: 'Alausa, Ikeja · Supermarket',
    distanceKm: 3.5,
    transitCost: 500,
    type: 'supermarket',
    reportsCount: 6,
    updatedAgo: '1d ago',
    prices: {
      rice: { price: 46500, deltaPct: 8, sparkline: 'M0,26 Q25,22 50,19 T80,14 T100,9' },
      tomatoes: { price: 21500, deltaPct: 18, sparkline: 'M0,29 Q25,24 50,18 T80,11 T100,5' },
      beans: { price: 4500, deltaPct: 6, sparkline: 'M0,25 Q25,22 50,18 T80,14 T100,10' },
      garri: { price: 3400, deltaPct: 6, sparkline: 'M0,25 Q25,22 50,18 T80,14 T100,10' },
      palmoil: { price: 4900, deltaPct: 8, sparkline: 'M0,26 Q25,22 50,18 T80,14 T100,9' },
      onions: { price: 3100, deltaPct: 7, sparkline: 'M0,25 Q25,22 50,18 T80,14 T100,10' },
    },
  },
  {
    id: 'alaba-rago',
    name: 'Alaba Rago Market',
    area: 'Ojo, Lagos · Open Daily',
    distanceKm: 18.4,
    transitCost: 1200,
    type: 'open',
    reportsCount: 3,
    updatedAgo: '1d ago',
    prices: {
      rice: { price: 41800, deltaPct: -3, sparkline: 'M0,20 Q25,21 50,19 T80,22 T100,24' },
      tomatoes: { price: 17800, deltaPct: 8, sparkline: 'M0,24 Q25,21 50,18 T80,15 T100,12' },
      beans: { price: 3700, deltaPct: -4, sparkline: 'M0,16 Q25,18 50,20 T80,22 T100,24' },
      garri: { price: 2700, deltaPct: -3, sparkline: 'M0,16 Q25,18 50,20 T80,22 T100,24' },
      palmoil: { price: 4100, deltaPct: -2, sparkline: 'M0,17 Q25,18 50,19 T80,21 T100,22' },
      onions: { price: 2300, deltaPct: -8, sparkline: 'M0,14 Q25,16 50,19 T80,22 T100,26' },
    },
  },
];

export const NIGERIA_STATE_TILES: ChoroplethTileData[] = [
  {
    id: 'state-lagos',
    name: 'Lagos',
    marketId: 'mile-12',
    logsCount: 142,
    priceText: '₦42,500',
    deltaText: '↓ 4% vs national avg',
    tone: 'positive',
    highlight: true,
  },
  {
    id: 'state-abuja',
    name: 'Abuja FCT',
    marketId: 'oyingbo',
    logsCount: 64,
    priceText: '₦46,000',
    deltaText: '↑ 15% this month',
    tone: 'danger',
  },
  {
    id: 'state-kano',
    name: 'Kano',
    marketId: 'daleko',
    logsCount: 51,
    priceText: '₦38,500',
    deltaText: '↓ 3% harvest supply',
    tone: 'positive',
  },
  {
    id: 'state-rivers',
    name: 'Rivers (PH)',
    marketId: 'shoprite-ikeja',
    logsCount: 39,
    priceText: '₦45,200',
    deltaText: '↑ 9% this month',
    tone: 'danger',
  },
  {
    id: 'state-oyo',
    name: 'Oyo (Ibadan)',
    marketId: 'daleko',
    logsCount: 28,
    priceText: '₦41,000',
    deltaText: '~ Stable (0%)',
    tone: 'neutral',
  },
  {
    id: 'state-enugu',
    name: 'Enugu',
    marketId: 'alaba-rago',
    logsCount: 3,
    priceText: '~₦44,000',
    deltaText: '<5 reports · Low conf.',
    tone: 'low-confidence',
  },
  {
    id: 'state-kaduna',
    name: 'Kaduna',
    marketId: 'mile-12',
    logsCount: 18,
    priceText: '₦39,800',
    deltaText: '↓ 1% this month',
    tone: 'positive',
  },
  {
    id: 'state-borno',
    name: 'Borno',
    logsCount: 0,
    priceText: 'No data yet',
    deltaText: '+ Log first trip',
    tone: 'no-data',
  },
];

export const LAGOS_LGA_TILES: ChoroplethTileData[] = [
  {
    id: 'lga-ikeja',
    name: 'Ikeja LGA',
    marketId: 'shoprite-ikeja',
    logsCount: 24,
    priceText: '₦45,000',
    deltaText: '↑ 8% · 24 reports',
    tone: 'danger',
  },
  {
    id: 'lga-surulere',
    name: 'Surulere LGA',
    marketId: 'daleko',
    logsCount: 19,
    priceText: '₦42,000',
    deltaText: '↓ 2% · 19 reports',
    tone: 'positive',
  },
  {
    id: 'lga-etiosa',
    name: 'Eti-Osa (Lekki)',
    marketId: 'shoprite-ikeja',
    logsCount: 31,
    priceText: '₦48,000',
    deltaText: '↑ 12% · 31 reports',
    tone: 'danger',
  },
  {
    id: 'lga-alimosho',
    name: 'Alimosho LGA',
    marketId: 'alaba-rago',
    logsCount: 3,
    priceText: '~₦43,000',
    deltaText: '<5 reports · Striped',
    tone: 'low-confidence',
  },
  {
    id: 'lga-kosofe',
    name: 'Kosofe (Mile 12)',
    marketId: 'mile-12',
    logsCount: 42,
    priceText: '₦41,000',
    deltaText: '↓ 5% · 42 reports (Best)',
    tone: 'positive',
    highlight: true,
  },
  {
    id: 'lga-ikorodu',
    name: 'Ikorodu LGA',
    logsCount: 0,
    priceText: 'No data yet',
    deltaText: '+ Log a trip',
    tone: 'no-data',
  },
];

export const BASKET_BASELINE = {
  marketName: 'Oyingbo Market',
  coveredCount: 12,
  totalCount: 12,
  totalPrice: 34500,
};

export const BASKET_OPTIONS: BasketOption[] = [
  {
    id: 'basket-mile-12',
    rank: 1,
    marketName: 'Mile 12 Market',
    distanceKm: 5.2,
    type: 'Open Market',
    updatedText: 'Updated today',
    totalPrice: 31200,
    diffVsBaseline: -3300,
    coveragePct: 100,
    coveredCount: 12,
    totalCount: 12,
    isBestValue: true,
  },
  {
    id: 'basket-shoprite',
    rank: 2,
    marketName: 'Shoprite Ikeja',
    distanceKm: 3.1,
    type: 'Supermarket',
    updatedText: 'Updated yesterday',
    totalPrice: 32800,
    diffVsBaseline: -1700,
    coveragePct: 83,
    coveredCount: 10,
    totalCount: 12,
    missingItemsNote: 'Missing prices for Red Palm Oil, Crayfish. Estimated using regional average.',
  },
  {
    id: 'basket-tejuosho',
    rank: 3,
    marketName: 'Tejuosho Market',
    distanceKm: 2.8,
    type: 'Open Market',
    updatedText: 'Updated 2d ago',
    totalPrice: 36100,
    diffVsBaseline: 1600,
    coveragePct: 92,
    coveredCount: 11,
    totalCount: 12,
  },
];
