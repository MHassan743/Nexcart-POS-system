import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal.jsx';
import { Modal } from '../components/Modal.jsx';
import { AlertModal } from '../components/AlertModal.jsx';
import { NexcartLogo, NexcartBadge } from '../components/NexcartBranding.jsx';
import { printReceipt } from '../utils/printReceipt.js';
import { 
  Search, 
  Scan, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  PauseCircle, 
  UserPlus, 
  User, 
  Sparkles, 
  Printer, 
  Percent, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  History,
  ShieldCheck
} from 'lucide-react';

export const POSView = () => {
  const { user, store } = useAuth();
  const {
    products,
    customers,
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
    parkedBills,
    resumeParkedBill
  } = usePOS();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showParkedDrawer, setShowParkedDrawer] = useState(false);

  // Discount Approval Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [inputDiscount, setInputDiscount] = useState(discountPercent);
  const [managerPinInput, setManagerPinInput] = useState('');
  const [discountError, setDiscountError] = useState('');

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, SPLIT, KHAATA
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Quick Customer Add Modal State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustBalance, setNewCustBalance] = useState('');

  // Get dynamic categories list
  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode?.includes(searchQuery);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate remaining debt balance for customer Khaata
  const paid = amountPaidInput === '' ? grandTotal : Number(amountPaidInput);
  const remainingDebt = Math.max(0, grandTotal - paid);

  // Handle Discount Submission with Manager PIN check if > 10%
  const handleApplyDiscountSubmit = (e) => {
    e.preventDefault();
    setDiscountError('');
    const val = Number(inputDiscount);

    if (val < 0 || val > 100) {
      setDiscountError('Discount must be between 0% and 100%');
      return;
    }

    // Threshold check: > 10% requires Manager PIN (8888 or 9999)
    if (val > 10) {
      if (!managerPinInput) {
        setDiscountError('Discounts over 10% require Manager/Owner PIN approval');
        return;
      }
      if (managerPinInput !== '8888' && managerPinInput !== '9999') {
        setDiscountError('Invalid Manager PIN code!');
        return;
      }
      applyDiscount(val, managerPinInput === '9999' ? 'Alexander Wright (Owner)' : 'Victoria Hughes (Manager)');
    } else {
      applyDiscount(val, null);
    }

    setIsDiscountModalOpen(false);
    setManagerPinInput('');
  };

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setAmountPaidInput(grandTotal.toFixed(2));
    setIsCheckoutModalOpen(true);
  };

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });

  // Submit Final Checkout
  const handleFinalCheckout = (e) => {
    e.preventDefault();
    const paidVal = Number(amountPaidInput) || 0;

    const res = processCheckout({
      paymentMethod,
      amountPaid: paidVal,
      remainingBalance: remainingDebt,
      notes: checkoutNotes
    });

    if (res.success) {
      setIsCheckoutModalOpen(false);
      setActiveReceipt(res.transaction);
      setIsReceiptModalOpen(true);
      setCheckoutNotes('');
    } else {
      setAlertModal({ isOpen: true, title: 'Checkout Issue', message: res.message, type: 'warning' });
    }
  };

  // Print Invoice Handler — iframe-based isolated print (no popup blocker)
  const handlePrintReceipt = () => {
    printReceipt('printable-receipt', `Invoice — ${store?.storeName || 'Nexcart POS'}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-950">
      {/* LEFT SECTION: PRODUCT CATALOG & SEARCH (60-65% width) */}
      <div className="flex-1 flex flex-col border-r border-slate-800/80 p-4 space-y-4 overflow-hidden">
        {/* Search & Barcode Scan Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product by Name, SKU, or Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Live Barcode Scanner Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-xs font-bold text-white shadow-glow-sky transition-all"
            >
              <Scan className="w-4 h-4 animate-pulse" />
              <span>Scan Barcode</span>
            </button>

            {/* Parked Bills Drawer Button */}
            <button
              onClick={() => setShowParkedDrawer(true)}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Parked / Held Bills"
            >
              <PauseCircle className="w-4 h-4 text-amber-400" />
              {parkedBills.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {parkedBills.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-glow-sky border border-sky-300/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map(product => {
            const isLowStock = product.stockQuantity <= (product.reorderThreshold || 10);
            const isOutStock = product.stockQuantity <= 0;

            return (
              <div
                key={product.id}
                onClick={() => !isOutStock && addToCart(product)}
                className={`glass-panel-interactive rounded-2xl p-3 flex flex-col justify-between cursor-pointer group relative overflow-hidden select-none ${
                  isOutStock ? 'opacity-50 cursor-not-allowed border-rose-500/30' : ''
                }`}
              >
                {/* Out / Low Stock Badge */}
                {isOutStock ? (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white uppercase z-10">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 badge-pulse-red z-10">
                    Low Stock: {product.stockQuantity}
                  </span>
                ) : null}

                {/* Product Thumbnail Image */}
                <div className="h-28 w-full rounded-xl bg-slate-950 overflow-hidden mb-2 relative flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="text-slate-600 font-heading font-extrabold text-2xl">
                      {product.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1 left-2 text-[10px] text-slate-300 font-mono">
                    SKU: {product.sku}
                  </span>
                </div>

                {/* Product Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-heading font-extrabold text-sm text-sky-400">
                      {store?.currencySymbol}{product.salePrice.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Stock: {product.stockQuantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SECTION: ACTIVE BILLING CART (35-40% width) */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-400" />
            <h2 className="font-heading font-bold text-sm text-white">Active Order Cart</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
          </div>

          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Customer Select / Khaata Balance Indicator */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer Khaata Ledger</span>
            </label>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ New Customer</span>
            </button>
          </div>

          <select
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const cust = customers.find(c => c.id === e.target.value);
              setSelectedCustomer(cust || null);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">Walk-in Customer (No Khaata Account)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.creditBalance > 0 ? `(Debt Balance: ${store?.currencySymbol}${c.creditBalance.toFixed(2)})` : ''}
              </option>
            ))}
          </select>

          {selectedCustomer && selectedCustomer.creditBalance > 0 && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
              <span>Existing Khaata Debt Balance:</span>
              <strong className="font-heading text-xs text-amber-400">
                {store?.currencySymbol}{selectedCustomer.creditBalance.toFixed(2)}
              </strong>
            </div>
          )}
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShoppingCart className="w-12 h-12 stroke-[1] mb-2 text-slate-600 animate-bounce" />
              <p className="text-xs font-medium">Cart is empty</p>
              <p className="text-[10px] text-slate-600 mt-1">Scan or click products on the left to add items</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {store?.currencySymbol}{item.salePrice.toFixed(2)} × {item.quantity}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-700 p-1">
                  <button
                    onClick={() => updateCartQty(item.id, item.quantity - 1)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.id, item.quantity + 1)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Total & Remove */}
                <div className="text-right min-w-[60px]">
                  <div className="font-heading font-extrabold text-xs text-sky-400">
                    {store?.currencySymbol}{(item.salePrice * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors mt-0.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Billing Summary Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
            {/* Subtotal, Discount, Tax Rows */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">{store?.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount — Always Visible */}
            <div className="flex justify-between items-center text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>Discount</span>
                <button
                  onClick={() => {
                    setInputDiscount(discountPercent);
                    setIsDiscountModalOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 hover:bg-sky-500/30"
                >
                  {discountPercent > 0 ? `${discountPercent}% Off` : '+ Discount'}
                </button>
              </div>
              <span className="font-mono text-emerald-400">
                -{store?.currencySymbol}{discountAmount.toFixed(2)}
              </span>
            </div>

            {/* FBR Tax */}
            <div className="flex justify-between text-slate-400">
              <span>FBR Tax ({store?.taxRate}%)</span>
              <span className="font-mono text-slate-200">{store?.currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>

            {/* Previous Bakaya — ONLY shown when customer has outstanding balance */}
            {selectedCustomer && selectedCustomer.creditBalance > 0 && (
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>Bakaya (Prev Balance)</span>
                <span className="font-mono">
                  {store?.currencySymbol}{selectedCustomer.creditBalance.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grand Total</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Instant Stock Deduction</span>
              </div>
            </div>
            <div className="font-heading font-extrabold text-2xl text-white tracking-wide">
              {store?.currencySymbol}{grandTotal.toFixed(2)}
            </div>
          </div>

          {/* Action Buttons: Park Cart & Pay Checkout */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => parkCart('Held Cart')}
              disabled={cart.length === 0}
              className="py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs disabled:opacity-40 transition-all flex flex-col items-center justify-center gap-1"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Hold Sale</span>
            </button>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="col-span-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Banknote className="w-5 h-5" />
              <span>Checkout & Pay</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(prod) => {
          addToCart(prod);
        }}
      />

      {/* 2. Manager PIN Approval Discount Modal */}
      <Modal 
        isOpen={isDiscountModalOpen} 
        onClose={() => setIsDiscountModalOpen(false)} 
        title="Apply Invoice Discount"
      >
        <form onSubmit={handleApplyDiscountSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Discount Percentage (%)</label>
            <div className="relative">
              <Percent className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="number"
                min="0"
                max="100"
                value={inputDiscount}
                onChange={(e) => setInputDiscount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {Number(inputDiscount) > 10 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Lock className="w-4 h-4" />
                <span>Manager PIN Required for &gt; 10% Discount</span>
              </div>
              <p className="text-[11px] text-slate-400">
                System anti-leakage policy: Discounts above 10% require Manager or Owner PIN approval.
              </p>
              <input
                type="password"
                placeholder="Enter Manager PIN (e.g. 8888 or 9999)"
                value={managerPinInput}
                onChange={(e) => setManagerPinInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {discountError && (
            <div className="text-xs text-rose-400 font-medium">{discountError}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDiscountModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-glow-sky"
            >
              Apply Discount
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Checkout Payment & Customer Khaata Balance Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Complete Checkout Payment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFinalCheckout} className="space-y-4">
          {/* Summary Banner with Previous Balance Breakdown */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Today's Net Bill</div>
                <div className="text-xs text-slate-300">
                  Customer: <strong className="text-white">{selectedCustomer?.name || 'Walk-in Customer'}</strong>
                </div>
              </div>
              <div className="font-heading font-extrabold text-xl text-emerald-400">
                {store?.currencySymbol}{grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Show Previous Balance if Customer has one */}
            {selectedCustomer && (selectedCustomer.creditBalance || 0) > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-xs text-amber-300 font-semibold">
                  <span>Previous Khaata / Udhari Balance:</span>
                  <span className="font-mono">+{store?.currencySymbol}{(selectedCustomer.creditBalance || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-white font-extrabold bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/30">
                  <span>Total Outstanding Payable (Bill + Prev):</span>
                  <span className="font-mono text-amber-300">{store?.currencySymbol}{(grandTotal + (selectedCustomer.creditBalance || 0)).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Buttons for Payment */}
          {selectedCustomer && (selectedCustomer.creditBalance || 0) > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmountPaidInput(grandTotal.toFixed(2))}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Pay Today's Bill Only ({store?.currencySymbol}{grandTotal.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setAmountPaidInput((grandTotal + (selectedCustomer.creditBalance || 0)).toFixed(2))}
                className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Clear Total Balance ({store?.currencySymbol}{(grandTotal + (selectedCustomer.creditBalance || 0)).toFixed(2)})
              </button>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-lg'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('SPLIT')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'SPLIT'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Percent className="w-4 h-4" />
                <span>Split / Partial</span>
              </button>
            </div>
          </div>

          {/* Amount Received Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Amount Tendered / Paid</label>
            <input
              type="number"
              step="0.01"
              required
              value={amountPaidInput}
              onChange={(e) => setAmountPaidInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Customer Remaining Balance / Khaata Ledger Alert */}
          {remainingDebt > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Partial Payment Detected!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Remaining debt of <strong className="text-white font-mono">{store?.currencySymbol}{remainingDebt.toFixed(2)}</strong> will be added to customer's Khaata Credit Ledger (Default balance is 0 if paid in full).
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Confirm Sale & Print Receipt</span>
          </button>
        </form>
      </Modal>

      {/* 4. Printable & Digital Invoice Preview Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Tax Invoice & Receipt"
        maxWidth="max-w-lg"
      >
        {activeReceipt && (
          <div className="space-y-4">
            {/* Printable Receipt Content Area */}
            <div id="printable-receipt" className="p-4 bg-white text-slate-900 rounded-xl font-sans text-xs shadow-md border border-slate-300 space-y-3">
              {/* Receipt Branding Header */}
              <div className="text-center border-b border-slate-300 pb-3 space-y-1">
                <h2 className="font-bold text-base text-slate-900 uppercase tracking-wide">
                  {store?.storeName || 'Nexcart Retail Shop'}
                </h2>
                <div className="text-[10px] text-slate-600">{store?.address}</div>
                <div className="text-[10px] text-slate-600">Tel: {store?.phone} | VAT Reg No: UK-9842104</div>
                <div className="mt-1 font-bold text-sky-700 text-[11px]">*** OFFICIAL TAX INVOICE ***</div>
              </div>

              {/* Transaction Metadata */}
              <div className="grid grid-cols-2 text-[10px] text-slate-700 py-1 border-b border-slate-200">
                <div>Invoice #: <strong>{activeReceipt.invoiceNumber}</strong></div>
                <div className="text-right">Date: <strong>{new Date(activeReceipt.timestamp).toLocaleDateString()}</strong></div>
                <div>Cashier: <strong>{activeReceipt.employeeName} ({activeReceipt.employeeRole})</strong></div>
                <div className="text-right">Till: <strong>{activeReceipt.tillId}</strong></div>
                <div>Customer: <strong>{activeReceipt.customer?.name}</strong></div>
                <div className="text-right">Payment: <strong>{activeReceipt.paymentMethod}</strong></div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 text-[10px] uppercase">
                    <th className="py-1">Item Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReceipt.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium">{item.name}</td>
                      <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-1.5 text-right font-mono">{store?.currencySymbol}{item.salePrice.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono font-semibold">{store?.currencySymbol}{(item.salePrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="border-t border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{store?.currencySymbol}{activeReceipt.subtotal.toFixed(2)}</span>
                </div>

                {/* Discount — Always shown, 0.00 if none */}
                <div className="flex justify-between font-medium" style={{ color: activeReceipt.discountAmount > 0 ? '#15803d' : '#64748b' }}>
                  <span>Discount ({activeReceipt.discount || 0}%):</span>
                  <span className="font-mono">-{store?.currencySymbol}{(activeReceipt.discountAmount || 0).toFixed(2)}</span>
                </div>

                {/* FBR Tax (was UK VAT) */}
                <div className="flex justify-between text-slate-600">
                  <span>FBR Tax ({store?.taxRate}%):</span>
                  <span className="font-mono">{store?.currencySymbol}{activeReceipt.tax.toFixed(2)}</span>
                </div>

                {/* Previous Bakaya Balance — Always shown */}
                <div className={`flex justify-between font-medium ${(activeReceipt.previousBalance || 0) > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  <span>Bakaya (Prev. Balance):</span>
                  <span className="font-mono">{store?.currencySymbol}{(activeReceipt.previousBalance || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono">{store?.currencySymbol}{activeReceipt.grandTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                  <span>Amount Tendered:</span>
                  <span className="font-mono">{store?.currencySymbol}{activeReceipt.amountPaid.toFixed(2)}</span>
                </div>

                {/* Bakaya Added This Sale — Always shown */}
                <div className={`flex justify-between text-[10px] font-bold p-1 rounded ${
                  (activeReceipt.remainingBalance || 0) > 0 
                    ? 'text-rose-700 bg-rose-50' 
                    : 'text-slate-500'
                }`}>
                  <span>Bakaya Added (This Sale):</span>
                  <span className="font-mono">{store?.currencySymbol}{(activeReceipt.remainingBalance || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Agency Signature */}
              <div className="text-center pt-3 border-t border-slate-300 text-[10px] text-slate-500 space-y-0.5">
                <div>Thank you for shopping with us!</div>
                <div className="font-semibold text-sky-800">Designed & Powered by Nexcart Agency</div>
                <div className="text-[8px] text-slate-400">https://www.nexcart-agency.com/</div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Physical Invoice</span>
              </button>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Quick Add Customer Modal */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Add New Customer Account"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newCustName) return;
          const initialBal = Number(newCustBalance) || 0;
          const newC = {
            id: `cust-${Date.now()}`,
            name: newCustName,
            phone: newCustPhone || 'N/A',
            creditBalance: initialBal,
            totalSpent: 0
          };
          usePOS().handleSaveCustomer(newC);
          setSelectedCustomer(newC);
          setIsAddCustomerOpen(false);
          setNewCustName('');
          setNewCustPhone('');
          setNewCustBalance('');
        }} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lady Sarah Jenkins"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+44 7911 000111"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Previous Balance / Existing Debt ({store?.currencySymbol})</span>
              <span className="text-[10px] text-amber-400 font-bold">Initial Khaata</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newCustBalance}
              onChange={(e) => setNewCustBalance(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-glow-sky"
          >
            Save & Select Customer
          </button>
        </form>
      </Modal>

      {/* Custom Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};
