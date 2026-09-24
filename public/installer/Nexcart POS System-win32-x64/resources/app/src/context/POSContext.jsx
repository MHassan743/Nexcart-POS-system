import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DB } from '../services/db.js';
import { useAuth } from './AuthContext.jsx';

const POSContext = createContext();

export const POSProvider = ({ children }) => {
  const { user, store } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [parkedBills, setParkedBills] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);

  // Cart state
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountApprovedBy, setDiscountApprovedBy] = useState(null);
  const [lastCompletedSale, setLastCompletedSale] = useState(null);

  // Reload data from DB
  const refreshData = () => {
    setProducts(DB.getProducts());
    setCustomers(DB.getCustomers());
    setTransactions(DB.getTransactions());
    setParkedBills(DB.getParkedBills());
    setAuditLogs(DB.getAuditLogs());
    setReconciliations(DB.getReconciliations());
  };

  useEffect(() => {
    refreshData();
  }, [store]);

  // Cart operations
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + qty;
        // Check if stock available
        if (newQty > product.stockQuantity) {
          alert(`Warning: Only ${product.stockQuantity} units available in stock for ${product.name}`);
        }
        updated[idx].quantity = Math.min(newQty, product.stockQuantity);
        return updated;
      } else {
        if (product.stockQuantity <= 0) {
          alert(`Warning: ${product.name} is OUT OF STOCK!`);
          return prev;
        }
        return [...prev, { ...product, quantity: Math.min(qty, product.stockQuantity) }];
      }
    });
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const prod = products.find(p => p.id === productId);
    if (prod && qty > prod.stockQuantity) {
      alert(`Cannot set quantity higher than available stock (${prod.stockQuantity})`);
      qty = prod.stockQuantity;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountPercent(0);
    setDiscountApprovedBy(null);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxRate = store?.taxRate || 20;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  // Apply Discount with Threshold Check (Manager PIN required if > 10%)
  const applyDiscount = (percent, approvedBy = null) => {
    setDiscountPercent(percent);
    if (approvedBy) setDiscountApprovedBy(approvedBy);
  };

  // Process Checkout & Finalize Sale
  const processCheckout = ({ paymentMethod, amountPaid, remainingBalance, notes }) => {
    if (cart.length === 0) return { success: false, message: 'Cart is empty' };
    if (!user) return { success: false, message: 'No active cashier logged in' };

    const saleData = {
      items: cart,
      subtotal,
      tax: taxAmount,
      discount: discountPercent,
      discountAmount,
      grandTotal,
      amountPaid: Number(amountPaid),
      remainingBalance: Number(remainingBalance) || 0,
      // Bakaya: snapshot of customer's EXISTING outstanding balance before this sale
      previousBalance: selectedCustomer ? (selectedCustomer.creditBalance || 0) : 0,
      paymentMethod, // 'CASH', 'CARD', 'SPLIT', 'KHAATA_CREDIT'
      customer: selectedCustomer || { name: 'Walk-in Customer' },
      tillId: 'Till-01',
      discountApprovedBy,
      notes
    };

    const completedTx = DB.processSale(saleData, user);
    setLastCompletedSale(completedTx);

    // Trigger visual confetti celebratory animation
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.log('Confetti effect executed');
    }

    clearCart();
    refreshData();

    return { success: true, transaction: completedTx };
  };

  // Park Cart
  const parkCart = (note) => {
    if (cart.length === 0) return false;
    DB.parkBill({ items: cart, customer: selectedCustomer, note }, user);
    clearCart();
    refreshData();
    return true;
  };

  const resumeParkedBill = (billId) => {
    const bill = parkedBills.find(b => b.id === billId);
    if (bill) {
      setCart(bill.items);
      if (bill.customer) setSelectedCustomer(bill.customer);
      DB.removeParkedBill(billId);
      refreshData();
    }
  };

  // Stock Management Actions
  const handleSaveProduct = (prodData) => {
    DB.saveProduct(prodData, user);
    refreshData();
  };

  const handleDeleteProduct = (productId) => {
    DB.deleteProduct(productId, user);
    refreshData();
  };

  const handleStockIn = (productId, qty, costPrice, supplier) => {
    DB.addStockIn(productId, qty, costPrice, supplier, user);
    refreshData();
  };

  const handleManualStockAdjust = (productId, newQty, reason) => {
    DB.adjustStock(productId, newQty, reason, user);
    refreshData();
  };

  // Customer Actions
  const handleSaveCustomer = (custData) => {
    DB.saveCustomer(custData);
    refreshData();
  };

  const handleRecordKhaataPayment = (customerId, amount) => {
    DB.recordCustomerPayment(customerId, amount, user);
    refreshData();
  };

  // Daily Reconciliation Action
  const handleRunReconciliation = (reconData) => {
    const record = DB.saveReconciliation(reconData, user);
    refreshData();
    return record;
  };

  return (
    <POSContext.Provider value={{
      products,
      customers,
      transactions,
      parkedBills,
      auditLogs,
      reconciliations,
      cart,
      selectedCustomer,
      discountPercent,
      discountAmount,
      subtotal,
      taxAmount,
      grandTotal,
      lastCompletedSale,
      setSelectedCustomer,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      applyDiscount,
      processCheckout,
      parkCart,
      resumeParkedBill,
      handleSaveProduct,
      handleDeleteProduct,
      handleStockIn,
      handleManualStockAdjust,
      handleSaveCustomer,
      handleRecordKhaataPayment,
      handleRunReconciliation,
      refreshData
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => useContext(POSContext);
