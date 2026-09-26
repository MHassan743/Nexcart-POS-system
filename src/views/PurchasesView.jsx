import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Truck, 
  FileCheck, 
  Calendar, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  Barcode 
} from 'lucide-react';

export const PurchasesView = () => {
  const { store } = useAuth();
  const { products, setProducts } = usePOS();
  const currency = store?.currencySymbol || 'Rs. ';

  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('PharmaCare Wholesalers Ltd');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Line Item Input Form
  const [selectedProdId, setSelectedProdId] = useState('');
  const [qty, setQty] = useState(1);
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [purchaseHistory, setPurchaseHistory] = useState([
    {
      id: 'pur-101',
      invoiceNo: 'INV-PH-9921',
      supplier: 'PharmaCare Wholesalers Ltd',
      date: '2026-09-24',
      totalCost: 125000,
      itemCount: 4,
      status: 'Received & Stocked'
    }
  ]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProdId) return;

    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    const costVal = parseFloat(purchaseCost) || prod.costPrice || (prod.price * 0.7);
    const sellVal = parseFloat(sellingPrice) || prod.price;

    const item = {
      productId: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      qty: parseInt(qty) || 1,
      costPrice: costVal,
      sellingPrice: sellVal,
      batchNo: batchNo || 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
      expiryDate: expiryDate || '',
      lineTotal: costVal * (parseInt(qty) || 1)
    };

    setPurchaseItems([...purchaseItems, item]);
    setSelectedProdId('');
    setQty(1);
    setPurchaseCost('');
    setSellingPrice('');
    setBatchNo('');
    setExpiryDate('');
  };

  const handleRemoveItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const grandTotalCost = purchaseItems.reduce((acc, item) => acc + item.lineTotal, 0);

  const handleSubmitPurchase = (e) => {
    e.preventDefault();
    if (purchaseItems.length === 0) return alert('Please add at least one product item to purchase receipt.');
    if (!supplierInvoiceNo) return alert('Please enter Supplier Invoice / GRN Bill Number.');

    // Auto-update Product Stock In Context
    const updatedProducts = products.map(p => {
      const match = purchaseItems.find(item => item.productId === p.id);
      if (match) {
        return {
          ...p,
          stock: (p.stock || 0) + match.qty,
          costPrice: match.costPrice,
          price: match.sellingPrice,
          batchNo: match.batchNo || p.batchNo,
          expiryDate: match.expiryDate || p.expiryDate
        };
      }
      return p;
    });

    if (setProducts) setProducts(updatedProducts);

    const record = {
      id: `pur-${Date.now()}`,
      invoiceNo: supplierInvoiceNo,
      supplier: selectedSupplier,
      date: purchaseDate,
      totalCost: grandTotalCost,
      itemCount: purchaseItems.reduce((acc, i) => acc + i.qty, 0),
      status: 'Received & Stocked'
    };

    setPurchaseHistory([record, ...purchaseHistory]);
    setPurchaseItems([]);
    setSupplierInvoiceNo('');
    alert(`Purchase GRN ${supplierInvoiceNo} recorded successfully! Inventory stock has been updated.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-blue-400" />
            <span>New Purchase (GRN / Stock Receiving)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Receive inward stock from suppliers, update purchase cost prices, and allocate batch/expiry tags.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Purchase Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Invoice Header Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Supplier & Invoice Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="PharmaCare Wholesalers Ltd">PharmaCare Wholesalers Ltd</option>
                  <option value="Nestle Pakistan Distribution">Nestle Pakistan Distribution</option>
                  <option value="Crown Electronics & Mobile Supply">Crown Electronics & Mobile Supply</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Supplier Bill / GRN No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GRN-99821"
                  value={supplierInvoiceNo}
                  onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Receiving Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Line Item Entry Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Add Stock Items</span>
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Product *</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="">-- Search & Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.barcode || 'No Code'}) - Current Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity Inward *</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Purchase Unit Cost ({currency})</label>
                  <input
                    type="number"
                    placeholder="Unit Cost"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Selling Retail Price ({currency})</label>
                  <input
                    type="number"
                    placeholder="Retail Price"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Batch / Lot No</label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-2026-X"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Expiry Date (if any)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Item to Purchase Receipt</span>
              </button>
            </form>
          </div>

          {/* Table of Added Line Items */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Items In Purchase Order ({purchaseItems.length})</span>
              <span className="text-emerald-400 font-mono font-bold">{currency}{grandTotalCost.toLocaleString()}</span>
            </h3>

            {purchaseItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No items added yet. Select a product above to build your inward purchase order.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Product Item</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Cost Price</th>
                      <th className="p-3">Selling Price</th>
                      <th className="p-3">Batch / Expiry</th>
                      <th className="p-3">Line Total</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {purchaseItems.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3 font-bold text-white">{item.name}</td>
                        <td className="p-3 font-mono font-bold text-sky-400">{item.qty}</td>
                        <td className="p-3 font-mono text-emerald-400">{currency}{item.costPrice}</td>
                        <td className="p-3 font-mono text-slate-300">{currency}{item.sellingPrice}</td>
                        <td className="p-3 text-[10px] font-mono text-slate-400">
                          <div>{item.batchNo}</div>
                          {item.expiryDate && <div className="text-amber-400">Exp: {item.expiryDate}</div>}
                        </td>
                        <td className="p-3 font-mono font-bold text-white">{currency}{item.lineTotal.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Summary & Purchase Log */}
        <div className="space-y-6">
          {/* Submit GRN Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
              Purchase Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Supplier:</span>
                <span className="font-semibold text-white">{selectedSupplier}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Bill Number:</span>
                <span className="font-mono text-white">{supplierInvoiceNo || 'Not entered'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Items Count:</span>
                <span className="font-mono text-white">{purchaseItems.reduce((acc, i) => acc + i.qty, 0)} Units</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm">
                <span className="text-slate-200">Grand Total Cost:</span>
                <span className="text-emerald-400 font-mono text-lg">{currency}{grandTotalCost.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSubmitPurchase}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirm Stock Entry & Update Inventory</span>
            </button>
          </div>

          {/* Past Purchase Receipts Log */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
              Recent Purchase GRNs
            </h3>

            <div className="space-y-3">
              {purchaseHistory.map(ph => (
                <div key={ph.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>{ph.invoiceNo}</span>
                    <span className="text-emerald-400 font-mono">{currency}{ph.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{ph.supplier}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>{ph.date} • {ph.itemCount} items</span>
                    <span className="text-emerald-400 font-semibold">{ph.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
