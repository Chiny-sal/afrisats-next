export const MAX_INVOICE_SATS = 5000;
export const INVOICE_EXPIRY_SECONDS = 600;
export const RATES_CACHE_SECONDS = 60;

export const ITEM_ID_REGEX = /^item-[a-z0-9-]+$/i;
export const ORDER_ID_REGEX = /^order-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const SELLER_ID_REGEX = /^seller-[a-z0-9-]+$/i;

export const DIGITAL_CATEGORIES = [
  "Design",
  "Development",
  "Audio",
  "Translation",
  "Writing",
  "Marketing",
];

export const PHYSICAL_CATEGORIES = [
  "Fashion",
  "Food & Beverage",
  "Art & Crafts",
  "Home Goods",
];

export const ALL_CATEGORIES = [...DIGITAL_CATEGORIES, ...PHYSICAL_CATEGORIES];

export const COUNTRIES = [
  "Ethiopia",
  "Kenya",
  "Nigeria",
  "Ghana",
  "South Africa",
  "Egypt",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Senegal",
];

export const COUNTRY_FLAGS = {
  Ethiopia: "🇪🇹",
  Kenya: "🇰🇪",
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  "South Africa": "🇿🇦",
  Egypt: "🇪🇬",
  Tanzania: "🇹🇿",
  Uganda: "🇺🇬",
  Rwanda: "🇷🇼",
  Senegal: "🇸🇳",
};

export const FIAT_CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "ETB", name: "Ethiopian Birr", flag: "🇪🇹" },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿" },
  { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬" },
  { code: "RWF", name: "Rwandan Franc", flag: "🇷🇼" },
  { code: "XOF", name: "West African CFA", flag: "🇸🇳" },
];

export const FALLBACK_FIAT_RATES = {
  USD: 1,
  NGN: 1550,
  KES: 129,
  GHS: 15.8,
  ZAR: 18.5,
  ETB: 128.5,
  EGP: 50.5,
  TZS: 2650,
  UGX: 3750,
  RWF: 1380,
  XOF: 610,
};

export const FALLBACK_BTC_USD = 65000;

export const SEED_SELLERS = [
  { token: "seed-token-abebe-001", name: "Abebe Coffee Co." },
  { token: "seed-token-mwangi-002", name: "Mwangi Media" },
  { token: "seed-token-beats-003", name: "BeatForge NG" },
  { token: "seed-token-adwoa-004", name: "Adwoa Designs" },
];

export function isValidCategoryForType(category, productType) {
  if (productType === "digital") return DIGITAL_CATEGORIES.includes(category);
  if (productType === "physical") return PHYSICAL_CATEGORIES.includes(category);
  return false;
}
