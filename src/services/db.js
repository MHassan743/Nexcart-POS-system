// Serverless Local & Cloud DB Simulation Service for Nexcart POS System
import { INITIAL_PRODUCTS, INITIAL_EMPLOYEES, INITIAL_CUSTOMERS, INITIAL_NEXCART_SERVERLESS_HUB, BUSINESS_TYPES } from './seedData.js';

const STORAGE_KEYS = {
  CURRENT_STORE: 'nexcart_current_store',
  PRODUCTS: 'nexcart_products',
  EMPLOYEES: 'nexcart_employees',
  CUSTOMERS: 'nexcart_customers',
  TRANSACTIONS: 'nexcart_transactions',
  PARKED_BILLS: 'nexcart_parked_bills',
  RECONCILIATIONS: 'nexcart_reconciliations',
  SHIFTS: 'nexcart_shifts',
  AUDIT_LOGS: 'nexcart_audit_logs',
  GLOBAL_HUB: 'nexcart_global_hub',
  ACTIVE_USER: 'nexcart_active_user'
};

// Helper: Safely get JSON from LocalStorage
const getStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

// Helper: Safely set JSON in LocalStorage
const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

export const DB = {
  // Initialize Database with Defaults if Empty
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.GLOBAL_HUB)) {
      setStorage(STORAGE_KEYS.GLOBAL_HUB, INITIAL_NEXCART_SERVERLESS_HUB);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_STORE)) {
      const defaultStore = {
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
        registeredAt: new Date().toISOString(),
        plan: 'ENTERPRISE PRO',
        status: 'ACTIVE',
        discrepancyThreshold: 0
      };
      setStorage(STORAGE_KEYS.CURRENT_STORE, defaultStore);
    }

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      setStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS.crockery);
    }

    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
      setStorage(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      setStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      setStorage(STORAGE_KEYS.TRANSACTIONS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.PARKED_BILLS)) {
      setStorage(STORAGE_KEYS.PARKED_BILLS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.RECONCILIATIONS)) {
      setStorage(STORAGE_KEYS.RECONCILIATIONS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      setStorage(STORAGE_KEYS.SHIFTS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      const initialLogs = [
        {
          id: 'log-101',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          employeeId: 'emp-001',
          employeeName: 'Alexander Wright',
          role: 'OWNER',
          action: 'STORE_INITIALIZED',
          details: 'Nexcart POS System initialized for Royal Crockery & Home Goods',
          tillId: 'Till-01'
        }
      ];
      setStorage(STORAGE_KEYS.AUDIT_LOGS, initialLogs);
    }
  },

  // Store Management
  getStore: () => getStorage(STORAGE_KEYS.CURRENT_STORE, {}),
  updateStore: (updatedFields) => {
    const store = { ...DB.getStore(), ...updatedFields };
    setStorage(STORAGE_KEYS.CURRENT_STORE, store);
    
    // Also update serverless central hub
    const hub = getStorage(STORAGE_KEYS.GLOBAL_HUB, []);
    const idx = hub.findIndex(s => s.storeId === store.storeId);
    if (idx !== -1) {
      hub[idx] = { ...hub[idx], ...updatedFields };
      setStorage(STORAGE_KEYS.GLOBAL_HUB, hub);
    }
    return store;
  },

  // Register New Store (Serverless Cloud Onboarding)
  registerNewStore: (storeData) => {
    const storeId = `store-${Date.now().toString(36)}`;
    const businessConfig = BUSINESS_TYPES[storeData.businessType.toUpperCase()] || BUSINESS_TYPES.GENERAL;
    
    const newStore = {
      storeId,
      storeName: storeData.storeName,
      businessType: storeData.businessType,
      ownerName: storeData.ownerName,
      ownerEmail: storeData.ownerEmail,
      phone: storeData.phone || '+44 7000 000000',
      address: storeData.address || 'London, UK',
      currency: storeData.currency || businessConfig.defaultCurrency,
      currencySymbol: storeData.currencySymbol || businessConfig.currencySymbol,
      taxRate: storeData.taxRate !== undefined ? Number(storeData.taxRate) : businessConfig.defaultTaxRate,
      registeredAt: new Date().toISOString(),
      plan: 'NEXCART PRO',
      status: 'ACTIVE',
      totalTransactionsCount: 0,
      totalSalesVolume: 0
    };

    // Save as current store
    setStorage(STORAGE_KEYS.CURRENT_STORE, newStore);

    // Sync to Serverless Master Registry (Nexcart Central Record)
    const hub = getStorage(STORAGE_KEYS.GLOBAL_HUB, []);
    hub.unshift(newStore);
    setStorage(STORAGE_KEYS.GLOBAL_HUB, hub);

    // Create Owner Account
    const ownerEmployee = {
      id: `emp-owner-${Date.now()}`,
      name: storeData.ownerName,
      email: storeData.ownerEmail,
      pin: storeData.ownerPin || '9999',
      role: 'OWNER',
      tillAccess: true,
      phone: storeData.phone,
      status: 'ACTIVE'
    };
    setStorage(STORAGE_KEYS.EMPLOYEES, [ownerEmployee, ...INITIAL_EMPLOYEES.filter(e => e.role !== 'OWNER')]);

    // Load category default products if applicable
    const initialProds = INITIAL_PRODUCTS[storeData.businessType] || INITIAL_PRODUCTS.crockery;
    setStorage(STORAGE_KEYS.PRODUCTS, initialProds);

    // Log Audit
    DB.addAuditLog({
      employeeId: ownerEmployee.id,
      employeeName: ownerEmployee.name,
      role: 'OWNER',
      action: 'SERVERLESS_STORE_REGISTERED',
      details: `Registered new store "${storeData.storeName}" (${storeData.businessType}) under Nexcart Agency cloud hub.`
    });

    return newStore;
  },

  // Nexcart Global Hub (Serverless Master Registry view for Super Admin)
  getGlobalHub: () => getStorage(STORAGE_KEYS.GLOBAL_HUB, []),

  // Active Session / User Auth
  getActiveUser: () => getStorage(STORAGE_KEYS.ACTIVE_USER, null),
  setActiveUser: (user) => setStorage(STORAGE_KEYS.ACTIVE_USER, user),
  logoutUser: () => {
    const active = DB.getActiveUser();
    if (active) {
      DB.addAuditLog({
        employeeId: active.id,
        employeeName: active.name,
        role: active.role,
        action: 'EMPLOYEE_LOGOUT',
        details: `Logged out from Till terminal.`
      });
    }
    setStorage(STORAGE_KEYS.ACTIVE_USER, null);
  },

  // Employee CRUD & PIN Verification
  getEmployees: () => getStorage(STORAGE_KEYS.EMPLOYEES, []),
  saveEmployee: (employee) => {
    const employees = DB.getEmployees();
    const existingIdx = employees.findIndex(e => e.id === employee.id);
    let updated;
    if (existingIdx !== -1) {
      employees[existingIdx] = employee;
      updated = employees;
    } else {
      updated = [employee, ...employees];
    }
    setStorage(STORAGE_KEYS.EMPLOYEES, updated);
    return updated;
  },
  verifyPin: (pin) => {
    const employees = DB.getEmployees();
    return employees.find(e => e.pin === pin && e.status === 'ACTIVE') || null;
  },

  // Products & Inventory
  getProducts: () => getStorage(STORAGE_KEYS.PRODUCTS, []),
  saveProduct: (product, currentUser) => {
    const products = DB.getProducts();
    const existingIdx = products.findIndex(p => p.id === product.id);
    let updated;
    let action = 'PRODUCT_CREATED';
    let details = `Created product: ${product.name} (SKU: ${product.sku}, Qty: ${product.stockQuantity})`;

    if (existingIdx !== -1) {
      const oldProd = products[existingIdx];
      action = 'PRODUCT_UPDATED';
      details = `Updated product ${product.name}: Stock ${oldProd.stockQuantity} -> ${product.stockQuantity}, Price ${oldProd.salePrice} -> ${product.salePrice}`;
      products[existingIdx] = product;
      updated = products;
    } else {
      updated = [product, ...products];
    }
    setStorage(STORAGE_KEYS.PRODUCTS, updated);

    if (currentUser) {
      DB.addAuditLog({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        role: currentUser.role,
        action,
        details
      });
    }
    return updated;
  },
  deleteProduct: (productId, currentUser) => {
    const products = DB.getProducts();
    const prod = products.find(p => p.id === productId);
    const filtered = products.filter(p => p.id !== productId);
    setStorage(STORAGE_KEYS.PRODUCTS, filtered);

    if (currentUser && prod) {
      DB.addAuditLog({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        role: currentUser.role,
        action: 'PRODUCT_DELETED',
        details: `Deleted product ${prod.name} (SKU: ${prod.sku})`
      });
    }
    return filtered;
  },

  // Stock-In Flow (Supplier Stock Addition)
  addStockIn: (productId, qtyReceived, costPrice, supplierName, currentUser) => {
    const products = DB.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return null;

    const prod = products[idx];
    const oldQty = prod.stockQuantity;
    const newQty = oldQty + Number(qtyReceived);

    prod.stockQuantity = newQty;
    if (costPrice) prod.costPrice = Number(costPrice);
    if (supplierName) prod.supplier = supplierName;

    setStorage(STORAGE_KEYS.PRODUCTS, products);

    DB.addAuditLog({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      role: currentUser.role,
      action: 'STOCK_IN_RECEIVED',
      details: `Stock-In: Received +${qtyReceived} units for ${prod.name}. Stock increased from ${oldQty} to ${newQty}. Supplier: ${supplierName || prod.supplier}`
    });

    return prod;
  },

  // Manual Stock Adjustment (Mandatory Manager/Owner reason logging)
  adjustStock: (productId, newQuantity, reason, currentUser) => {
    const products = DB.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return null;

    const prod = products[idx];
    const oldQty = prod.stockQuantity;
    const diff = Number(newQuantity) - oldQty;

    prod.stockQuantity = Number(newQuantity);
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    DB.addAuditLog({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      role: currentUser.role,
      action: 'MANUAL_STOCK_ADJUSTMENT',
      details: `Stock Adjustment for "${prod.name}" (SKU: ${prod.sku}): Changed ${oldQty} -> ${newQuantity} (${diff >= 0 ? '+' : ''}${diff}). Mandatory Reason: "${reason}"`
    });

    return prod;
  },

  // Customers & Khaata Ledger
  getCustomers: () => getStorage(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomer: (customer) => {
    const customers = DB.getCustomers();
    const idx = customers.findIndex(c => c.id === customer.id);
    let updated;
    if (idx !== -1) {
      customers[idx] = customer;
      updated = customers;
    } else {
      updated = [customer, ...customers];
    }
    setStorage(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
  },
  recordCustomerPayment: (customerId, amountPaid, currentUser) => {
    const customers = DB.getCustomers();
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx === -1) return null;

    const cust = customers[idx];
    const oldBalance = cust.creditBalance || 0;
    const newBalance = Math.max(0, oldBalance - Number(amountPaid));

    cust.creditBalance = newBalance;
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    DB.addAuditLog({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      role: currentUser.role,
      action: 'CUSTOMER_KHAATA_PAYMENT',
      details: `Received credit payment of ${amountPaid} from ${cust.name}. Khaata balance reduced from ${oldBalance.toFixed(2)} to ${newBalance.toFixed(2)}`
    });

    return cust;
  },

  // POS Sales Billing Engine & Atomic Stock Deduction
  processSale: (saleData, currentUser) => {
    // saleData: { items, subtotal, tax, discount, discountAmount, grandTotal, amountPaid, remainingBalance, paymentMethod, customer, tillId }
    const store = DB.getStore();
    const products = DB.getProducts();
    const transactions = getStorage(STORAGE_KEYS.TRANSACTIONS, []);

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    // 1. Deduct Stock Real-time for every sold item
    const updatedProducts = products.map(prod => {
      const itemInCart = saleData.items.find(i => i.id === prod.id);
      if (itemInCart) {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - itemInCart.quantity)
        };
      }
      return prod;
    });

    setStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);

    // 2. Handle Customer Credit Ledger (Remaining balance added to Customer Khaata)
    if (saleData.customer && saleData.customer.id) {
      const customers = DB.getCustomers();
      const custIdx = customers.findIndex(c => c.id === saleData.customer.id);
      if (custIdx !== -1) {
        const cust = customers[custIdx];
        const addedBalance = saleData.remainingBalance || 0;
        cust.creditBalance = (cust.creditBalance || 0) + addedBalance;
        cust.totalSpent = (cust.totalSpent || 0) + saleData.grandTotal;
        cust.loyaltyPoints = (cust.loyaltyPoints || 0) + Math.floor(saleData.grandTotal);
        setStorage(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    // 3. Create Invoiced Transaction Record
    const transactionRecord = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      timestamp,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeRole: currentUser.role,
      tillId: saleData.tillId || 'Till-01',
      items: saleData.items,
      itemCount: saleData.items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: saleData.subtotal,
      tax: saleData.tax,
      discount: saleData.discount || 0,
      discountAmount: saleData.discountAmount || 0,
      grandTotal: saleData.grandTotal,
      amountPaid: saleData.amountPaid,
      remainingBalance: saleData.remainingBalance || 0,
      paymentMethod: saleData.paymentMethod, // 'CASH', 'CARD', 'SPLIT', 'KHAATA_CREDIT'
      customer: saleData.customer || { name: 'Walk-in Customer' },
      storeId: store.storeId,
      discountApprovedBy: saleData.discountApprovedBy || null
    };

    transactions.unshift(transactionRecord);
    setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Update Global Hub volume metrics
    const hub = getStorage(STORAGE_KEYS.GLOBAL_HUB, []);
    const hubIdx = hub.findIndex(s => s.storeId === store.storeId);
    if (hubIdx !== -1) {
      hub[hubIdx].totalTransactionsCount = (hub[hubIdx].totalTransactionsCount || 0) + 1;
      hub[hubIdx].totalSalesVolume = (hub[hubIdx].totalSalesVolume || 0) + saleData.grandTotal;
      setStorage(STORAGE_KEYS.GLOBAL_HUB, hub);
    }

    // 4. Immutable Audit Trail Entry
    DB.addAuditLog({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      role: currentUser.role,
      action: 'SALE_COMPLETED',
      details: `Generated Invoice #${invoiceNumber} total ${store.currencySymbol}${saleData.grandTotal.toFixed(2)} (${saleData.items.length} items sold). Till: ${saleData.tillId || 'Till-01'}. Method: ${saleData.paymentMethod}.${saleData.remainingBalance > 0 ? ` Khaata Balance Left: ${store.currencySymbol}${saleData.remainingBalance.toFixed(2)}` : ''}`
    });

    return transactionRecord;
  },

  getTransactions: () => getStorage(STORAGE_KEYS.TRANSACTIONS, []),

  // Parked / Held Bills
  getParkedBills: () => getStorage(STORAGE_KEYS.PARKED_BILLS, []),
  parkBill: (cartData, currentUser) => {
    const parked = DB.getParkedBills();
    const newBill = {
      id: `parked-${Date.now()}`,
      timestamp: new Date().toISOString(),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      customer: cartData.customer,
      items: cartData.items,
      note: cartData.note || 'Held Cart'
    };
    parked.unshift(newBill);
    setStorage(STORAGE_KEYS.PARKED_BILLS, parked);

    DB.addAuditLog({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      role: currentUser.role,
      action: 'SALE_PARKED',
      details: `Parked cart with ${cartData.items.length} items.`
    });

    return newBill;
  },
  removeParkedBill: (billId) => {
    const parked = DB.getParkedBills();
    const filtered = parked.filter(b => b.id !== billId);
    setStorage(STORAGE_KEYS.PARKED_BILLS, filtered);
    return filtered;
  },

  // Daily Stock Reconciliation Engine
  getReconciliations: () => getStorage(STORAGE_KEYS.RECONCILIATIONS, []),
  saveReconciliation: (reconData, currentUser) => {
    const reconciliations = DB.getReconciliations();
    const record = {
      id: `recon-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: reconData.date || new Date().toISOString().split('T')[0],
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      totalOpeningStock: reconData.totalOpeningStock,
      totalClosingStock: reconData.totalClosingStock,
      totalInvoicedUnits: reconData.totalInvoicedUnits,
      expectedStock: reconData.expectedStock,
      discrepancyUnits: reconData.discrepancyUnits, // (Expected - Closing)
      discrepancyValue: reconData.discrepancyValue,
      cctvNotes: reconData.cctvNotes || '',
      status: reconData.discrepancyUnits === 0 ? 'MATCHED' : 'DISCREPANCY_FLAGGED'
    };
    reconciliations.unshift(record);
    setStorage(STORAGE_KEYS.RECONCILIATIONS, reconciliations);

    DB.addAuditLog({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      role: currentUser.role,
      action: 'DAILY_RECONCILIATION_RUN',
      details: `Daily Stock Reconciliation: Total Units Invoiced = ${reconData.totalInvoicedUnits}, Expected Stock = ${reconData.expectedStock}, Actual Stock = ${reconData.totalClosingStock}. Discrepancy = ${reconData.discrepancyUnits} units (${reconData.discrepancyValue >= 0 ? '-' : '+'}${Math.abs(reconData.discrepancyValue).toFixed(2)}). Status: ${record.status}`
    });

    return record;
  },

  // Audit Log Service (Read-Only)
  getAuditLogs: () => getStorage(STORAGE_KEYS.AUDIT_LOGS, []),
  addAuditLog: (logEntry) => {
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    const entry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      employeeId: logEntry.employeeId || 'SYSTEM',
      employeeName: logEntry.employeeName || 'System Process',
      role: logEntry.role || 'ADMIN',
      action: logEntry.action,
      details: logEntry.details,
      tillId: logEntry.tillId || 'Till-01'
    };
    logs.unshift(entry);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
    return entry;
  },

  // Zero-Meter Factory Reset: Completely wipe dummy products, customers, transactions, audit logs
  resetToZeroMeter: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // Re-initialize clean state
    DB.init();
    // Ensure products, transactions, and debts are 100% empty
    setStorage(STORAGE_KEYS.PRODUCTS, []);
    setStorage(STORAGE_KEYS.TRANSACTIONS, []);
    setStorage(STORAGE_KEYS.PARKED_BILLS, []);
    setStorage(STORAGE_KEYS.RECONCILIATIONS, []);
    setStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, [{
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      employeeId: 'emp-001',
      employeeName: 'Alexander Wright',
      role: 'OWNER',
      action: 'ZERO_METER_FACTORY_RESET',
      details: 'System initialized to 0-Meter clean state. All dummy data purged.',
      tillId: 'Till-01'
    }]);
  }
};

// Auto-run DB init on module load
DB.init();
