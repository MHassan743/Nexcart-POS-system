// Seed data for multi-business presets and initial system setup

export const BUSINESS_TYPES = {
  CROCKERY: {
    id: 'crockery',
    name: 'Crockery & Home Goods',
    icon: 'Coffee',
    defaultCurrency: 'GBP',
    currencySymbol: '£',
    defaultTaxRate: 20,
    categories: ['Plates & Dishes', 'Drinkware & Mugs', 'Bowls & Sets', 'Vases & Decor', 'Cutlery & Utensils', 'Tea & Coffee Sets']
  },
  GROCERY: {
    id: 'grocery',
    name: 'Grocery & Supermarket',
    icon: 'ShoppingCart',
    defaultCurrency: 'GBP',
    currencySymbol: '£',
    defaultTaxRate: 5,
    categories: ['Dairy & Eggs', 'Bakery & Bread', 'Fresh Produce', 'Beverages', 'Pantry & Grains', 'Snacks & Sweets']
  },
  ELECTRONICS: {
    id: 'electronics',
    name: 'Electronics & Gadgets',
    icon: 'Smartphone',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    defaultTaxRate: 8.5,
    categories: ['Audio & Headphones', 'Smartwatches & Wearables', 'Monitors & Displays', 'Keyboards & Accessories', 'Charging & Cables']
  },
  FASHION: {
    id: 'fashion',
    name: 'Fashion & Apparel',
    icon: 'Shirt',
    defaultCurrency: 'EUR',
    currencySymbol: '€',
    defaultTaxRate: 19,
    categories: ['Tops & Shirts', 'Denim & Pants', 'Outerwear & Jackets', 'Footwear & Sneakers', 'Accessories & Bags']
  },
  GENERAL: {
    id: 'general',
    name: 'General Store / Retail',
    icon: 'Store',
    defaultCurrency: 'GBP',
    currencySymbol: '£',
    defaultTaxRate: 20,
    categories: ['General Goods', 'Stationery', 'Home Supplies', 'Gifts & Toys', 'Hardware']
  }
};

export const INITIAL_PRODUCTS = {
  crockery: [],
  grocery: [],
  electronics: [],
  fashion: [],
  general: []
};

export const INITIAL_EMPLOYEES = [
  {
    id: 'emp-001',
    name: 'Alexander Wright',
    email: 'admin@nexcart.com',
    pin: '9999',
    role: 'OWNER',
    tillAccess: true,
    phone: '+44 7911 123456',
    status: 'ACTIVE'
  },
  {
    id: 'emp-002',
    name: 'Victoria Hughes',
    email: 'manager@nexcart.com',
    pin: '8888',
    role: 'MANAGER',
    tillAccess: true,
    phone: '+44 7911 654321',
    status: 'ACTIVE'
  },
  {
    id: 'emp-003',
    name: 'James Carter',
    email: 'j.carter@store.com',
    pin: '1234',
    role: 'CASHIER',
    tillAccess: true,
    phone: '+44 7911 888999',
    status: 'ACTIVE'
  }
];

export const INITIAL_CUSTOMERS = [];

// Master Nexcart Agency Central Serverless Registry (All clients registered on Nexcart)
export const INITIAL_NEXCART_SERVERLESS_HUB = [];
