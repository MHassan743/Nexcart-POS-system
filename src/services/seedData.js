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

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-001',
    name: 'Walk-in Customer',
    phone: 'N/A',
    email: 'walkin@store.com',
    creditBalance: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  }
];

// Master Nexcart Agency Central Serverless Registry (All clients registered on Nexcart)
export const INITIAL_NEXCART_SERVERLESS_HUB = [
  {
    storeId: 'store-uk-001',
    storeName: 'Royal Crockery & Home Goods',
    businessType: 'crockery',
    ownerName: 'Alexander Wright',
    ownerEmail: 'admin@nexcart.com',
    phone: '+44 20 7946 0912',
    address: '27 Huxley Gardens, London NW10 7EB, UK',
    currency: 'GBP',
    currencySymbol: '£',
    taxRate: 20,
    registeredAt: '2026-01-15T10:30:00.000Z',
    plan: 'ENTERPRISE PRO',
    status: 'ACTIVE',
    totalTransactionsCount: 1420,
    totalSalesVolume: 94850.00
  },
  {
    storeId: 'store-us-002',
    storeName: 'Metro Market & Groceries',
    businessType: 'grocery',
    ownerName: 'David Miller',
    ownerEmail: 'david@metromarket.com',
    phone: '+1 212 555 0198',
    address: '450 Fifth Avenue, New York, NY 10018',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 8.875,
    registeredAt: '2026-02-01T14:15:00.000Z',
    plan: 'RETAIL STANDARD',
    status: 'ACTIVE',
    totalTransactionsCount: 3890,
    totalSalesVolume: 154200.00
  },
  {
    storeId: 'store-pk-003',
    storeName: 'Apex Tech & Mobile Hub',
    businessType: 'electronics',
    ownerName: 'Kamran Malik',
    ownerEmail: 'malik@apextech.pk',
    phone: '+92 300 1234567',
    address: 'Hafeez Center, Gulberg III, Lahore, Pakistan',
    currency: 'PKR',
    currencySymbol: '₨',
    taxRate: 17,
    registeredAt: '2026-03-10T09:00:00.000Z',
    plan: 'STARTER',
    status: 'ACTIVE',
    totalTransactionsCount: 520,
    totalSalesVolume: 1850000.00
  }
];
