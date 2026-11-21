import { RegionProfile } from '../types';

export type MarketVenueType = 'food_market' | 'supermarket' | 'wholesale_hub';

export type NigerianGeoZone =
  | 'South-West'
  | 'North-Central'
  | 'South-South'
  | 'North-West'
  | 'South-East'
  | 'North-East';

export interface NigerianMarketEntry {
  id: string;
  name: string;
  type: MarketVenueType;
  stateId: string;
  stateName: string;
  city: string;
  zone: NigerianGeoZone;
  popularFor: string;
}

interface StateMarketSeed {
  id: string;
  name: string;
  state: string;
  zone: NigerianGeoZone;
  tagline: string;
  priceMultiplier: number;
  entries: Array<{
    name: string;
    type: MarketVenueType;
    city: string;
    popularFor: string;
  }>;
}

const STATE_MARKET_SEEDS: StateMarketSeed[] = [
  {
    id: 'lagos',
    name: 'Lagos State',
    state: 'Lagos',
    zone: 'South-West',
    tagline: 'Mile 12, Oyingbo, Ketu & Major Supermarkets',
    priceMultiplier: 1.0,
    entries: [
      { name: 'Mile 12 International Market', type: 'wholesale_hub', city: 'Kosofe, Lagos', popularFor: 'Tomatoes, pepper, onions, yams & wholesale foodstuff' },
      { name: 'Oyingbo Market', type: 'food_market', city: 'Ebute Metta, Lagos', popularFor: 'Fresh produce, meats, palm oil & staples' },
      { name: 'Ketu Foodstuff Market', type: 'food_market', city: 'Ketu, Lagos', popularFor: 'Bulk foodstuffs, garri, beans & vegetables' },
      { name: 'Daleko Market', type: 'wholesale_hub', city: 'Mushin, Lagos', popularFor: 'Wholesale rice, beans, semovita & cooking oil' },
      { name: 'Iddo Market', type: 'wholesale_hub', city: 'Lagos Mainland', popularFor: 'Wholesale rice, beans, garri & dried fish' },
      { name: 'Mushin Market (Ojuwoye)', type: 'food_market', city: 'Mushin, Lagos', popularFor: 'Everyday foodstuffs, soups & fresh produce' },
      { name: 'Oshodi Market', type: 'food_market', city: 'Oshodi, Lagos', popularFor: 'Groceries, staples & household items' },
      { name: 'Ajah Market', type: 'food_market', city: 'Ajah, Lagos', popularFor: 'Island foodstuffs, fresh seafood & produce' },
      { name: 'Alaba Rago Market', type: 'wholesale_hub', city: 'Ojo, Lagos', popularFor: 'Livestock, ram, onions & northern grains' },
      { name: 'Agege Market', type: 'food_market', city: 'Agege, Lagos', popularFor: 'Fresh meat, yams, grains & provisions' },
      { name: 'Balogun Market', type: 'food_market', city: 'Lagos Island', popularFor: 'Provisions, spices & general market goods' },
      { name: 'Igando Market', type: 'food_market', city: 'Alimosho, Lagos', popularFor: 'Fresh vegetables, garri, palm oil & staples' },
      { name: 'Ikotun Market', type: 'food_market', city: 'Alimosho, Lagos', popularFor: 'Household foodstuff, fruits & proteins' },
      { name: 'Bariga Market', type: 'food_market', city: 'Bariga, Lagos', popularFor: 'Fresh fish, produce & everyday groceries' },
      { name: 'Sabo Market (Ikorodu)', type: 'food_market', city: 'Ikorodu, Lagos', popularFor: 'Garri, palm oil, yams & farm produce' },
      { name: 'Sangotedo Market', type: 'food_market', city: 'Eti-Osa, Lagos', popularFor: 'Fresh produce, poultry & everyday foodstuff' },
      { name: 'Boundary Market (Ajegunle)', type: 'food_market', city: 'Ajeromi, Lagos', popularFor: 'Affordable staples, fish & vegetables' },
      { name: 'Shoprite (Ikeja City Mall)', type: 'supermarket', city: 'Ikeja, Lagos', popularFor: 'Groceries, bakery, cold cuts & provisions' },
      { name: 'Shoprite (The Palms, Lekki)', type: 'supermarket', city: 'Lekki, Lagos', popularFor: 'Supermarket groceries, fresh produce & dairy' },
      { name: 'Shoprite (Novare Mall, Sangotedo)', type: 'supermarket', city: 'Sangotedo, Lagos', popularFor: 'Family groceries, frozen foods & household items' },
      { name: 'Shoprite (Festival Mall, Festac)', type: 'supermarket', city: 'Festac, Lagos', popularFor: 'Packaged groceries, meat & beverages' },
      { name: 'Shoprite (Surulere)', type: 'supermarket', city: 'Surulere, Lagos', popularFor: 'Supermarket staples, bakery & toiletries' },
      { name: 'Justrite Superstore (Abule Egba)', type: 'supermarket', city: 'Abule Egba, Lagos', popularFor: 'Everyday provisions, rice, oil & toiletries' },
      { name: 'Justrite Superstore (Ikorodu)', type: 'supermarket', city: 'Ikorodu, Lagos', popularFor: 'Affordable groceries & household staples' },
      { name: 'Justrite Superstore (Ojudu Berger)', type: 'supermarket', city: 'Ojodu, Lagos', popularFor: 'Family groceries, beverages & pantry items' },
      { name: 'Justrite Superstore (Iyana Ipaja)', type: 'supermarket', city: 'Alimosho, Lagos', popularFor: 'Provisions, frozen foods & household goods' },
      { name: 'Bokku! Mart (Surulere)', type: 'supermarket', city: 'Surulere, Lagos', popularFor: 'Discount groceries, bread, eggs & staples' },
      { name: 'Bokku! Mart (Yaba)', type: 'supermarket', city: 'Yaba, Lagos', popularFor: 'Budget supermarket groceries & fresh bread' },
      { name: 'Bokku! Mart (Ikeja)', type: 'supermarket', city: 'Ikeja, Lagos', popularFor: 'Everyday discount pantry & dairy essentials' },
      { name: 'SPAR Market (Victoria Island)', type: 'supermarket', city: 'Victoria Island, Lagos', popularFor: 'Fresh produce, meat counter & groceries' },
      { name: 'SPAR Market (Ilupeju)', type: 'supermarket', city: 'Ilupeju, Lagos', popularFor: 'Supermarket groceries, bakery & meats' },
      { name: 'SPAR Market (Lekki)', type: 'supermarket', city: 'Lekki, Lagos', popularFor: 'Groceries, dairy, produce & provisions' },
      { name: 'Prince Ebeano Supermarket (Lekki)', type: 'supermarket', city: 'Lekki, Lagos', popularFor: 'Nigerian groceries, fresh food & bakery' },
      { name: 'Prince Ebeano Supermarket (Ikeja GRA)', type: 'supermarket', city: 'Ikeja, Lagos', popularFor: 'Groceries, meat, fruits & packaged staples' },
      { name: 'Hubmart Stores (Victoria Island)', type: 'supermarket', city: 'Victoria Island, Lagos', popularFor: 'Fresh produce, poultry, groceries & pastries' },
      { name: 'Hubmart Stores (Ikeja GRA)', type: 'supermarket', city: 'Ikeja, Lagos', popularFor: 'Supermarket groceries, meat & beverages' },
      { name: 'Jendol Superstores (Egbeda)', type: 'supermarket', city: 'Egbeda, Lagos', popularFor: 'Wholesale & retail provisions, drinks & staples' },
      { name: 'Jendol Superstores (Isolo)', type: 'supermarket', city: 'Isolo, Lagos', popularFor: 'Family provisions, grains & household goods' },
      { name: 'Blenco Supermarket (Sangotedo)', type: 'supermarket', city: 'Sangotedo, Lagos', popularFor: 'Groceries, fresh bakery & household needs' },
      { name: 'Market Square (Ikeja)', type: 'supermarket', city: 'Ikeja, Lagos', popularFor: 'Fresh foods, meats, staples & bakery' },
      { name: 'Addide Supermarket (Surulere)', type: 'supermarket', city: 'Surulere, Lagos', popularFor: 'Quick everyday groceries & provisions' },
      { name: 'Renee Supermarket (Victoria Island)', type: 'supermarket', city: 'Victoria Island, Lagos', popularFor: 'Groceries, snacks & pantry supplies' },
    ],
  },
  {
    id: 'abuja',
    name: 'Abuja (FCT)',
    state: 'Federal Capital Territory',
    zone: 'North-Central',
    tagline: 'Wuse, Utako, Garki & FCT Supermarkets',
    priceMultiplier: 1.08,
    entries: [
      { name: 'Wuse Market', type: 'food_market', city: 'Wuse, Abuja', popularFor: 'Fresh produce, spices, meat & grains' },
      { name: 'Utako Ultra Modern Market', type: 'food_market', city: 'Utako, Abuja', popularFor: 'Foodstuffs, fruits, tubers & provisions' },
      { name: 'Garki Model Market', type: 'food_market', city: 'Garki, Abuja', popularFor: 'Everyday groceries, fresh meats & vegetables' },
      { name: 'Gosa Market', type: 'wholesale_hub', city: 'Airport Road, Abuja', popularFor: 'Wholesale yams, beans, maize & farm produce' },
      { name: 'Dei-Dei International Market', type: 'wholesale_hub', city: 'Dei-Dei, Abuja', popularFor: 'Bulk grains, tomatoes, onions & tubers' },
      { name: 'Kubwa Village Market', type: 'food_market', city: 'Kubwa, Abuja', popularFor: 'Affordable foodstuffs, vegetables & meat' },
      { name: 'Karmo Market', type: 'food_market', city: 'Karmo, Abuja', popularFor: 'Fresh farm produce, yams & poultry' },
      { name: 'Maitama Farmers Market', type: 'food_market', city: 'Maitama, Abuja', popularFor: 'Fresh organic produce, fruits & meats' },
      { name: 'Nyanya Market', type: 'food_market', city: 'Nyanya, Abuja', popularFor: 'Everyday foodstuffs, grains & tubers' },
      { name: 'Gwagwalada Market', type: 'food_market', city: 'Gwagwalada, Abuja', popularFor: 'Yams, beans, garri & fresh produce' },
      { name: 'Next Cash and Carry (Jahi)', type: 'supermarket', city: 'Jahi, Abuja', popularFor: 'Wholesale & retail groceries, fresh meats & bakery' },
      { name: 'Sahad Stores (Central Area)', type: 'supermarket', city: 'Central Area, Abuja', popularFor: 'Groceries, household staples & provisions' },
      { name: 'Sahad Stores (Gwarinpa)', type: 'supermarket', city: 'Gwarinpa, Abuja', popularFor: 'Family supermarket groceries & toiletries' },
      { name: 'H-Medix Supermarket (Wuse 2)', type: 'supermarket', city: 'Wuse 2, Abuja', popularFor: 'Groceries, fresh produce, drinks & pharmacy' },
      { name: '4U Supermarket (Wuse 2)', type: 'supermarket', city: 'Wuse 2, Abuja', popularFor: 'Imported & Nigerian groceries, fresh food' },
      { name: 'Shoprite (Jabi Lake Mall)', type: 'supermarket', city: 'Jabi, Abuja', popularFor: 'Supermarket staples, bakery & cold cuts' },
      { name: 'Shoprite (Novare Gateway, Lugbe)', type: 'supermarket', city: 'Lugbe, Abuja', popularFor: 'Groceries, produce & household items' },
      { name: 'SPAR Market (Wuse 2)', type: 'supermarket', city: 'Wuse 2, Abuja', popularFor: 'Fresh foods, meats & pantry groceries' },
      { name: 'Prince Ebeano Supermarket (Lokogoma)', type: 'supermarket', city: 'Lokogoma, Abuja', popularFor: 'Groceries, baked goods & frozen proteins' },
      { name: 'Market Square (Gwarinpa)', type: 'supermarket', city: 'Gwarinpa, Abuja', popularFor: 'Fresh produce, meats & everyday groceries' },
      { name: 'Grandsquare Supermarket (Central Area)', type: 'supermarket', city: 'Central Area, Abuja', popularFor: 'Groceries, fruits, dairy & pantry items' },
    ],
  },
  {
    id: 'ibadan',
    name: 'Oyo State (Ibadan)',
    state: 'Oyo State',
    zone: 'South-West',
    tagline: 'Bodija, Oja Oba, Shasha & FoodCo',
    priceMultiplier: 0.94,
    entries: [
      { name: 'Bodija Market', type: 'wholesale_hub', city: 'Ibadan', popularFor: 'Wholesale foodstuff, beans, yam flour, rice & cattle' },
      { name: 'Shasha Market', type: 'wholesale_hub', city: 'Akinyele, Ibadan', popularFor: 'Bulk tomatoes, pepper, onions & northern produce' },
      { name: 'Oja Oba Market', type: 'food_market', city: 'Ibadan', popularFor: 'Traditional herbs, spices, palm oil & staples' },
      { name: 'Dugbe Market', type: 'food_market', city: 'Ibadan', popularFor: 'Provisions, groceries & household essentials' },
      { name: 'Oje Food & Herb Market', type: 'food_market', city: 'Ibadan', popularFor: 'Fresh foodstuffs, yam & local ingredients' },
      { name: 'Iwo Road Market', type: 'food_market', city: 'Ibadan', popularFor: 'Everyday groceries, fruits & vegetables' },
      { name: 'Aleshinloye Market', type: 'food_market', city: 'Ibadan', popularFor: 'Household provisions, spices & kitchen supplies' },
      { name: 'Sabo Market (Ogbomoso)', type: 'food_market', city: 'Ogbomoso', popularFor: 'Yam, cassava, mangoes & farm produce' },
      { name: 'Akesan Market (Oyo)', type: 'food_market', city: 'Oyo Town', popularFor: 'Fresh foodstuffs, garri, elubo & staples' },
      { name: 'Shoprite (Cocoa Mall, Dugbe)', type: 'supermarket', city: 'Ibadan', popularFor: 'Groceries, bakery, meats & provisions' },
      { name: 'Shoprite (Palms Mall, Ring Road)', type: 'supermarket', city: 'Ibadan', popularFor: 'Supermarket staples, dairy & produce' },
      { name: 'FoodCo Supermarket (Bodija)', type: 'supermarket', city: 'Ibadan', popularFor: 'Everyday groceries, fresh bread & frozen foods' },
      { name: 'FoodCo Supermarket (Ring Road)', type: 'supermarket', city: 'Ibadan', popularFor: 'Supermarket provisions, drinks & bakery' },
      { name: 'FoodCo Supermarket (Jericho)', type: 'supermarket', city: 'Ibadan', popularFor: 'Family groceries & household supplies' },
      { name: 'Justrite Superstore (Ibadan)', type: 'supermarket', city: 'Ibadan', popularFor: 'Affordable provisions, rice & cooking oil' },
      { name: 'Feedwell Supermarket (Ibadan)', type: 'supermarket', city: 'Ibadan', popularFor: 'Groceries, snacks & daily essentials' },
    ],
  },
  {
    id: 'portharcourt',
    name: 'Rivers State (Port Harcourt)',
    state: 'Rivers State',
    zone: 'South-South',
    tagline: 'Oil Mill, Mile 1, Creek Road & Market Square',
    priceMultiplier: 1.06,
    entries: [
      { name: 'Oil Mill Market', type: 'wholesale_hub', city: 'Rumuokwurusi, Port Harcourt', popularFor: 'Wednesday bulk foodstuffs, palm oil, garri & meat' },
      { name: 'Mile 1 (Diobu) Market', type: 'food_market', city: 'Diobu, Port Harcourt', popularFor: 'Everyday groceries, vegetables & staples' },
      { name: 'Mile 3 Market', type: 'food_market', city: 'Port Harcourt', popularFor: 'Foodstuffs, yam, rice, beans & provisions' },
      { name: 'Creek Road Market', type: 'food_market', city: 'Town, Port Harcourt', popularFor: 'Fresh seafood, periwinkle, fish & plantain' },
      { name: 'Fruit Garden Market', type: 'food_market', city: 'D-Line, Port Harcourt', popularFor: 'Fresh fruits, vegetables, spices & salad greens' },
      { name: 'Rumuokoro Market', type: 'food_market', city: 'Obio-Akpor, Port Harcourt', popularFor: 'Garri, palm oil, meat & daily foodstuffs' },
      { name: 'Choba Market', type: 'food_market', city: 'Choba, Port Harcourt', popularFor: 'Student-friendly staples, tubers & produce' },
      { name: 'Slaughter Market (Trans-Amadi)', type: 'wholesale_hub', city: 'Trans-Amadi, Port Harcourt', popularFor: 'Fresh beef, goat meat, poultry & seafood' },
      { name: 'Market Square (GRA Phase 2)', type: 'supermarket', city: 'Port Harcourt', popularFor: 'Groceries, fresh meats, produce & bakery' },
      { name: 'Market Square (Peter Odili Road)', type: 'supermarket', city: 'Port Harcourt', popularFor: 'Supermarket groceries, dairy & staples' },
      { name: 'Market Square (Choba / East-West)', type: 'supermarket', city: 'Port Harcourt', popularFor: 'Everyday groceries & household items' },
      { name: 'SPAR Market (Port Harcourt Mall)', type: 'supermarket', city: 'Azikiwe Road, Port Harcourt', popularFor: 'Supermarket staples, bakery & cold cuts' },
      { name: 'Next Cash and Carry (Trans-Amadi)', type: 'supermarket', city: 'Port Harcourt', popularFor: 'Bulk & retail groceries, drinks & provisions' },
      { name: 'Everyday Supermarket (GRA)', type: 'supermarket', city: 'Port Harcourt', popularFor: 'Groceries, fresh food & family provisions' },
      { name: 'Hypercity Supermarket (Peter Odili)', type: 'supermarket', city: 'Port Harcourt', popularFor: 'Supermarket staples, bakery & toiletries' },
    ],
  },
  {
    id: 'kano',
    name: 'Kano State',
    state: 'Kano',
    zone: 'North-West',
    tagline: 'Dawanau Grains, Singa, Kurmi & Supermarkets',
    priceMultiplier: 0.90,
    entries: [
      { name: 'Dawanau International Grain Market', type: 'wholesale_hub', city: 'Dawakin Tofa, Kano', popularFor: 'West Africa’s largest wholesale grains, beans, millet & sesame' },
      { name: 'Singa Market', type: 'wholesale_hub', city: 'Kano Municipal', popularFor: 'Wholesale provisions, sugar, pasta, cooking oil & rice' },
      { name: 'Kurmi Market', type: 'food_market', city: 'Kano Old City', popularFor: 'Spices, herbs, dried produce & traditional foods' },
      { name: 'Sabon Gari Market (Abubakar Rimi)', type: 'food_market', city: 'Sabon Gari, Kano', popularFor: 'Everyday groceries, southern & northern foodstuffs' },
      { name: 'Yankaba Market', type: 'wholesale_hub', city: 'Nassarawa, Kano', popularFor: 'Fresh tomatoes, onions, pepper & vegetables' },
      { name: 'Kasuwar Rimi', type: 'food_market', city: 'Kano Municipal', popularFor: 'Fresh produce, meats, grains & spices' },
      { name: 'Tarauni Market', type: 'food_market', city: 'Tarauni, Kano', popularFor: 'Daily household foodstuffs & fresh meats' },
      { name: 'Shoprite (Ado Bayero Mall)', type: 'supermarket', city: 'Kano', popularFor: 'Supermarket groceries, bakery & cold cuts' },
      { name: 'Sahad Stores (Kano)', type: 'supermarket', city: 'Nassarawa, Kano', popularFor: 'Groceries, household staples & provisions' },
      { name: 'Wellcare Supermarket (Kano)', type: 'supermarket', city: 'Kano', popularFor: 'Everyday groceries, drinks & toiletries' },
      { name: 'Country Mall Supermarket', type: 'supermarket', city: 'Nassarawa GRA, Kano', popularFor: 'Groceries, fresh bread & pantry items' },
    ],
  },
  {
    id: 'onitsha',
    name: 'Anambra State (Onitsha / Awka)',
    state: 'Anambra State',
    zone: 'South-East',
    tagline: 'Onitsha Main, Relief, Eke Awka & Roban',
    priceMultiplier: 0.96,
    entries: [
      { name: 'Onitsha Main Market', type: 'wholesale_hub', city: 'Onitsha', popularFor: 'Wholesale provisions, packaged staples & general goods' },
      { name: 'Relief Market (Foodstuff)', type: 'wholesale_hub', city: 'Onitsha', popularFor: 'Bulk rice, beans, palm oil, yam & crayfish' },
      { name: 'Ochanja Market', type: 'food_market', city: 'Onitsha', popularFor: 'Everyday foodstuffs, meat, fish & vegetables' },
      { name: 'Ogbaru Main Market', type: 'food_market', city: 'Ogbaru, Onitsha', popularFor: 'Fresh farm produce, yam, plantain & cassava' },
      { name: 'Eke Awka Market', type: 'food_market', city: 'Awka', popularFor: 'Fresh vegetables, palm oil, garri & staples' },
      { name: 'Nkwo Nnewi Market', type: 'food_market', city: 'Nnewi', popularFor: 'Foodstuffs, grains, meat & household items' },
      { name: 'Afor Nnobi Market', type: 'food_market', city: 'Nnobi', popularFor: 'Fresh produce, palm oil & soup ingredients' },
      { name: 'Shoprite (Onitsha Mall)', type: 'supermarket', city: 'Onitsha', popularFor: 'Supermarket groceries, bakery & beverages' },
      { name: 'Roban Stores (Awka)', type: 'supermarket', city: 'Awka', popularFor: 'Groceries, bakery, frozen proteins & staples' },
      { name: 'Market Square (Awka)', type: 'supermarket', city: 'Awka', popularFor: 'Fresh produce, meats & everyday groceries' },
    ],
  },
  {
    id: 'ogun',
    name: 'Ogun State',
    state: 'Ogun State',
    zone: 'South-West',
    tagline: 'Kuto, Lafenwa, Kara & Justrite',
    priceMultiplier: 0.96,
    entries: [
      { name: 'Kuto Market', type: 'food_market', city: 'Abeokuta', popularFor: 'Ofada rice, garri, palm oil & fresh produce' },
      { name: 'Lafenwa Market', type: 'wholesale_hub', city: 'Abeokuta', popularFor: 'Bulk foodstuffs, meat, grains & vegetables' },
      { name: 'Omida Market', type: 'food_market', city: 'Abeokuta', popularFor: 'Everyday groceries, soup ingredients & fruits' },
      { name: 'Lusada Market', type: 'food_market', city: 'Ado-Odo/Ota', popularFor: 'Fresh farm produce, cassava & palm oil' },
      { name: 'Sango Ota Market', type: 'food_market', city: 'Sango Ota', popularFor: 'Foodstuffs, tomatoes, pepper & provisions' },
      { name: 'Kara Cattle & Food Market', type: 'wholesale_hub', city: 'Berger/Isheri', popularFor: 'Cattle, ram, onions & bulk northern produce' },
      { name: 'Sabon Sagamu Market', type: 'food_market', city: 'Sagamu', popularFor: 'Kola nut, grains, yams & fresh foodstuffs' },
      { name: 'Oja Oba (Ijebu-Ode)', type: 'food_market', city: 'Ijebu-Ode', popularFor: 'Ijebu garri, palm oil, fish & staples' },
      { name: 'Justrite Superstore (Sango Ota)', type: 'supermarket', city: 'Sango Ota', popularFor: 'Everyday provisions, rice & household items' },
      { name: 'Justrite Superstore (Abeokuta)', type: 'supermarket', city: 'Abeokuta', popularFor: 'Family groceries, drinks & pantry staples' },
      { name: 'FoodCo Supermarket (Abeokuta)', type: 'supermarket', city: 'Abeokuta', popularFor: 'Groceries, fresh bakery & frozen meats' },
    ],
  },
  {
    id: 'enugu',
    name: 'Enugu State',
    state: 'Enugu State',
    zone: 'South-East',
    tagline: 'Ogbete Main, New Market, Roban & Shoprite',
    priceMultiplier: 0.97,
    entries: [
      { name: 'Ogbete Main Market', type: 'wholesale_hub', city: 'Enugu', popularFor: 'Wholesale rice, palm oil, yams, crayfish & staples' },
      { name: 'New Market (Enugu)', type: 'food_market', city: 'Enugu', popularFor: 'Fresh vegetables, garri, meats & fruits' },
      { name: 'Artisan Market', type: 'food_market', city: 'Enugu', popularFor: 'Fresh meat, tomatoes, pepper & everyday foodstuff' },
      { name: 'Mayor Market', type: 'food_market', city: 'Enugu', popularFor: 'Neighborhood groceries, fish & produce' },
      { name: 'Ogige Market (Nsukka)', type: 'food_market', city: 'Nsukka', popularFor: 'Nsukka yellow pepper, yams, palm oil & grains' },
      { name: 'Shoprite (Polo Park Mall)', type: 'supermarket', city: 'Enugu', popularFor: 'Supermarket groceries, bakery & meats' },
      { name: 'Roban Stores (Independence Layout)', type: 'supermarket', city: 'Enugu', popularFor: 'Groceries, bread, frozen foods & toiletries' },
      { name: 'Market Square (Enugu)', type: 'supermarket', city: 'Enugu', popularFor: 'Fresh produce, meats & everyday groceries' },
      { name: 'SPAR Market (Enugu)', type: 'supermarket', city: 'Enugu', popularFor: 'Packaged groceries, produce & beverages' },
    ],
  },
  {
    id: 'kaduna',
    name: 'Kaduna State',
    state: 'Kaduna State',
    zone: 'North-West',
    tagline: 'Central Market, Kasuwar Barci & Supermarkets',
    priceMultiplier: 0.92,
    entries: [
      { name: 'Kaduna Central Market (Abubakar Gumi)', type: 'wholesale_hub', city: 'Kaduna', popularFor: 'Bulk grains, spices, provisions & foodstuffs' },
      { name: 'Kasuwar Barci', type: 'food_market', city: 'Tudun Wada, Kaduna', popularFor: 'Fresh produce, meats, grains & everyday staples' },
      { name: 'Kawo Market', type: 'food_market', city: 'Kawo, Kaduna', popularFor: 'Tomatoes, onions, yams & household groceries' },
      { name: 'Kakuri Market', type: 'food_market', city: 'Kaduna South', popularFor: 'Everyday foodstuffs, meat & vegetables' },
      { name: 'Sabon Tasha Market', type: 'food_market', city: 'Chikun, Kaduna', popularFor: 'Fresh farm produce, yam, garri & staples' },
      { name: 'Sabo Market (Zaria)', type: 'food_market', city: 'Zaria', popularFor: 'Grains, tomatoes, onions & fresh meats' },
      { name: 'Kafanchan Main Market', type: 'food_market', city: 'Kafanchan', popularFor: 'Ginger, yams, maize & fresh vegetables' },
      { name: 'Sahad Stores (Kaduna)', type: 'supermarket', city: 'Kaduna', popularFor: 'Supermarket groceries, drinks & household goods' },
      { name: 'A&A Supermarket (Barnawa)', type: 'supermarket', city: 'Barnawa, Kaduna', popularFor: 'Groceries, dairy, bakery & provisions' },
      { name: 'Next Cash and Carry / Local Marts (Kaduna)', type: 'supermarket', city: 'Kaduna', popularFor: 'Family groceries & packaged pantry goods' },
    ],
  },
  {
    id: 'edo',
    name: 'Edo State',
    state: 'Edo State',
    zone: 'South-South',
    tagline: 'New Benin, Oba Market & Market Square',
    priceMultiplier: 0.99,
    entries: [
      { name: 'New Benin Market', type: 'wholesale_hub', city: 'Benin City', popularFor: 'Bulk rice, garri, palm oil, meats & foodstuffs' },
      { name: 'Oba Market', type: 'food_market', city: 'Benin City', popularFor: 'Traditional soup items, produce & everyday groceries' },
      { name: 'Uselu Market', type: 'food_market', city: 'Benin City', popularFor: 'Fresh produce, plantain, yams & staples' },
      { name: 'Edaiken Market', type: 'food_market', city: 'Benin City', popularFor: 'Household foodstuffs, fish & vegetables' },
      { name: 'Santana Market', type: 'food_market', city: 'Sapele Road, Benin City', popularFor: 'Fresh meats, garri, palm oil & fruits' },
      { name: 'Auchi Main Market', type: 'food_market', city: 'Auchi', popularFor: 'Yams, cassava, grains & farm produce' },
      { name: 'Ekpoma Market', type: 'food_market', city: 'Ekpoma', popularFor: 'Everyday foodstuffs, garri & fresh vegetables' },
      { name: 'Market Square (GRA Benin)', type: 'supermarket', city: 'Benin City', popularFor: 'Fresh groceries, meats, produce & bakery' },
      { name: 'Market Square (Sapele Road)', type: 'supermarket', city: 'Benin City', popularFor: 'Supermarket staples & household items' },
      { name: 'Phill Hallmark Supermarket', type: 'supermarket', city: 'Benin City', popularFor: 'Groceries, beverages & bakery items' },
      { name: 'Jara Supermarket (Benin)', type: 'supermarket', city: 'Benin City', popularFor: 'Everyday provisions & frozen foods' },
    ],
  },
  {
    id: 'delta',
    name: 'Delta State',
    state: 'Delta State',
    zone: 'South-South',
    tagline: 'Ogbe-Ijoh, Ogbogonogo & Shoprite Asaba',
    priceMultiplier: 1.01,
    entries: [
      { name: 'Ogbe-Ijoh Market', type: 'food_market', city: 'Warri', popularFor: 'Fresh river fish, seafood, plantain & palm oil' },
      { name: 'Igbudu Market', type: 'food_market', city: 'Warri', popularFor: 'Everyday foodstuffs, meat, garri & staples' },
      { name: 'Effurun Market', type: 'food_market', city: 'Effurun, Warri', popularFor: 'Fresh produce, vegetables, grains & provisions' },
      { name: 'Ogbogonogo Market', type: 'wholesale_hub', city: 'Asaba', popularFor: 'Bulk foodstuffs, yams, palm oil & rice' },
      { name: 'Abraka Market (Asaba)', type: 'wholesale_hub', city: 'Asaba', popularFor: 'Northern tomatoes, onions, pepper & grains' },
      { name: 'Sapele Main Market', type: 'food_market', city: 'Sapele', popularFor: 'Fresh fish, plantain, garri & produce' },
      { name: 'Ughelli Main Market', type: 'food_market', city: 'Ughelli', popularFor: 'Palm oil, tubers, vegetables & everyday staples' },
      { name: 'Shoprite (Asaba Mall)', type: 'supermarket', city: 'Asaba', popularFor: 'Supermarket groceries, bakery & cold cuts' },
      { name: 'Shoprite (Delta Mall, Effurun)', type: 'supermarket', city: 'Warri', popularFor: 'Groceries, dairy, produce & provisions' },
      { name: 'Market Square (Asaba)', type: 'supermarket', city: 'Asaba', popularFor: 'Fresh foods, meats & family groceries' },
      { name: 'Market Square (Warri)', type: 'supermarket', city: 'Warri', popularFor: 'Supermarket groceries & fresh bakery' },
      { name: 'Roban Stores (Asaba)', type: 'supermarket', city: 'Asaba', popularFor: 'Everyday groceries & household provisions' },
    ],
  },
  {
    id: 'abia',
    name: 'Abia State',
    state: 'Abia State',
    zone: 'South-East',
    tagline: 'Ariaria, Ahia Ohuru, Ubani & Market Square',
    priceMultiplier: 0.97,
    entries: [
      { name: 'Ahia Ohuru (New Market, Aba)', type: 'wholesale_hub', city: 'Aba', popularFor: 'Wholesale rice, beans, palm oil, crayfish & yam' },
      { name: 'Cemetery Market (Eziukwu, Aba)', type: 'food_market', city: 'Aba', popularFor: 'Bulk provisions, foodstuffs & soup ingredients' },
      { name: 'Ariaria International Market', type: 'wholesale_hub', city: 'Aba', popularFor: 'General trade, provisions & household items' },
      { name: 'Ubani Ibeku Modern Market', type: 'food_market', city: 'Umuahia', popularFor: 'Fresh produce, palm oil, yams & staples' },
      { name: 'Ndoro Market', type: 'food_market', city: 'Ikwuano', popularFor: 'Farm-fresh garri, cassava, plantain & fruits' },
      { name: 'Market Square (Aba)', type: 'supermarket', city: 'Aba', popularFor: 'Groceries, meats, fresh produce & bakery' },
      { name: 'Market Square (Umuahia)', type: 'supermarket', city: 'Umuahia', popularFor: 'Everyday supermarket groceries & toiletries' },
      { name: 'De Choice Supermarket (Umuahia)', type: 'supermarket', city: 'Umuahia', popularFor: 'Provisions, snacks & pantry essentials' },
    ],
  },
  {
    id: 'imo',
    name: 'Imo State',
    state: 'Imo State',
    zone: 'South-East',
    tagline: 'Eke Ukwu, Relief Market & Market Square Owerri',
    priceMultiplier: 0.98,
    entries: [
      { name: 'Relief Market (Owerri)', type: 'wholesale_hub', city: 'Owerri', popularFor: 'Wholesale foodstuffs, palm oil, rice & vegetables' },
      { name: 'Ekeonunwa Market', type: 'food_market', city: 'Owerri', popularFor: 'Everyday groceries, soup items & meats' },
      { name: 'Naze Industrial & Food Market', type: 'food_market', city: 'Owerri', popularFor: 'Bulk staples, yam & household essentials' },
      { name: 'Orie Amaraku Market', type: 'food_market', city: 'Isiala Mbano', popularFor: 'Fresh farm produce, palm oil & tubers' },
      { name: 'Nkwo Orji Market', type: 'food_market', city: 'Owerri North', popularFor: 'Daily produce, vegetables & garri' },
      { name: 'Orlu International Market', type: 'food_market', city: 'Orlu', popularFor: 'Foodstuffs, grains & farm produce' },
      { name: 'Market Square (Owerri)', type: 'supermarket', city: 'Owerri', popularFor: 'Fresh produce, meats, bakery & groceries' },
      { name: 'Shoprite (Owerri Mall)', type: 'supermarket', city: 'Owerri', popularFor: 'Supermarket groceries & household provisions' },
      { name: 'Everyday Supermarket (Owerri)', type: 'supermarket', city: 'Owerri', popularFor: 'Groceries, drinks & family essentials' },
    ],
  },
  {
    id: 'kwara',
    name: 'Kwara State',
    state: 'Kwara State',
    zone: 'North-Central',
    tagline: 'Oja Oba, Ipata, Mandate & Shoprite Ilorin',
    priceMultiplier: 0.93,
    entries: [
      { name: 'Oja Oba Market (Ilorin)', type: 'food_market', city: 'Ilorin', popularFor: 'Everyday foodstuffs, yam flour, spices & meats' },
      { name: 'Mandate Ultra Modern Market', type: 'wholesale_hub', city: 'Ilorin', popularFor: 'Wholesale grains, tomatoes, yams & provisions' },
      { name: 'Ipata Market', type: 'food_market', city: 'Ilorin', popularFor: 'Fresh vegetables, fruits, beef & staples' },
      { name: 'Oja Tuntun (New Market)', type: 'food_market', city: 'Ilorin', popularFor: 'Garri, beans, rice & household items' },
      { name: 'Ganmo Market', type: 'food_market', city: 'Ifelodun', popularFor: 'Farm produce, yam, palm oil & grains' },
      { name: 'Shoprite (Palms Mall, Ilorin)', type: 'supermarket', city: 'Ilorin', popularFor: 'Supermarket groceries, bakery & dairy' },
      { name: 'Justrite Superstore (Ilorin)', type: 'supermarket', city: 'Ilorin', popularFor: 'Affordable family groceries & pantry staples' },
      { name: 'Ace Supermarket (Ilorin)', type: 'supermarket', city: 'Ilorin', popularFor: 'Groceries, drinks & daily essentials' },
    ],
  },
  {
    id: 'osun',
    name: 'Osun State',
    state: 'Osun State',
    zone: 'South-West',
    tagline: 'Oja Oba, Igbona, Sabo Ife & Supermarkets',
    priceMultiplier: 0.93,
    entries: [
      { name: 'Oja Oba Market (Osogbo)', type: 'food_market', city: 'Osogbo', popularFor: 'Fresh foodstuffs, yam, palm oil & soup items' },
      { name: 'Igbona Market (Oluode)', type: 'wholesale_hub', city: 'Osogbo', popularFor: 'Wholesale rice, beans, tomatoes & staples' },
      { name: 'Odo-Ori Market (Iwo)', type: 'food_market', city: 'Iwo', popularFor: 'Farm produce, cassava, maize & fruits' },
      { name: 'Oja Tuntun (Ile-Ife)', type: 'food_market', city: 'Ile-Ife', popularFor: 'Everyday groceries, fresh meats & produce' },
      { name: 'Atakumosa Market (Ilesa)', type: 'food_market', city: 'Ilesa', popularFor: 'Yams, plantain, cocoa-belt produce & staples' },
      { name: 'Ace Supermarket (Osogbo)', type: 'supermarket', city: 'Osogbo', popularFor: 'Groceries, bakery, beverages & household items' },
      { name: 'Justrite Superstore (Osogbo)', type: 'supermarket', city: 'Osogbo', popularFor: 'Provisions, pantry staples & frozen foods' },
    ],
  },
  {
    id: 'ondo',
    name: 'Ondo State',
    state: 'Ondo State',
    zone: 'South-West',
    tagline: 'Oja Oba Akure, Shasha & Shoprite Akure',
    priceMultiplier: 0.94,
    entries: [
      { name: 'Oja Oba (Erekesan Market)', type: 'food_market', city: 'Akure', popularFor: 'Everyday foodstuffs, yam, garri & palm oil' },
      { name: 'Shasha Market (Akure)', type: 'wholesale_hub', city: 'Akure', popularFor: 'Wholesale tomatoes, onions, pepper & grains' },
      { name: 'Isinkan Market', type: 'food_market', city: 'Akure', popularFor: 'Fresh meats, vegetables & daily groceries' },
      { name: 'Oja Moferere (Ondo Town)', type: 'food_market', city: 'Ondo Town', popularFor: 'Plantain, yam, garri & farm produce' },
      { name: 'Oja Oba (Owo)', type: 'food_market', city: 'Owo', popularFor: 'Yams, cassava, palm oil & soup staples' },
      { name: 'Shoprite (Akure Mall)', type: 'supermarket', city: 'Akure', popularFor: 'Supermarket groceries, bakery & cold cuts' },
      { name: 'NAO Supermarket (Akure)', type: 'supermarket', city: 'Akure', popularFor: 'Groceries, drinks & everyday provisions' },
    ],
  },
  {
    id: 'ekiti',
    name: 'Ekiti State',
    state: 'Ekiti State',
    zone: 'South-West',
    tagline: 'Oja Oba Ado-Ekiti, Bisi Market & Marts',
    priceMultiplier: 0.93,
    entries: [
      { name: 'Oja Oba (King’s Market, Ado-Ekiti)', type: 'food_market', city: 'Ado-Ekiti', popularFor: 'Pounded yam tubers, palm oil, garri & produce' },
      { name: 'Oja Bisi Market', type: 'food_market', city: 'Ado-Ekiti', popularFor: 'Everyday foodstuffs, meats & vegetables' },
      { name: 'Shasha Market (Ado-Ekiti)', type: 'wholesale_hub', city: 'Ado-Ekiti', popularFor: 'Bulk tomatoes, onions, pepper & grains' },
      { name: 'Ikole Main Market', type: 'food_market', city: 'Ikole-Ekiti', popularFor: 'Farm produce, yam, plantain & rice' },
      { name: 'Tisco Supermarket (Ado-Ekiti)', type: 'supermarket', city: 'Ado-Ekiti', popularFor: 'Groceries, provisions & household items' },
      { name: 'Fayose Market Plaza & Stores', type: 'supermarket', city: 'Ado-Ekiti', popularFor: 'Packaged groceries & daily essentials' },
    ],
  },
  {
    id: 'akwaibom',
    name: 'Akwa Ibom State',
    state: 'Akwa Ibom State',
    zone: 'South-South',
    tagline: 'Itam, Akpan Andem, Ibom Plaza & Market Square',
    priceMultiplier: 0.99,
    entries: [
      { name: 'Itam Market', type: 'wholesale_hub', city: 'Uyo', popularFor: 'Wholesale crayfish, palm oil, afang, garri & staples' },
      { name: 'Akpan Andem Market', type: 'food_market', city: 'Uyo', popularFor: 'Fresh seafood, vegetables, meats & everyday groceries' },
      { name: 'Urua Ekpa Market', type: 'food_market', city: 'Uyo', popularFor: 'Fresh produce, tubers & local soup ingredients' },
      { name: 'Eket Main Market', type: 'food_market', city: 'Eket', popularFor: 'Fresh fish, plantain, palm oil & foodstuffs' },
      { name: 'Ikot Ekpene Main Market', type: 'food_market', city: 'Ikot Ekpene', popularFor: 'Palm oil, yam, garri & farm produce' },
      { name: 'Market Square (Uyo)', type: 'supermarket', city: 'Uyo', popularFor: 'Fresh produce, meats, bakery & groceries' },
      { name: 'De Choice Mall & Supermarket (Uyo)', type: 'supermarket', city: 'Uyo', popularFor: 'Groceries, drinks & household supplies' },
      { name: 'Market Square (Eket)', type: 'supermarket', city: 'Eket', popularFor: 'Everyday supermarket groceries & staples' },
    ],
  },
  {
    id: 'crossriver',
    name: 'Cross River State',
    state: 'Cross River State',
    zone: 'South-South',
    tagline: 'Watt Market, Marian, Ikom & SPAR Calabar',
    priceMultiplier: 0.99,
    entries: [
      { name: 'Watt Market', type: 'wholesale_hub', city: 'Calabar', popularFor: 'Bulk foodstuffs, crayfish, periwinkle, palm oil & rice' },
      { name: 'Marian Market', type: 'food_market', city: 'Calabar', popularFor: 'Fresh vegetables, fruits, meat & everyday groceries' },
      { name: 'Ikot Ishie Market', type: 'food_market', city: 'Calabar', popularFor: 'Garri, plantain, fish & daily foodstuffs' },
      { name: 'Bogobiri Food Market', type: 'food_market', city: 'Calabar', popularFor: 'Tomatoes, onions, suya & northern grains' },
      { name: 'Ikom Main Market', type: 'food_market', city: 'Ikom', popularFor: 'Plantain, cocoa-belt produce, yam & palm oil' },
      { name: 'SPAR Market (Calabar Mall)', type: 'supermarket', city: 'Calabar', popularFor: 'Supermarket groceries, bakery & cold cuts' },
      { name: 'Market Square (Calabar)', type: 'supermarket', city: 'Calabar', popularFor: 'Fresh foods, meats & family groceries' },
    ],
  },
  {
    id: 'plateau',
    name: 'Plateau State',
    state: 'Plateau State',
    zone: 'North-Central',
    tagline: 'Terminus, Building Materials, Farin Gada & Marts',
    priceMultiplier: 0.91,
    entries: [
      { name: 'Farin Gada Vegetable Market', type: 'wholesale_hub', city: 'Jos', popularFor: 'Fresh tomatoes, Irish potatoes, carrots, cabbage & pepper' },
      { name: 'Terminus Market (Jos Main)', type: 'food_market', city: 'Jos', popularFor: 'Everyday groceries, spices, grains & provisions' },
      { name: 'Bukuru Market', type: 'food_market', city: 'Jos South', popularFor: 'Irish potatoes, maize, yams & fresh produce' },
      { name: 'Building Materials / Sabon Gari Food Market', type: 'food_market', city: 'Jos', popularFor: 'Bulk grains, beans, rice & household items' },
      { name: 'Mangu Market', type: 'wholesale_hub', city: 'Mangu', popularFor: 'Wholesale maize, Irish potatoes & vegetables' },
      { name: 'Grand Square / Supermarkets (Rayfield, Jos)', type: 'supermarket', city: 'Jos', popularFor: 'Groceries, bakery, dairy & provisions' },
      { name: 'Chagoury / Rwang Pam Supermarkets (Jos)', type: 'supermarket', city: 'Jos', popularFor: 'Family supermarket staples & household goods' },
    ],
  },
  {
    id: 'benue',
    name: 'Benue State',
    state: 'Benue State',
    zone: 'North-Central',
    tagline: 'Wurukum, Modern Market, Zaki Biam Yams',
    priceMultiplier: 0.89,
    entries: [
      { name: 'Zaki Biam International Yam Market', type: 'wholesale_hub', city: 'Zaki Biam', popularFor: 'Nigeria’s largest wholesale yam & tuber market' },
      { name: 'Wurukum Market', type: 'food_market', city: 'Makurdi', popularFor: 'Fresh yams, oranges, mangoes, tomatoes & grains' },
      { name: 'Makurdi Modern Market', type: 'food_market', city: 'Makurdi', popularFor: 'Rice, beans, soyabeans, garri & provisions' },
      { name: 'North Bank Market', type: 'food_market', city: 'Makurdi', popularFor: 'Fresh river fish, grains & vegetables' },
      { name: 'Otukpo Main Market', type: 'food_market', city: 'Otukpo', popularFor: 'Yams, palm oil, beniseed & foodstuffs' },
      { name: 'Gboko Main Market', type: 'food_market', city: 'Gboko', popularFor: 'Farm produce, yams, citrus fruits & grains' },
      { name: 'Hallydays Supermarket (Makurdi)', type: 'supermarket', city: 'Makurdi', popularFor: 'Groceries, drinks & everyday provisions' },
    ],
  },
  {
    id: 'niger',
    name: 'Niger State',
    state: 'Niger State',
    zone: 'North-Central',
    tagline: 'Kure Ultra Modern, Suleja & Bida Markets',
    priceMultiplier: 0.91,
    entries: [
      { name: 'Kure Ultra Modern Market', type: 'wholesale_hub', city: 'Minna', popularFor: 'Grains, yams, groundnuts, meat & foodstuffs' },
      { name: 'Gwari Market (Minna)', type: 'food_market', city: 'Minna', popularFor: 'Fresh farm produce, tubers & vegetables' },
      { name: 'Suleja Main Market', type: 'food_market', city: 'Suleja', popularFor: 'Everyday groceries, tomatoes, grains & spices' },
      { name: 'Bida Modern Market', type: 'food_market', city: 'Bida', popularFor: 'Local rice, shea butter, grains & produce' },
      { name: 'Kontagora Main Market', type: 'food_market', city: 'Kontagora', popularFor: 'Maize, beans, millet & livestock' },
      { name: 'El-Amin / Minna Supermarkets', type: 'supermarket', city: 'Minna', popularFor: 'Groceries, beverages & packaged staples' },
    ],
  },
  {
    id: 'kogi',
    name: 'Kogi State',
    state: 'Kogi State',
    zone: 'North-Central',
    tagline: 'Lokoja International, Adankolo & Okene',
    priceMultiplier: 0.92,
    entries: [
      { name: 'Lokoja International Market', type: 'wholesale_hub', city: 'Lokoja', popularFor: 'Wholesale yams, cassava, rice, fish & grains' },
      { name: 'Old Market (Lokoja)', type: 'food_market', city: 'Lokoja', popularFor: 'Fresh river fish, vegetables & everyday staples' },
      { name: 'Ganaja Village Market', type: 'food_market', city: 'Lokoja', popularFor: 'Daily foodstuffs, garri & palm oil' },
      { name: 'Okene Central Market', type: 'food_market', city: 'Okene', popularFor: 'Yams, beans, palm oil & soup ingredients' },
      { name: 'Anyigba Market', type: 'food_market', city: 'Anyigba', popularFor: 'Cashew, palm oil, garri & farm produce' },
      { name: 'J-Plus Supermarket (Lokoja)', type: 'supermarket', city: 'Lokoja', popularFor: 'Groceries, drinks & family essentials' },
    ],
  },
  {
    id: 'nasarawa',
    name: 'Nasarawa State',
    state: 'Nasarawa State',
    zone: 'North-Central',
    tagline: 'Mararaba, Lafia Modern & Keffi Markets',
    priceMultiplier: 0.93,
    entries: [
      { name: 'Mararaba Market', type: 'food_market', city: 'Karu / Mararaba', popularFor: 'Affordable foodstuffs, yams, grains & meat' },
      { name: 'Lafia Modern Market', type: 'wholesale_hub', city: 'Lafia', popularFor: 'Wholesale yams, sesame, rice & beans' },
      { name: 'Keffi Main Market', type: 'food_market', city: 'Keffi', popularFor: 'Fresh produce, maize, yams & staples' },
      { name: 'Masaka Market', type: 'food_market', city: 'Karu', popularFor: 'Everyday groceries, tomatoes & vegetables' },
      { name: 'Akwanga Market', type: 'food_market', city: 'Akwanga', popularFor: 'Farm produce, yams & fruits' },
      { name: 'Abuja-Karu Superstores (Mararaba)', type: 'supermarket', city: 'Mararaba', popularFor: 'Provisions, groceries & household items' },
    ],
  },
  {
    id: 'ebonyi',
    name: 'Ebonyi State',
    state: 'Ebonyi State',
    zone: 'South-East',
    tagline: 'Abakaliki Rice Mill, Margaret Umahi Market',
    priceMultiplier: 0.93,
    entries: [
      { name: 'Abakaliki Rice Mill Market', type: 'wholesale_hub', city: 'Abakaliki', popularFor: 'Wholesale Abakaliki local rice & grains' },
      { name: 'Margaret Umahi International Market', type: 'food_market', city: 'Abakaliki', popularFor: 'Foodstuffs, yams, palm oil & provisions' },
      { name: 'Kpirikpiri Market', type: 'food_market', city: 'Abakaliki', popularFor: 'Fresh vegetables, meats & everyday groceries' },
      { name: 'Eke Market (Afikpo)', type: 'food_market', city: 'Afikpo', popularFor: 'Yams, cassava, palm oil & river fish' },
      { name: 'Roban Stores (Abakaliki)', type: 'supermarket', city: 'Abakaliki', popularFor: 'Supermarket groceries, bakery & toiletries' },
    ],
  },
  {
    id: 'bayelsa',
    name: 'Bayelsa State',
    state: 'Bayelsa State',
    zone: 'South-South',
    tagline: 'Swali Market, Kpansia & Market Square Yenagoa',
    priceMultiplier: 1.05,
    entries: [
      { name: 'Swali Ultra Modern Market', type: 'wholesale_hub', city: 'Yenagoa', popularFor: 'Fresh fish, plantain, garri, palm oil & bulk staples' },
      { name: 'Kpansia Market', type: 'food_market', city: 'Yenagoa', popularFor: 'Everyday groceries, vegetables & seafood' },
      { name: 'Opolo Market', type: 'food_market', city: 'Yenagoa', popularFor: 'Foodstuffs, meat, rice & daily essentials' },
      { name: 'Tombia Market', type: 'food_market', city: 'Yenagoa', popularFor: 'Fresh produce, plantain & soup ingredients' },
      { name: 'Market Square (Yenagoa)', type: 'supermarket', city: 'Yenagoa', popularFor: 'Supermarket groceries, fresh meats & bakery' },
    ],
  },
  {
    id: 'borno',
    name: 'Borno State',
    state: 'Borno State',
    zone: 'North-East',
    tagline: 'Monday Market, Gamboru & Baga Road Fish',
    priceMultiplier: 0.94,
    entries: [
      { name: 'Maiduguri Monday Market', type: 'wholesale_hub', city: 'Maiduguri', popularFor: 'Bulk grains, beans, spices & general provisions' },
      { name: 'Baga Road Fish Market', type: 'wholesale_hub', city: 'Maiduguri', popularFor: 'Wholesale smoked & dried Lake Chad fish' },
      { name: 'Gamboru Vegetable Market', type: 'food_market', city: 'Maiduguri', popularFor: 'Fresh tomatoes, onions, pepper & fruits' },
      { name: 'Custom Market (Maiduguri)', type: 'food_market', city: 'Maiduguri', popularFor: 'Everyday foodstuffs, grains & meat' },
      { name: 'Biu Main Market', type: 'food_market', city: 'Biu', popularFor: 'Maize, beans, groundnuts & produce' },
      { name: 'Maiduguri City Supermarkets (GRA)', type: 'supermarket', city: 'Maiduguri', popularFor: 'Packaged groceries, dairy & household items' },
    ],
  },
  {
    id: 'adamawa',
    name: 'Adamawa State',
    state: 'Adamawa State',
    zone: 'North-East',
    tagline: 'Jimeta Modern Market, Yola & Mubi',
    priceMultiplier: 0.92,
    entries: [
      { name: 'Jimeta Modern Market', type: 'wholesale_hub', city: 'Yola / Jimeta', popularFor: 'Grains, rice, groundnuts, meat & provisions' },
      { name: 'Yola Town Market', type: 'food_market', city: 'Yola', popularFor: 'Fresh produce, vegetables & everyday staples' },
      { name: 'Mubi International Cattle & Grain Market', type: 'wholesale_hub', city: 'Mubi', popularFor: 'Livestock, maize, beans & bulk foodstuffs' },
      { name: 'Numan Market', type: 'food_market', city: 'Numan', popularFor: 'Fresh fish, rice, grains & vegetables' },
      { name: 'AUN / Jimeta Superstores', type: 'supermarket', city: 'Yola', popularFor: 'Supermarket groceries & pantry supplies' },
    ],
  },
  {
    id: 'bauchi',
    name: 'Bauchi State',
    state: 'Bauchi State',
    zone: 'North-East',
    tagline: 'Wunti, Muda Lawal & Azare Markets',
    priceMultiplier: 0.90,
    entries: [
      { name: 'Muda Lawal Market', type: 'wholesale_hub', city: 'Bauchi', popularFor: 'Wholesale maize, millet, beans, onions & tomatoes' },
      { name: 'Wunti Market', type: 'food_market', city: 'Bauchi', popularFor: 'Everyday groceries, fresh meats & provisions' },
      { name: 'Bauchi Central Market', type: 'food_market', city: 'Bauchi', popularFor: 'Spices, grains, rice & household items' },
      { name: 'Azare Central Market', type: 'food_market', city: 'Azare', popularFor: 'Grains, groundnuts & livestock' },
      { name: 'Zaranda / Bauchi Supermarkets', type: 'supermarket', city: 'Bauchi', popularFor: 'Groceries, drinks & daily essentials' },
    ],
  },
  {
    id: 'gombe',
    name: 'Gombe State',
    state: 'Gombe State',
    zone: 'North-East',
    tagline: 'Gombe Main Market, Tashan Dukku & Dadin Kowa',
    priceMultiplier: 0.90,
    entries: [
      { name: 'Gombe Main Market', type: 'wholesale_hub', city: 'Gombe', popularFor: 'Grains, beans, tomatoes, spices & staples' },
      { name: 'Tashan Dukku Market', type: 'food_market', city: 'Gombe', popularFor: 'Fresh produce, vegetables & daily foodstuffs' },
      { name: 'Dadin Kowa Tomato Market', type: 'wholesale_hub', city: 'Yamaltu/Deba', popularFor: 'Wholesale fresh tomatoes, pepper & vegetables' },
      { name: 'Kumo Market', type: 'food_market', city: 'Kumo', popularFor: 'Maize, groundnuts, beans & farm produce' },
      { name: 'Gombe Central Supermarkets', type: 'supermarket', city: 'Gombe', popularFor: 'Supermarket groceries & provisions' },
    ],
  },
  {
    id: 'sokoto',
    name: 'Sokoto State',
    state: 'Sokoto State',
    zone: 'North-West',
    tagline: 'Sokoto Central, Kara & Illela Markets',
    priceMultiplier: 0.91,
    entries: [
      { name: 'Sokoto Central Market', type: 'wholesale_hub', city: 'Sokoto', popularFor: 'Bulk onions, garlic, grains, beans & spices' },
      { name: 'Kara Market (Sokoto)', type: 'wholesale_hub', city: 'Sokoto', popularFor: 'Livestock, meat & wholesale northern produce' },
      { name: 'Old Market (Sokoto)', type: 'food_market', city: 'Sokoto', popularFor: 'Everyday foodstuffs, vegetables & spices' },
      { name: 'Illela Border Market', type: 'wholesale_hub', city: 'Illela', popularFor: 'Grains, onions, beans & livestock' },
      { name: 'Sokoto Superstores (Gawon Nama)', type: 'supermarket', city: 'Sokoto', popularFor: 'Groceries, beverages & pantry staples' },
    ],
  },
  {
    id: 'katsina',
    name: 'Katsina State',
    state: 'Katsina State',
    zone: 'North-West',
    tagline: 'Katsina Central, Dandume & Funtua Grains',
    priceMultiplier: 0.89,
    entries: [
      { name: 'Katsina Central Market', type: 'wholesale_hub', city: 'Katsina', popularFor: 'Grains, millet, maize, spices & provisions' },
      { name: 'Dandume Grain Market', type: 'wholesale_hub', city: 'Dandume', popularFor: 'Wholesale maize, soya beans & sorghum' },
      { name: 'Funtua Central Market', type: 'food_market', city: 'Funtua', popularFor: 'Bulk grains, tomatoes, pepper & cotton-belt produce' },
      { name: 'Daura Central Market', type: 'food_market', city: 'Daura', popularFor: 'Millet, groundnuts, meat & foodstuffs' },
      { name: 'Katsina GRA Supermarkets', type: 'supermarket', city: 'Katsina', popularFor: 'Groceries, dairy & household supplies' },
    ],
  },
  {
    id: 'kebbi',
    name: 'Kebbi State',
    state: 'Kebbi State',
    zone: 'North-West',
    tagline: 'Birnin Kebbi Central, Argungu & Jega',
    priceMultiplier: 0.89,
    entries: [
      { name: 'Birnin Kebbi Central Market', type: 'wholesale_hub', city: 'Birnin Kebbi', popularFor: 'Wholesale Kebbi rice, onions, grains & staples' },
      { name: 'Jega Market', type: 'wholesale_hub', city: 'Jega', popularFor: 'Bulk grains, beans, millet & livestock' },
      { name: 'Argungu Fish & Food Market', type: 'food_market', city: 'Argungu', popularFor: 'Fresh & smoked fish, rice & vegetables' },
      { name: 'Yauri Market', type: 'food_market', city: 'Yauri', popularFor: 'Onions, rice, fish & everyday foodstuffs' },
    ],
  },
  {
    id: 'zamfara',
    name: 'Zamfara State',
    state: 'Zamfara State',
    zone: 'North-West',
    tagline: 'Gusau Central, Talata Mafara & Kaura Namoda',
    priceMultiplier: 0.90,
    entries: [
      { name: 'Gusau Central Market', type: 'wholesale_hub', city: 'Gusau', popularFor: 'Grains, beans, groundnuts, rice & meat' },
      { name: 'Tudun Wada Market (Gusau)', type: 'food_market', city: 'Gusau', popularFor: 'Fresh vegetables, tomatoes & daily groceries' },
      { name: 'Talata Mafara Market', type: 'food_market', city: 'Talata Mafara', popularFor: 'Rice, onions, grains & farm produce' },
      { name: 'Kaura Namoda Market', type: 'food_market', city: 'Kaura Namoda', popularFor: 'Millet, maize, beans & provisions' },
    ],
  },
  {
    id: 'jigawa',
    name: 'Jigawa State',
    state: 'Jigawa State',
    zone: 'North-West',
    tagline: 'Gujungu, Dutse, Hadejia & Maigatari',
    priceMultiplier: 0.88,
    entries: [
      { name: 'Gujungu Grain & Livestock Market', type: 'wholesale_hub', city: 'Taura', popularFor: 'Wholesale sesame, beans, millet & livestock' },
      { name: 'Dutse Ultra Modern Market', type: 'food_market', city: 'Dutse', popularFor: 'Everyday foodstuffs, grains & fresh meat' },
      { name: 'Hadejia Rice & Food Market', type: 'wholesale_hub', city: 'Hadejia', popularFor: 'Local paddy rice, wheat, fish & vegetables' },
      { name: 'Gumel Market', type: 'food_market', city: 'Gumel', popularFor: 'Groundnuts, grains, onions & staples' },
    ],
  },
  {
    id: 'yobe',
    name: 'Yobe State',
    state: 'Yobe State',
    zone: 'North-East',
    tagline: 'Damaturu, Potiskum & Nguru Markets',
    priceMultiplier: 0.91,
    entries: [
      { name: 'Potiskum Market', type: 'wholesale_hub', city: 'Potiskum', popularFor: 'Livestock, sesame, beans, millet & bulk grains' },
      { name: 'Damaturu Sunday & Modern Market', type: 'food_market', city: 'Damaturu', popularFor: 'Everyday foodstuffs, meat & vegetables' },
      { name: 'Gashua Market', type: 'food_market', city: 'Gashua', popularFor: 'Fresh river fish, grains, onions & produce' },
      { name: 'Nguru Market', type: 'food_market', city: 'Nguru', popularFor: 'Grains, dried fish & farm produce' },
    ],
  },
  {
    id: 'taraba',
    name: 'Taraba State',
    state: 'Taraba State',
    zone: 'North-East',
    tagline: 'Jalingo Main, Wukari Yam & Takum Markets',
    priceMultiplier: 0.90,
    entries: [
      { name: 'Jalingo Main Market', type: 'food_market', city: 'Jalingo', popularFor: 'Grains, yams, rice, meat & fresh vegetables' },
      { name: 'Wukari Yam & Food Market', type: 'wholesale_hub', city: 'Wukari', popularFor: 'Wholesale yams, maize, cassava & palm oil' },
      { name: 'Mutum Biyu Market', type: 'wholesale_hub', city: 'Gassol', popularFor: 'Bulk rice, maize, groundnuts & yams' },
      { name: 'Takum Main Market', type: 'food_market', city: 'Takum', popularFor: 'Yams, fruits, palm oil & farm produce' },
    ],
  },
];

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ALL_NIGERIAN_MARKETS: NigerianMarketEntry[] = STATE_MARKET_SEEDS.flatMap(
  (seed) =>
    seed.entries.map((entry, idx) => ({
      id: `${seed.id}-${toSlug(entry.name)}-${idx}`,
      name: entry.name,
      type: entry.type,
      stateId: seed.id,
      stateName: seed.name,
      city: entry.city,
      zone: seed.zone,
      popularFor: entry.popularFor,
    }))
);

