import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { AlertModal } from '../components/AlertModal.jsx';
import { DB } from '../services/db.js';
import {
  RefreshCw,
  Search,
  ReceiptText,
  CheckCircle2,
  Package,
  AlertTriangle,
  Printer,
  ArrowLeftRight,
  Clock,
} from 'lucide-react';

export const ReturnsView = () => {
  const { store, user } = useAuth();
  const { transactions, refreshData, products } = usePOS();

  // Search by invoice number
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [foundTx, setFoundTx] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Return items selected from the found invoice
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('REFUND'); // REFUND or EXCHANGE
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Final return receipt
  const [completedReturn, setCompletedReturn] = useState(null);
  const [isReturnReceiptOpen, setIsReturnReceiptOpen] = useState(false);

  // Search for invoice by number
  const handleSearchInvoice = (e) => {
    e.preventDefault();
    setSearchError('');
    setFoundTx(null);
    setSelectedReturnItems([]);

    const tx = transactions.find(t =>
      t.invoiceNumber?.toLowerCase() === invoiceSearch.trim().toLowerCase()
    );

    if (!tx) {
      setSearchError(`No invoice found matching "${invoiceSearch}". Check the invoice number and try again.`);
      return;
    }

    setFoundTx(tx);
    const invoiceDiscountPercent = tx.discount || 0;

    // Initialize all items with returnQty = 0 and calculate net discounted unit price
    setSelectedReturnItems(tx.items.map(item => {
      const origPrice = item.salePrice;
      const unitDiscount = (origPrice * invoiceDiscountPercent) / 100;
      const netUnitPrice = origPrice - unitDiscount;
      return {
        ...item,
        originalPrice: origPrice,
        discountPercent: invoiceDiscountPercent,
        unitDiscount,
        netUnitPrice,
        returnQty: 0,
        maxReturnQty: item.quantity
      };
    }));
  };

  // Update return quantity for a specific item
  const handleSetReturnQty = (itemId, qty) => {
    setSelectedReturnItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, returnQty: Math.min(Math.max(0, parseInt(qty) || 0), item.maxReturnQty) }
          : item
      )
    );
  };

  // Items being returned (returnQty > 0)
  const itemsToReturn = selectedReturnItems.filter(i => i.returnQty > 0);

  // Refund amounts based on net discounted prices actually paid by customer
  const grossTotalBeforeDiscount = itemsToReturn.reduce((acc, item) => acc + item.originalPrice * item.returnQty, 0);
  const totalDiscountDeducted = itemsToReturn.reduce((acc, item) => acc + item.unitDiscount * item.returnQty, 0);
  const refundTotal = itemsToReturn.reduce((acc, item) => acc + item.netUnitPrice * item.returnQty, 0);

  // Custom Alert Modal State
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });
  const showAlert = (message, title = 'Attention Required', type = 'warning') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Submit return & restore stock
  const handleConfirmReturn = (e) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      showAlert('Return reason is mandatory. Please enter a valid reason before proceeding.', 'Reason Required', 'warning');
      return;
    }
    if (itemsToReturn.length === 0) {
      showAlert('Please select at least one item with a return quantity greater than 0.', 'No Item Selected', 'warning');
      return;
    }

    // Build return record with full discount transparency
    const returnRecord = {
      id: `RET-${Date.now()}`,
      returnNumber: `RET-${Date.now().toString().slice(-6)}`,
      originalInvoice: foundTx.invoiceNumber,
      invoiceDiscountPercent: foundTx.discount || 0,
      timestamp: new Date().toISOString(),
      employeeName: user?.name || 'Unknown',
      employeeRole: user?.role || 'Cashier',
      customer: foundTx.customer,
      returnType,
      reason: returnReason,
      items: itemsToReturn,
      grossTotalBeforeDiscount,
      totalDiscountDeducted,
      refundTotal,
      tillId: 'Till-01'
    };

    // Save return log to DB (audit log)
    const allReturns = JSON.parse(localStorage.getItem('nexcart_returns') || '[]');
    allReturns.unshift(returnRecord);
    localStorage.setItem('nexcart_returns', JSON.stringify(allReturns));

    // Restore stock for each returned item
    itemsToReturn.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        DB.adjustStock(
          item.id,
          prod.stockQuantity + item.returnQty,
          `[CUSTOMER RETURN] Invoice: ${foundTx.invoiceNumber} | Reason: ${returnReason} | Qty: ${item.returnQty}`,
          user
        );
      }
    });

    // Mark return in audit log
    const auditLogs = JSON.parse(localStorage.getItem('nexcart_audit_logs') || '[]');
    auditLogs.unshift({
      id: `AUD-RET-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'PRODUCT_RETURN',
      employeeName: user?.name || 'Cashier',
      role: user?.role || 'CASHIER',
      details: `Return processed for Invoice ${foundTx.invoiceNumber}. Items: ${itemsToReturn.map(i => `${i.name} x${i.returnQty} (Net: ${store?.currencySymbol}${i.netUnitPrice.toFixed(2)})`).join(', ')}. Reason: ${returnReason}. Type: ${returnType}. Net Refund: ${store?.currencySymbol}${refundTotal.toFixed(2)}. Stock restored.`,
      tillId: 'Till-01'
    });
    localStorage.setItem('nexcart_audit_logs', JSON.stringify(auditLogs));

    refreshData();

    setCompletedReturn(returnRecord);
    setIsConfirmOpen(false);
    setIsReturnReceiptOpen(true);

    // Reset state
    setFoundTx(null);
    setSelectedReturnItems([]);
    setInvoiceSearch('');
    setReturnReason('');
  };

  // Load all stored returns for history
  const allReturns = JSON.parse(localStorage.getItem('nexcart_returns') || '[]');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
          <RefreshCw className="w-7 h-7 text-rose-400" />
          <span>Product Returns & Refund Processing</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Process customer product returns with mandatory reason, automatic stock restoration, and full audit trail logging.
        </p>
      </div>

      {/* Step 1: Look Up Invoice */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-sky-400" />
          <span>Step 1 — Find Original Invoice</span>
        </h3>

        <form onSubmit={handleSearchInvoice} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Invoice Number (e.g. INV-913528)"
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky"
          >
            Search Invoice
          </button>
        </form>

        {searchError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Step 2: Invoice Found — Select Return Items */}
      {foundTx && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Step 2 — Select Items to Return</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Invoice: <strong className="text-sky-300">{foundTx.invoiceNumber}</strong> &nbsp;|&nbsp;
                Customer: <strong className="text-white">{foundTx.customer?.name}</strong> &nbsp;|&nbsp;
                Date: <strong className="text-slate-200">{new Date(foundTx.timestamp).toLocaleDateString()}</strong>
                {foundTx.discount > 0 && (
                  <span className="ml-2 text-emerald-400 font-bold">
                    [Original Invoice Discount: {foundTx.discount}%]
                  </span>
                )}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              INVOICE FOUND
            </span>
          </div>

          {/* Items with return qty inputs */}
          <div className="space-y-2">
            {selectedReturnItems.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 space-y-0.5">
                    <div>
                      Retail Price: <strong className="text-slate-200">{store?.currencySymbol}{item.originalPrice.toFixed(2)}</strong> (Purchased Qty: {item.maxReturnQty})
                    </div>
                    {item.discountPercent > 0 && (
                      <div className="text-emerald-400 font-medium">
                        Invoice Discount Applied ({item.discountPercent}%): -{store?.currencySymbol}{item.unitDiscount.toFixed(2)}/unit → <strong className="text-white">Net Paid: {store?.currencySymbol}{item.netUnitPrice.toFixed(2)}/unit</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Return Qty:</span>
                  <input
                    type="number"
                    min="0"
                    max={item.maxReturnQty}
                    value={item.returnQty}
                    onChange={(e) => handleSetReturnQty(item.id, e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-center text-xs font-bold text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[11px] text-slate-300 min-w-[75px] text-right font-mono font-bold">
                    = {store?.currencySymbol}{(item.netUnitPrice * item.returnQty).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Return Type & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Return Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReturnType('REFUND')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    returnType === 'REFUND'
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Cash Refund
                </button>
                <button
                  type="button"
                  onClick={() => setReturnType('EXCHANGE')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    returnType === 'EXCHANGE'
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Exchange
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Return Reason (Mandatory *)</label>
              <input
                type="text"
                placeholder="e.g. Defective item, wrong size, customer changed mind..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Return Summary Banner */}
          {itemsToReturn.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-rose-400" />
                <span>{itemsToReturn.length} item(s) selected for return</span>
              </div>
              <div className="text-right">
                {totalDiscountDeducted > 0 && (
                  <div className="text-[10px] text-emerald-400">
                    Discount Deducted ({foundTx.discount}%): -{store?.currencySymbol}{totalDiscountDeducted.toFixed(2)}
                  </div>
                )}
                <strong className="font-heading text-base text-white">
                  Net Refund: {store?.currencySymbol}{refundTotal.toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (itemsToReturn.length === 0) { 
                showAlert('Please select at least one item with a return quantity greater than 0.', 'No Item Selected', 'warning'); 
                return; 
              }
              if (!returnReason.trim()) { 
                showAlert('Return reason is mandatory. Please enter a valid reason for returning the product.', 'Reason Required', 'warning'); 
                return; 
              }
              setIsConfirmOpen(true);
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 font-extrabold text-sm text-white shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Process Return & Restore Stock</span>
          </button>
        </div>
      )}

      {/* Return History Log */}
      {allReturns.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Return History Log</span>
          </h3>
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Return # / Date</th>
                    <th className="px-4 py-3">Original Invoice</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Refund Total</th>
                    <th className="px-4 py-3">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                        <div className="font-bold text-rose-300">{ret.returnNumber}</div>
                        <div className="text-slate-500">{new Date(ret.timestamp).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sky-400 font-bold">{ret.originalInvoice}</td>
                      <td className="px-4 py-3 text-slate-200">{ret.customer?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          ret.returnType === 'REFUND'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        }`}>
                          {ret.returnType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-[11px] max-w-[180px] truncate">{ret.reason}</td>
                      <td className="px-4 py-3 font-mono font-bold text-rose-400">
                        {store?.currencySymbol}{ret.refundTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{ret.employeeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Return Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Product Return Processing"
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs text-rose-300">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Confirm Return Action</span>
            </div>
            <p className="text-[11px] text-slate-300">
              This will restore stock for the returned items and permanently log the return to the immutable audit trail under invoice <strong className="text-white">{foundTx?.invoiceNumber}</strong>.
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            {itemsToReturn.map(item => (
              <div key={item.id} className="flex justify-between py-0.5">
                <div>
                  <span>{item.name} × {item.returnQty}</span>
                  {item.discountPercent > 0 && (
                    <span className="text-[10px] text-emerald-400 ml-1 font-mono">
                      ({item.discountPercent}% Disc: -{store?.currencySymbol}{(item.unitDiscount * item.returnQty).toFixed(2)})
                    </span>
                  )}
                </div>
                <span className="font-mono text-rose-400">{store?.currencySymbol}{(item.netUnitPrice * item.returnQty).toFixed(2)}</span>
              </div>
            ))}
            {totalDiscountDeducted > 0 && (
              <div className="flex justify-between text-[11px] text-emerald-400 pt-1 border-t border-slate-800">
                <span>Original Invoice Discount ({foundTx?.discount}%):</span>
                <span className="font-mono">-{store?.currencySymbol}{totalDiscountDeducted.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-800 text-white">
              <span>Total {returnType === 'REFUND' ? 'Refund' : 'Exchange Credit'}:</span>
              <span className="font-mono text-rose-400">{store?.currencySymbol}{refundTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Return & Restore Stock</span>
          </button>
        </form>
      </Modal>

      {/* Return Receipt Modal */}
      <Modal
        isOpen={isReturnReceiptOpen}
        onClose={() => setIsReturnReceiptOpen(false)}
        title="Return Receipt Voucher"
        maxWidth="max-w-lg"
      >
        {completedReturn && (
          <div className="space-y-4">
            <div id="printable-return-voucher" className="p-4 bg-white text-slate-900 rounded-xl font-sans text-xs shadow-md border border-slate-300 space-y-3">
              <div className="text-center border-b border-slate-300 pb-3 space-y-1">
                <h2 className="font-bold text-base text-slate-900 uppercase tracking-wide">
                  {store?.storeName || 'Nexcart Retail Shop'}
                </h2>
                <div className="text-[10px] text-slate-600">{store?.address}</div>
                <div className="mt-1 font-bold text-rose-700 text-[11px]">*** RETURN / REFUND VOUCHER ***</div>
              </div>

              <div className="grid grid-cols-2 text-[10px] text-slate-700 py-1 border-b border-slate-200">
                <div>Return #: <strong>{completedReturn.returnNumber}</strong></div>
                <div className="text-right">Date: <strong>{new Date(completedReturn.timestamp).toLocaleDateString()}</strong></div>
                <div>Orig. Invoice: <strong>{completedReturn.originalInvoice}</strong></div>
                <div className="text-right">Type: <strong>{completedReturn.returnType}</strong></div>
                <div>Customer: <strong>{completedReturn.customer?.name}</strong></div>
                <div className="text-right">By: <strong>{completedReturn.employeeName}</strong></div>
              </div>

              <div className="text-[11px] text-slate-600 py-1 border-b border-slate-200">
                <span className="font-bold">Return Reason:</span> {completedReturn.reason}
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 text-[10px] uppercase">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Orig Price</th>
                    <th className="py-1 text-right">Discount</th>
                    <th className="py-1 text-right">Net Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedReturn.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium">{item.name}</td>
                      <td className="py-1.5 text-center font-mono">{item.returnQty}</td>
                      <td className="py-1.5 text-right font-mono">{store?.currencySymbol}{(item.originalPrice || item.salePrice).toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono text-emerald-700">
                        {item.discountPercent > 0 ? `-${item.discountPercent}% (-${store?.currencySymbol}${(item.unitDiscount * item.returnQty).toFixed(2)})` : '0%'}
                      </td>
                      <td className="py-1.5 text-right font-mono font-semibold text-rose-700">
                        -{store?.currencySymbol}{((item.netUnitPrice || item.salePrice) * item.returnQty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-300 pt-2 space-y-1 text-[11px]">
                {(completedReturn.totalDiscountDeducted || 0) > 0 && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Retail Value:</span>
                      <span className="font-mono">{store?.currencySymbol}{(completedReturn.grossTotalBeforeDiscount || completedReturn.refundTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Less Original Discount ({completedReturn.invoiceDiscountPercent || 0}%):</span>
                      <span className="font-mono">-{store?.currencySymbol}{completedReturn.totalDiscountDeducted.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                  <span>TOTAL REFUND AMOUNT:</span>
                  <span className="font-mono text-rose-700">-{store?.currencySymbol}{completedReturn.refundTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-slate-300 text-[10px] text-slate-500 space-y-0.5">
                <div>Stock has been automatically restored for returned items.</div>
                <div className="font-semibold text-sky-800">Designed & Powered by Nexcart Agency</div>
                <div className="text-[8px] text-slate-400">https://www.nexcart-agency.com/</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => printReceipt('printable-return-voucher')}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Return Voucher</span>
              </button>
              <button
                onClick={() => setIsReturnReceiptOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
