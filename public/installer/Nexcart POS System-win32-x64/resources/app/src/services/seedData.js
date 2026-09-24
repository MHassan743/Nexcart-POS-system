// Seed data for multi-business presets and initial system setup

export const BUSINESS_TYPES = {
  PHARMACY: {
    id: 'pharmacy',
    name: 'Pharmacy & Medical Store',
    icon: 'Pill',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Medicines & Tablets', 'Syrups & Injections', 'Surgical & First Aid', 'Baby Care & Supplements', 'Personal Care']
  },
  GROCERY: {
    id: 'grocery',
    name: 'Grocery & Supermarket',
    icon: 'ShoppingCart',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Dairy & Eggs', 'Bakery & Bread', 'Fresh Produce', 'Beverages', 'Pantry & Grains', 'Snacks & Sweets']
  },
  CROCKERY: {
    id: 'crockery',
    name: 'Crockery & Home Goods',
    icon: 'Coffee',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Plates & Dishes', 'Drinkware & Mugs', 'Bowls & Sets', 'Vases & Decor', 'Cutlery & Utensils', 'Tea & Coffee Sets']
  },
  ELECTRONICS: {
    id: 'electronics',
    name: 'Electronics & Mobile Store',
    icon: 'Smartphone',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Mobiles & Accessories', 'Audio & Headphones', 'Smartwatches', 'Computers & Peripherals', 'Chargers & Cables']
  },
  FASHION: {
    id: 'fashion',
    name: 'Fashion & Apparel',
    icon: 'Shirt',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Tops & Shirts', 'Denim & Pants', 'Outerwear & Jackets', 'Unstitched Fabric', 'Accessories & Bags']
  },
  COSMETICS: {
    id: 'cosmetics',
    name: 'Cosmetics & Beauty',
    icon: 'Sparkles',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Skincare', 'Makeup & Cosmetics', 'Haircare', 'Fragrances & Perfumes', 'Personal Hygiene']
  },
  HARDWARE: {
    id: 'hardware',
    name: 'Hardware & Building Supplies',
    icon: 'Wrench',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Hand Tools & Power Tools', 'Plumbing Goods', 'Electrical Supplies', 'Paints & Chemicals', 'Fasteners & Fixtures']
  },
  FOOTWEAR: {
    id: 'footwear',
    name: 'Footwear & Shoes Store',
    icon: 'Footprints',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Men Shoes', 'Women Shoes', 'Kids Footwear', 'Sports & Casual', 'Slippers & Sandals']
  },
  STATIONERY: {
    id: 'stationery',
    name: 'Books & Stationery Shop',
    icon: 'BookOpen',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Notebooks & Registers', 'Pens & Writing', 'School Supplies', 'Art & Craft', 'Books & Guides']
  },
  TOYS: {
    id: 'toys',
    name: 'Toys & Gift Shop',
    icon: 'Gift',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Educational Toys', 'Action Figures', 'Board Games', 'Gift Items', 'Party Supplies']
  },
  AUTOPARTS: {
    id: 'autoparts',
    name: 'Auto Parts & Bike Accessories',
    icon: 'Car',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Engine Oil & Fluids', 'Bike Accessories', 'Car Spare Parts', 'Helmets & Gear', 'Car Care']
  },
  JEWELRY: {
    id: 'jewelry',
    name: 'Jewelry & Watches Store',
    icon: 'Gem',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Rings & Earrings', 'Necklaces & Chains', 'Wrist Watches', 'Artificial Jewelry', 'Boxes & Accessories']
  },
  BAKERY: {
    id: 'bakery',
    name: 'Bakery & Confectionery',
    icon: 'Cake',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['Cakes & Pastries', 'Fresh Biscuits', 'Breads & Buns', 'Sweets & Nimko', 'Beverages']
  },
  GENERAL: {
    id: 'general',
    name: 'General Store / Retail Shop',
    icon: 'Store',
    defaultCurrency: 'PKR',
    currencySymbol: '₨',
    defaultTaxRate: 0,
    categories: ['General Goods', 'Stationery', 'Home Supplies', 'Gifts & Toys', 'Hardware']
  }
};

export const INITIAL_PRODUCTS = {
  pharmacy: [],
  grocery: [],
  crockery: [],
  electronics: [],
  fashion: [],
  cosmetics: [],
  hardware: [],
  footwear: [],
  stationery: [],
  toys: [],
  autoparts: [],
  jewelry: [],
  bakery: [],
  general: []
};

export const INITIAL_EMPLOYEES = [];

export const INITIAL_CUSTOMERS = [];

// Master Nexcart Agency Central Serverless Registry (All clients registered on Nexcart)
export const INITIAL_NEXCART_SERVERLESS_HUB = [];