export const ALL_NIGERIAN_REGIONS: RegionProfile[] = STATE_MARKET_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  state: seed.state,
  tagline: seed.tagline,
  markets: seed.entries.map((e) => e.name),
  priceMultiplier: seed.priceMultiplier,
}));

export const MARKET_TYPE_LABELS: Record<
  MarketVenueType,
  { label: string; shortLabel: string; icon: string; badgeClass: string }
> = {
  food_market: {
    label: 'Food Market',
    shortLabel: 'Food Market',
    icon: 'storefront',
    badgeClass: 'bg-[#eef6fb] text-[#00567c]',
  },
  supermarket: {
    label: 'Supermarket',
    shortLabel: 'Supermarket',
    icon: 'shopping_cart',
    badgeClass: 'bg-[#ecfdf5] text-[#15803d]',
  },
  wholesale_hub: {
    label: 'Wholesale Hub',
    shortLabel: 'Wholesale',
    icon: 'warehouse',
    badgeClass: 'bg-amber-50 text-amber-800',
  },
};

export function getMarketsByState(stateId: string): NigerianMarketEntry[] {
  return ALL_NIGERIAN_MARKETS.filter((m) => m.stateId === stateId);
}

export function findMarketEntryByName(name: string): NigerianMarketEntry | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  return (
    ALL_NIGERIAN_MARKETS.find((m) => m.name.toLowerCase() === normalized) ||
    ALL_NIGERIAN_MARKETS.find((m) => m.name.toLowerCase().includes(normalized))
  );
}

export function searchNigerianMarkets(
  query: string,
  options?: {
    stateId?: string;
    typeFilter?: MarketVenueType | 'all';
    limit?: number;
  }
): NigerianMarketEntry[] {
  const q = query.trim().toLowerCase();
  const stateId = options?.stateId;
  const typeFilter = options?.typeFilter ?? 'all';
  const limit = options?.limit ?? 60;

  let list = ALL_NIGERIAN_MARKETS;

  if (typeFilter !== 'all') {
    list = list.filter((m) => m.type === typeFilter);
  }

  if (q) {
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.stateName.toLowerCase().includes(q) ||
        m.popularFor.toLowerCase().includes(q)
    );
  }

  // Prioritize active state markets first, then exact/prefix matches
  const sorted = [...list].sort((a, b) => {
    const aInState = stateId && a.stateId === stateId ? 1 : 0;
    const bInState = stateId && b.stateId === stateId ? 1 : 0;
    if (aInState !== bInState) return bInState - aInState;

    if (q) {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 1 : 0;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
    }

    return a.name.localeCompare(b.name);
  });

  return sorted.slice(0, limit);
}
