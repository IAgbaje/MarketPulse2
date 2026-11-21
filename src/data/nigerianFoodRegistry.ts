import { ItemCategory, UnitType } from '../types';

export interface CategoryVisual {
  category: ItemCategory;
  shortLabel: string;
  description: string;
  icon: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface NigerianFoodItem {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  defaultUnit: UnitType;
  defaultPrice: number;
  keywords: string[];
  popular?: boolean;
  customBg?: string;
  customBorder?: string;
}

export interface ResolvedFoodVisual {
  icon: string;
  category: ItemCategory;
  bgClass: string;
  textClass: string;
  borderClass: string;
  matchedItem?: NigerianFoodItem;
}

/**
 * Category Visual Registry — aligned to each food group with Apple-style soft tinted squircles.
 */
export const CATEGORY_REGISTRY: Record<ItemCategory, CategoryVisual> = {
  Produce: {
    category: 'Produce',
    shortLabel: 'Fresh Vegetables & Pepper',
    description: 'Tomatoes, pepper, onions, ugwu & soup leaves',
    icon: '🥬',
    bgClass: 'bg-[#ecfdf5]',
    textClass: 'text-[#15803d]',
    borderClass: 'border-[#15803d]/15',
  },
  Proteins: {
    category: 'Proteins',
    shortLabel: 'Meat, Fish & Eggs',
    description: 'Eggs, chicken, beef, titus fish, crayfish & ponmo',
    icon: '🥩',
    bgClass: 'bg-[#fef2f2]',
    textClass: 'text-[#b91c1c]',
    borderClass: 'border-[#b91c1c]/15',
  },
  'Pantry Staples': {
    category: 'Pantry Staples',
    shortLabel: 'Rice, Garri, Beans & Oil',
    description: 'Rice, beans, garri, palm oil, groundnut oil & noodles',
    icon: '🌾',
    bgClass: 'bg-[#fffbeb]',
    textClass: 'text-[#b45309]',
    borderClass: 'border-[#b45309]/15',
  },
  'Tubers & Roots': {
    category: 'Tubers & Roots',
    shortLabel: 'Yam, Plantain & Potatoes',
    description: 'Puna yam, plantain, sweet potatoes & cocoyam',
    icon: '🍠',
    bgClass: 'bg-[#fff7ed]',
    textClass: 'text-[#c2410c]',
    borderClass: 'border-[#c2410c]/15',
  },
  Fruits: {
    category: 'Fruits',
    shortLabel: 'Fresh Fruits',
    description: 'Mango, orange, banana, watermelon, pawpaw & pear',
    icon: '🥭',
    bgClass: 'bg-[#fdf2f8]',
    textClass: 'text-[#be185d]',
    borderClass: 'border-[#be185d]/15',
  },
  Spices: {
    category: 'Spices',
    shortLabel: 'Seasoning & Spices',
    description: 'Maggi, Knorr, salt, curry, thyme, ginger & iru',
    icon: '🧂',
    bgClass: 'bg-[#fefce8]',
    textClass: 'text-[#a16207]',
    borderClass: 'border-[#a16207]/15',
  },
  'Dairy & Drinks': {
    category: 'Dairy & Drinks',
    shortLabel: 'Milk, Tea & Drinks',
    description: 'Peak milk, Milo, bread, custard, zobo & water',
    icon: '🥛',
    bgClass: 'bg-[#eff6ff]',
    textClass: 'text-[#1d4ed8]',
    borderClass: 'border-[#1d4ed8]/15',
  },
  Household: {
    category: 'Household',
    shortLabel: 'Home & Cooking Fuel',
    description: 'Cooking gas, charcoal, soap, detergent & tissue',
    icon: '🧼',
    bgClass: 'bg-[#f1f5f9]',
    textClass: 'text-[#475569]',
    borderClass: 'border-slate-900/10',
  },
};

/**
 * Comprehensive Nigerian Market Food Register (90+ everyday market items)
 * Covers open markets (Mile 12, Oyingbo, Bodija, Wuse, Dawanau, Oil Mill, Relief) & supermarkets.
 */
export const NIGERIAN_FOOD_REGISTRY: NigerianFoodItem[] = [
  // ===================== PROTEINS (MEAT, FISH, EGGS) =====================
  {
    id: 'eggs-crate',
    name: 'Eggs (Crate)',
    icon: '🥚',
    category: 'Proteins',
    defaultUnit: 'crate',
    defaultPrice: 5200,
    keywords: ['egg', 'eggs', 'crate of egg', 'agric egg', 'boiled egg', 'poultry egg'],
    popular: true,
    customBg: 'bg-[#fef9c3]',
    customBorder: 'border-[#ca8a04]/20',
  },
  {
    id: 'chicken-frozen',
    name: 'Chicken (Frozen / Fresh)',
    icon: '🍗',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 5500,
    keywords: ['chicken', 'orobo', 'broiler', 'old layer', 'laps', 'wings', 'drumstick', 'poultry'],
    popular: true,
  },
  {
    id: 'turkey',
    name: 'Turkey',
    icon: '🍗',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 7800,
    keywords: ['turkey', 'turkey wings', 'turkey laps'],
  },
  {
    id: 'beef',
    name: 'Beef (Cow Meat)',
    icon: '🥩',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 6500,
    keywords: ['beef', 'cow meat', 'red meat', 'eran', 'nama', 'shaki', 'tripe', 'brisket', 'meat'],
    popular: true,
  },
  {
    id: 'goat-meat',
    name: 'Goat Meat',
    icon: '🍖',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 7500,
    keywords: ['goat', 'goat meat', 'asun', 'ram', 'mutton', 'bush meat'],
  },
  {
    id: 'ponmo',
    name: 'Ponmo (Cow Skin)',
    icon: '🥩',
    category: 'Proteins',
    defaultUnit: 'pieces',
    defaultPrice: 1500,
    keywords: ['ponmo', 'kpomo', 'kanda', 'cow skin'],
  },
  {
    id: 'gizzard-liver',
    name: 'Gizzard / Liver',
    icon: '🍖',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 5000,
    keywords: ['gizzard', 'liver', 'kidney', 'offal', 'assorted'],
  },
  {
    id: 'titus-fish',
    name: 'Titus Fish (Mackerel)',
    icon: '🐟',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 4800,
    keywords: ['titus', 'mackerel', 'ice fish', 'kote', 'shawa', 'croaker', 'hake', 'fish'],
    popular: true,
    customBg: 'bg-[#eff6ff]',
    customBorder: 'border-[#1d4ed8]/15',
  },
  {
    id: 'catfish',
    name: 'Fresh Catfish',
    icon: '🐟',
    category: 'Proteins',
    defaultUnit: 'kg',
    defaultPrice: 4200,
    keywords: ['catfish', 'point and kill', 'fresh fish', 'tilapia'],
    customBg: 'bg-[#eff6ff]',
    customBorder: 'border-[#1d4ed8]/15',
  },
  {
    id: 'smoked-fish',
    name: 'Smoked Fish (Panla / Eja Kika)',
    icon: '🐟',
    category: 'Proteins',
    defaultUnit: 'pieces',
    defaultPrice: 3200,
    keywords: ['smoked fish', 'panla', 'dry fish', 'dried fish', 'eja', 'mangala', 'bonga'],
    customBg: 'bg-[#fff7ed]',
    customBorder: 'border-[#c2410c]/15',
  },
  {
    id: 'stockfish',
    name: 'Stockfish (Okporoko)',
    icon: '🐠',
    category: 'Proteins',
    defaultUnit: 'pieces',
    defaultPrice: 4500,
    keywords: ['stockfish', 'stock fish', 'okporoko', 'cod'],
    customBg: 'bg-[#eff6ff]',
    customBorder: 'border-[#1d4ed8]/15',
  },
  {
    id: 'crayfish',
    name: 'Crayfish',
    icon: '🦐',
    category: 'Proteins',
    defaultUnit: 'paint',
    defaultPrice: 4500,
    keywords: ['crayfish', 'cray fish', 'ede', 'shrimp', 'prawns', 'prawn'],
    popular: true,
    customBg: 'bg-[#fff1f2]',
    customBorder: 'border-[#e11d48]/15',
  },
  {
    id: 'snail',
    name: 'Snail (Igbin)',
    icon: '🐌',
    category: 'Proteins',
    defaultUnit: 'pieces',
    defaultPrice: 4000,
    keywords: ['snail', 'snails', 'igbin'],
  },
  {
    id: 'periwinkle',
    name: 'Periwinkle (Isam)',
    icon: '🐚',
    category: 'Proteins',
    defaultUnit: 'paint',
    defaultPrice: 2500,
    keywords: ['periwinkle', 'isam', 'ngolo'],
  },
  {
    id: 'sardine',
    name: 'Sardines / Corned Beef',
    icon: '🥫',
    category: 'Proteins',
    defaultUnit: 'tin',
    defaultPrice: 1300,
    keywords: ['sardine', 'sardines', 'geisha', 'corned beef', 'exeter', 'mackerel tin'],
  },
  {
    id: 'suya',
    name: 'Suya / Kilishi',
    icon: '🍢',
    category: 'Proteins',
    defaultUnit: 'pack',
    defaultPrice: 2000,
    keywords: ['suya', 'kilishi', 'balangu'],
  },

  // ===================== PRODUCE (VEGETABLES & SOUP LEAVES) =====================
  {
    id: 'tomatoes',
    name: 'Tomatoes (Fresh)',
    icon: '🍅',
    category: 'Produce',
    defaultUnit: 'basket',
    defaultPrice: 18500,
    keywords: ['tomato', 'tomatoes', 'fresh tomato', 'hausa tomato', 'derica tomato'],
    popular: true,
    customBg: 'bg-[#fef2f2]',
    customBorder: 'border-[#dc2626]/15',
  },
  {
    id: 'rodo-pepper',
    name: 'Rodo Pepper (Atarodo)',
    icon: '🌶️',
    category: 'Produce',
    defaultUnit: 'kg',
    defaultPrice: 1500,
    keywords: ['rodo', 'atarodo', 'ata rodo', 'scotch bonnet', 'habanero', 'fresh pepper', 'pepper', 'shombo', 'chili'],
    popular: true,
    customBg: 'bg-[#fef2f2]',
    customBorder: 'border-[#dc2626]/15',
  },
  {
    id: 'tatashe',
    name: 'Tatashe (Bell Pepper)',
    icon: '🫑',
    category: 'Produce',
    defaultUnit: 'basket',
    defaultPrice: 1800,
    keywords: ['tatashe', 'bell pepper', 'green pepper', 'sweet pepper', 'bawa'],
  },
  {
    id: 'onions',
    name: 'Onions (Dry)',
    icon: '🧅',
    category: 'Produce',
    defaultUnit: 'bag',
    defaultPrice: 2500,
    keywords: ['onion', 'onions', 'alubosa', 'spring onion'],
    popular: true,
    customBg: 'bg-[#faf5ff]',
    customBorder: 'border-[#7e22ce]/15',
  },
  {
    id: 'ugwu',
    name: 'Ugwu Leaves (Pumpkin)',
    icon: '🥬',
    category: 'Produce',
    defaultUnit: 'bunch',
    defaultPrice: 600,
    keywords: ['ugwu', 'ugu', 'pumpkin leaf', 'efo', 'efo riro', 'tete', 'shoko', 'spinach', 'vegetable'],
  },
  {
    id: 'okra',
    name: 'Okra (Okro)',
    icon: '🫛',
    category: 'Produce',
    defaultUnit: 'basket',
    defaultPrice: 1000,
    keywords: ['okra', 'okro', 'ila', 'ewedu', 'green beans', 'peas'],
  },
  {
    id: 'soup-leaves',
    name: 'Bitterleaf / Waterleaf / Afang',
    icon: '🌿',
    category: 'Produce',
    defaultUnit: 'bunch',
    defaultPrice: 500,
    keywords: ['bitterleaf', 'bitter leaf', 'waterleaf', 'water leaf', 'afang', 'uziza', 'scent leaf', 'efirin', 'utazi', 'oha', 'editan', 'curry leaf'],
  },
  {
    id: 'carrot',
    name: 'Carrots',
    icon: '🥕',
    category: 'Produce',
    defaultUnit: 'pack',
    defaultPrice: 1200,
    keywords: ['carrot', 'carrots'],
    customBg: 'bg-[#fff7ed]',
    customBorder: 'border-[#ea580c]/15',
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    icon: '🥒',
    category: 'Produce',
    defaultUnit: 'pieces',
    defaultPrice: 800,
    keywords: ['cucumber', 'cucumbers'],
  },
  {
    id: 'cabbage',
    name: 'Cabbage / Lettuce',
    icon: '🥬',
    category: 'Produce',
    defaultUnit: 'pieces',
    defaultPrice: 1500,
    keywords: ['cabbage', 'lettuce', 'salad'],
  },
  {
    id: 'garden-egg',
    name: 'Garden Egg',
    icon: '🍆',
    category: 'Produce',
    defaultUnit: 'pack',
    defaultPrice: 1000,
    keywords: ['garden egg', 'eggplant', 'aubergine', 'igba'],
  },
  {
    id: 'garlic',
    name: 'Garlic',
    icon: '🧄',
    category: 'Produce',
    defaultUnit: 'pack',
    defaultPrice: 1000,
    keywords: ['garlic', 'aayu'],
  },
  {
    id: 'ginger',
    name: 'Ginger',
    icon: '🫚',
    category: 'Produce',
    defaultUnit: 'pack',
    defaultPrice: 1000,
    keywords: ['ginger', 'ata ile'],
    customBg: 'bg-[#fffbeb]',
    customBorder: 'border-[#b45309]/15',
  },

  // ===================== TUBERS, ROOTS & PLANTAIN =====================
  {
    id: 'yam',
    name: 'Yam (Puna Tuber)',
    icon: '🍠',
    category: 'Tubers & Roots',
    defaultUnit: 'tuber',
    defaultPrice: 3500,
    keywords: ['yam', 'puna yam', 'new yam', 'ji', 'isu', 'tuber'],
    popular: true,
    customBg: 'bg-[#fff7ed]',
    customBorder: 'border-[#c2410c]/20',
  },
  {
    id: 'plantain',
    name: 'Plantain (Bunch)',
    icon: '🍌',
    category: 'Tubers & Roots',
    defaultUnit: 'bunch',
    defaultPrice: 3500,
    keywords: ['plantain', 'dodo', 'boli', 'unripe plantain', 'ripe plantain', 'ogede'],
    popular: true,
    customBg: 'bg-[#fefce8]',
    customBorder: 'border-[#ca8a04]/20',
  },
  {
    id: 'irish-potato',
    name: 'Irish Potatoes',
    icon: '🥔',
    category: 'Tubers & Roots',
    defaultUnit: 'paint',
    defaultPrice: 3000,
    keywords: ['irish potato', 'potato', 'potatoes', 'jos potato', 'cocoyam', 'ede'],
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potatoes',
    icon: '🍠',
    category: 'Tubers & Roots',
    defaultUnit: 'paint',
    defaultPrice: 2000,
    keywords: ['sweet potato', 'sweet potatoes', 'anamo', 'dankali'],
  },

  // ===================== FRUITS =====================
  {
    id: 'mango',
    name: 'Mango',
    icon: '🥭',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1200,
    keywords: ['mango', 'mangoes', 'mangoro', 'german mango', 'peter mango'],
    popular: true,
    customBg: 'bg-[#fff7ed]',
    customBorder: 'border-[#ea580c]/20',
  },
  {
    id: 'orange',
    name: 'Oranges',
    icon: '🍊',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1000,
    keywords: ['orange', 'oranges', 'osan', 'tangerine'],
    customBg: 'bg-[#fff7ed]',
    customBorder: 'border-[#ea580c]/15',
  },
  {
    id: 'banana',
    name: 'Banana',
    icon: '🍌',
    category: 'Fruits',
    defaultUnit: 'bunch',
    defaultPrice: 1500,
    keywords: ['banana', 'bananas', 'omini'],
    customBg: 'bg-[#fefce8]',
    customBorder: 'border-[#ca8a04]/15',
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    icon: '🍉',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1800,
    keywords: ['watermelon', 'melon fruit'],
    customBg: 'bg-[#fef2f2]',
    customBorder: 'border-[#dc2626]/15',
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    icon: '🍍',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1500,
    keywords: ['pineapple', 'pineapples'],
    customBg: 'bg-[#fefce8]',
    customBorder: 'border-[#ca8a04]/15',
  },
  {
    id: 'pawpaw',
    name: 'Pawpaw (Papaya)',
    icon: '🍈',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1200,
    keywords: ['pawpaw', 'papaya', 'ibepe'],
  },
  {
    id: 'avocado',
    name: 'Avocado / Native Pear (Ube)',
    icon: '🥑',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1000,
    keywords: ['avocado', 'pear', 'ube', 'native pear'],
    customBg: 'bg-[#ecfdf5]',
    customBorder: 'border-[#15803d]/15',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 1500,
    keywords: ['apple', 'apples'],
    customBg: 'bg-[#fef2f2]',
    customBorder: 'border-[#dc2626]/15',
  },
  {
    id: 'coconut',
    name: 'Coconut',
    icon: '🥥',
    category: 'Fruits',
    defaultUnit: 'pieces',
    defaultPrice: 800,
    keywords: ['coconut', 'agbon'],
  },
  {
    id: 'agbalumo',
    name: 'Agbalumo (Udara) / Guava',
    icon: '🍐',
    category: 'Fruits',
    defaultUnit: 'pack',
    defaultPrice: 1000,
    keywords: ['agbalumo', 'udara', 'african star apple', 'guava', 'soursop'],
  },
  {
    id: 'lemon-lime',
    name: 'Lemon / Lime',
    icon: '🍋',
    category: 'Fruits',
    defaultUnit: 'pack',
    defaultPrice: 700,
    keywords: ['lemon', 'lime', 'osan wewe'],
    customBg: 'bg-[#fefce8]',
    customBorder: 'border-[#ca8a04]/15',
  },
  {
    id: 'grapes',
    name: 'Grapes',
    icon: '🍇',
    category: 'Fruits',
    defaultUnit: 'pack',
    defaultPrice: 3500,
    keywords: ['grape', 'grapes'],
  },
  {
    id: 'groundnut',
    name: 'Groundnut / Cashew Nuts',
    icon: '🥜',
    category: 'Fruits',
    defaultUnit: 'bottle',
    defaultPrice: 1500,
    keywords: ['groundnut', 'peanut', 'cashew', 'epa', 'kuli kuli', 'tigernut', 'aya'],
  },

  // ===================== PANTRY STAPLES (GRAINS, SWALLOWS, OILS, PASTA) =====================
  {
    id: 'rice-local',
    name: 'Rice (Local / Foreign / Ofada)',
    icon: '🍚',
    category: 'Pantry Staples',
    defaultUnit: 'derica',
    defaultPrice: 1400,
    keywords: ['rice', 'ofada', 'basmati', 'mama gold', 'caprice', 'big bull', 'foreign rice', 'local rice', '50kg'],
    popular: true,
    customBg: 'bg-[#f8fafc]',
    customBorder: 'border-slate-900/12',
  },
  {
    id: 'beans-oloyin',
    name: 'Beans (Oloyin / Honey / Brown)',
    icon: '🫘',
    category: 'Pantry Staples',
    defaultUnit: 'derica',
    defaultPrice: 1800,
    keywords: ['beans', 'oloyin', 'honey beans', 'brown beans', 'iron beans', 'ewa', 'wake'],
    popular: true,
    customBg: 'bg-[#fef3c7]',
    customBorder: 'border-[#b45309]/20',
  },
  {
    id: 'garri',
    name: 'Garri (Ijebu / Yellow)',
    icon: '🥣',
    category: 'Pantry Staples',
    defaultUnit: 'paint',
    defaultPrice: 2800,
    keywords: ['garri', 'gari', 'ijebu garri', 'yellow garri', 'white garri', 'eba'],
    popular: true,
    customBg: 'bg-[#fef9c3]',
    customBorder: 'border-[#ca8a04]/20',
  },
  {
    id: 'semovita',
    name: 'Semovita / Wheat / Poundo / Amala',
    icon: '🌾',
    category: 'Pantry Staples',
    defaultUnit: 'bag',
    defaultPrice: 2200,
    keywords: ['semo', 'semovita', 'semolina', 'wheat', 'poundo', 'amala', 'elubo', 'yam flour', 'fufu', 'akpu', 'tuwo', 'flour', 'oats'],
  },
  {
    id: 'palm-oil',
    name: 'Red Palm Oil',
    icon: '🫗',
    category: 'Pantry Staples',
    defaultUnit: 'L',
    defaultPrice: 4200,
    keywords: ['palm oil', 'red oil', 'epo pupa', 'man ja', 'banga'],
    popular: true,
    customBg: 'bg-[#ffedd5]',
    customBorder: 'border-[#ea580c]/25',
  },
  {
    id: 'groundnut-oil',
    name: 'Groundnut / Vegetable Oil',
    icon: '🫒',
    category: 'Pantry Staples',
    defaultUnit: 'L',
    defaultPrice: 3200,
    keywords: ['groundnut oil', 'vegetable oil', 'kings oil', 'power oil', 'golden terra', 'devon', 'mamador', 'cooking oil', 'ororo'],
    customBg: 'bg-[#fefce8]',
    customBorder: 'border-[#ca8a04]/20',
  },
  {
    id: 'tomato-paste',
    name: 'Tomato Paste (Sachet / Tin)',
    icon: '🥫',
    category: 'Pantry Staples',
    defaultUnit: 'pack',
    defaultPrice: 1800,
    keywords: ['tomato paste', 'tin tomato', 'gino', 'sonia', 'tasty tom', 'derica paste', 'ketchup'],
    customBg: 'bg-[#fef2f2]',
    customBorder: 'border-[#dc2626]/15',
  },
  {
    id: 'indomie',
    name: 'Noodles (Indomie)',
    icon: '🍜',
    category: 'Pantry Staples',
    defaultUnit: 'pack',
    defaultPrice: 1400,
    keywords: ['indomie', 'noodles', 'noodle', 'chikki', 'golden penny noodles', 'carton'],
  },
  {
    id: 'spaghetti',
    name: 'Spaghetti / Macaroni',
    icon: '🍝',
    category: 'Pantry Staples',
    defaultUnit: 'pack',
    defaultPrice: 1200,
    keywords: ['spaghetti', 'macaroni', 'pasta', 'dangote pasta', 'golden penny pasta'],
  },
  {
    id: 'egusi',
    name: 'Egusi (Melon Seeds)',
    icon: '🌻',
    category: 'Pantry Staples',
    defaultUnit: 'paint',
    defaultPrice: 4500,
    keywords: ['egusi', 'melon', 'melon seed', 'melon seeds'],
  },
  {
    id: 'ogbono',
    name: 'Ogbono / Apon',
    icon: '🌰',
    category: 'Pantry Staples',
    defaultUnit: 'derica',
    defaultPrice: 3500,
    keywords: ['ogbono', 'apon', 'achi', 'ofo', 'ukpo'],
  },
  {
    id: 'corn-maize',
    name: 'Maize / Corn / Pap (Ogi)',
    icon: '🌽',
    category: 'Pantry Staples',
    defaultUnit: 'paint',
    defaultPrice: 2000,
    keywords: ['maize', 'corn', 'sweet corn', 'ogi', 'pap', 'akamu', 'millet', 'guinea corn', 'sorghum'],
  },
  {
    id: 'bread',
    name: 'Bread (Agege / Sliced)',
    icon: '🍞',
    category: 'Pantry Staples',
    defaultUnit: 'loaf',
    defaultPrice: 1500,
    keywords: ['bread', 'agege bread', 'sliced bread', 'butter bread', 'sardine bread', 'loaf'],
  },
  {
    id: 'mayonnaise',
    name: 'Mayonnaise (Bama) / Spread',
    icon: '🫙',
    category: 'Pantry Staples',
    defaultUnit: 'bottle',
    defaultPrice: 3500,
    keywords: ['mayonnaise', 'bama', 'jago', 'salad cream', 'condiment', 'peanut butter'],
  },
  {
    id: 'butter',
    name: 'Butter / Margarine (Blue Band)',
    icon: '🧈',
    category: 'Pantry Staples',
    defaultUnit: 'pack',
    defaultPrice: 1800,
    keywords: ['butter', 'blue band', 'margarine', 'top tea butter'],
  },
  {
    id: 'sugar-honey',
    name: 'Sugar / Honey',
    icon: '🍯',
    category: 'Pantry Staples',
    defaultUnit: 'pack',
    defaultPrice: 1500,
    keywords: ['sugar', 'dangote sugar', 'st louis', 'honey'],
  },

  // ===================== SPICES & SEASONINGS =====================
  {
    id: 'maggi',
    name: 'Maggi / Knorr Seasoning',
    icon: '🧂',
    category: 'Spices',
    defaultUnit: 'pack',
    defaultPrice: 1200,
    keywords: ['maggi', 'knorr', 'royco', 'seasoning', 'cube', 'cubes', 'star', 'onga', 'terra'],
    popular: true,
  },
  {
    id: 'salt',
    name: 'Salt (Dangote)',
    icon: '🧂',
    category: 'Spices',
    defaultUnit: 'sachet',
    defaultPrice: 250,
    keywords: ['salt', 'dangote salt', 'mr chef salt'],
  },
  {
    id: 'curry-thyme',
    name: 'Curry & Thyme / Mixed Spices',
    icon: '🫙',
    category: 'Spices',
    defaultUnit: 'sachet',
    defaultPrice: 400,
    keywords: ['curry', 'thyme', 'nutmeg', 'bay leaf', 'cloves', 'cinnamon', 'rosemary', 'spice', 'spices', 'suya spice', 'yaji', 'cameroon pepper', 'dry pepper'],
  },
  {
    id: 'iru',
    name: 'Locust Beans (Iru / Ogiri)',
    icon: '🫘',
    category: 'Spices',
    defaultUnit: 'pack',
    defaultPrice: 500,
    keywords: ['iru', 'locust bean', 'locust beans', 'dawadawa', 'ogiri', 'okpei'],
  },

  // ===================== DAIRY, BREAKFAST & DRINKS =====================
  {
    id: 'milk',
    name: 'Milk (Peak / Three Crowns / Dano)',
    icon: '🥛',
    category: 'Dairy & Drinks',
    defaultUnit: 'tin',
    defaultPrice: 900,
    keywords: ['milk', 'peak', 'three crowns', 'dano', 'cowbell', 'hollandia', 'yoghurt', 'yogurt', 'evaporated', 'powdered milk'],
    popular: true,
  },
  {
    id: 'milo',
    name: 'Milo / Bournvita / Tea',
    icon: '☕',
    category: 'Dairy & Drinks',
    defaultUnit: 'pack',
    defaultPrice: 2500,
    keywords: ['milo', 'bournvita', 'ovaltine', 'lipton', 'top tea', 'tea', 'coffee', 'nescafe', 'cocoa'],
  },
  {
    id: 'cereal-custard',
    name: 'Golden Morn / Custard / Cornflakes',
    icon: '🥣',
    category: 'Dairy & Drinks',
    defaultUnit: 'pack',
    defaultPrice: 2400,
    keywords: ['golden morn', 'cornflakes', 'custard', 'checkers', 'cereal', 'quaker'],
  },
  {
    id: 'zobo',
    name: 'Zobo Leaves (Hibiscus)',
    icon: '🌺',
    category: 'Dairy & Drinks',
    defaultUnit: 'paint',
    defaultPrice: 1200,
    keywords: ['zobo', 'hibiscus', 'kunu'],
  },
  {
    id: 'water-drinks',
    name: 'Pure Water / Bottled Water / Malt',
    icon: '💧',
    category: 'Dairy & Drinks',
    defaultUnit: 'pack',
    defaultPrice: 2000,
    keywords: ['water', 'pure water', 'eva', 'ragolis', 'malt', 'malta', 'coke', 'fanta', 'juice', 'chivita', 'drink', 'drinks'],
  },

  // ===================== HOUSEHOLD & COOKING FUEL =====================
  {
    id: 'cooking-gas',
    name: 'Cooking Gas Refill',
    icon: '🔥',
    category: 'Household',
    defaultUnit: 'kg',
    defaultPrice: 1300,
    keywords: ['gas', 'cooking gas', 'lpg', 'cylinder', 'charcoal', 'kerosene'],
    customBg: 'bg-[#fff7ed]',
    customBorder: 'border-[#ea580c]/20',
  },
  {
    id: 'soap-detergent',
    name: 'Soap / Detergent / Dishwash',
    icon: '🧼',
    category: 'Household',
    defaultUnit: 'pack',
    defaultPrice: 1500,
    keywords: ['soap', 'detergent', 'omo', 'ariel', 'sunlight', 'good mama', 'morning fresh', 'dishwash', 'dishwashing', 'bleach', 'hypo', 'jik'],
  },
  {
    id: 'tissue',
    name: 'Tissue / Paper Towels',
    icon: '🧻',
    category: 'Household',
    defaultUnit: 'roll',
    defaultPrice: 1200,
    keywords: ['tissue', 'toilet roll', 'paper towel', 'paper towels', 'serviette', 'napkin'],
  },
];

export const POPULAR_MARKET_STAPLES: NigerianFoodItem[] = NIGERIAN_FOOD_REGISTRY.filter(
  (item) => item.popular
);

/**
 * Resolve the cleanest matching food icon and Apple-tinted surface for any item name.
 */
export function resolveFoodVisual(
  itemName: string,
  fallbackCategory?: ItemCategory
): ResolvedFoodVisual {
  const normalized = (itemName || '').trim().toLowerCase();

  if (normalized) {
    // 1. Direct keyword match (prioritize longer/more specific keywords first)
    let bestMatch: NigerianFoodItem | undefined;
    let bestScore = 0;

    for (const item of NIGERIAN_FOOD_REGISTRY) {
      if (item.name.toLowerCase() === normalized) {
        bestMatch = item;
        bestScore = 1000;
        break;
      }

      for (const kw of item.keywords) {
        if (normalized.includes(kw)) {
          const score = kw.length + (normalized.startsWith(kw) ? 10 : 0);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        }
      }
    }

    if (bestMatch) {
      const catStyle = CATEGORY_REGISTRY[bestMatch.category] || CATEGORY_REGISTRY['Pantry Staples'];
      return {
        icon: bestMatch.icon,
        category: bestMatch.category,
        bgClass: bestMatch.customBg || catStyle.bgClass,
        textClass: catStyle.textClass,
        borderClass: bestMatch.customBorder || catStyle.borderClass,
        matchedItem: bestMatch,
      };
    }
  }

  const cat = fallbackCategory && CATEGORY_REGISTRY[fallbackCategory] ? fallbackCategory : 'Pantry Staples';
  const catStyle = CATEGORY_REGISTRY[cat];
  return {
    icon: catStyle.icon,
    category: cat,
    bgClass: catStyle.bgClass,
    textClass: catStyle.textClass,
    borderClass: catStyle.borderClass,
  };
}

/**
 * Search the Nigerian Market Food Registry by name, synonym, or category.
 */
export function searchNigerianFoods(query: string, limit = 8): NigerianFoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_MARKET_STAPLES.slice(0, limit);

  const scored = NIGERIAN_FOOD_REGISTRY.map((item) => {
    const lowerName = item.name.toLowerCase();
    let score = 0;
    if (lowerName === q) score += 100;
    else if (lowerName.startsWith(q)) score += 60;
    else if (lowerName.includes(q)) score += 35;

    for (const kw of item.keywords) {
      if (kw === q) score += 80;
      else if (kw.startsWith(q)) score += 45;
      else if (kw.includes(q)) score += 20;
    }

    if (item.category.toLowerCase().includes(q)) score += 10;
    return { item, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);

  return scored;
}

export function getCategoryVisual(category: ItemCategory | string): CategoryVisual {
  const key = category as ItemCategory;
  return CATEGORY_REGISTRY[key] || CATEGORY_REGISTRY['Pantry Staples'];
}
