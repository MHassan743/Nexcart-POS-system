import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldAlert, 
  Printer, 
  Truck, 
  FileText, 
  Lock, 
  Sparkles,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';

export const InventoryView = () => {
  const { store, user } = useAuth();
  const { products, handleSaveProduct, handleDeleteProduct, handleStockIn, handleManualStockAdjust } = usePOS();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'Plates & Dishes',
    sku: '',
    barcode: '',
    costPrice: '',
    salePrice: '',
    stockQuantity: '',
    reorderThreshold: 10,
    unit: 'Pcs',
    supplier: '',
    image: '',
    batchNumber: '',
    expiryDate: '',
    imeiNumber: ''
  });

  // Stock In Modal State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState('');
  const [stockInCost, setStockInCost] = useState('');
  const [stockInSupplier, setStockInSupplier] = useState('');

  // Manual Stock Adjustment Modal State (Strictly Manager/Owner with Mandatory Reason)
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [mandatoryReason, setMandatoryReason] = useState('');
  const [reasonCategory, setReasonCategory] = useState('Breakage / Damage');

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(search.toLowerCase()) || 
                       p.sku.toLowerCase().includes(search.toLowerCase()) ||
                       (p.batchNumber && p.batchNumber.toLowerCase().includes(search.toLowerCase())) ||
                       (p.imeiNumber && p.imeiNumber.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchQuery && matchCat;
  });

  // Open Add/Edit Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: categories[1] || 'General',
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      barcode: `501${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      costPrice: '10.00',
      salePrice: '25.00',
      stockQuantity: '30',
      reorderThreshold: 10,
      unit: 'Pcs',
      supplier: '',
      image: '',
      batchNumber: '',
      expiryDate: '',
      imeiNumber: ''
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      category: p.category,
      sku: p.sku,
      barcode: p.barcode || '',
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      stockQuantity: p.stockQuantity,
      reorderThreshold: p.reorderThreshold || 10,
      unit: p.unit || 'Pcs',
      supplier: p.supplier || '',
      image: p.image || '',
      batchNumber: p.batchNumber || '',
      expiryDate: p.expiryDate || '',
      imeiNumber: p.imeiNumber || ''
    });
    setIsAddEditOpen(true);
  };

  // Handle image file upload (file chooser or camera capture)
  const handleImageFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setProdForm(prev => ({ ...prev, image: evt.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Add/Edit Product
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    const productPayload = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: prodForm.name,
      category: prodForm.category,
      sku: prodForm.sku,
      barcode: prodForm.barcode,
      costPrice: Number(prodForm.costPrice),
      salePrice: Number(prodForm.salePrice),
      stockQuantity: Number(prodForm.stockQuantity),
      reorderThreshold: Number(prodForm.reorderThreshold),
      unit: prodForm.unit,
      supplier: prodForm.supplier,
      image: prodForm.image,
      batchNumber: prodForm.batchNumber,
      expiryDate: prodForm.expiryDate,
      imeiNumber: prodForm.imeiNumber
    };

    handleSaveProduct(productPayload);
    setIsAddEditOpen(false);
  };

  // Submit Stock In
  const handleSubmitStockIn = (e) => {
    e.preventDefault();
    if (!stockInProduct || !stockInQty) return;
    handleStockIn(stockInProduct.id, stockInQty, stockInCost, stockInSupplier);
    setIsStockInOpen(false);
    setStockInProduct(null);
    setStockInQty('');
  };

  // Submit Manual Stock Adjustment
  const handleSubmitAdjustment = (e) => {
    e.preventDefault();
    if (!adjustProduct || !newStockVal || !mandatoryReason) {
      alert('Mandatory reason and new stock value are required!');
      return;
    }
    const fullReason = `[${reasonCategory}] ${mandatoryReason}`;
    handleManualStockAdjust(adjustProduct.id, newStockVal, fullReason);
    setIsAdjustOpen(false);
    setAdjustProduct(null);
    setNewStockVal('');
    setMandatoryReason('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Package className="w-7 h-7 text-sky-400" />
            <span>Inventory Catalog & Stock Tracking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time itemized stock, supplier receiving, and anti-leakage audit adjustment logs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter inventory by item name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-inner"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          {categories.map(c => (
            <option key={c} value={c}>Category: {c}</option>
          ))}
        </select>
      </div>

      {/* Inventory Catalog Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Cost Price</th>
                <th className="px-4 py-3">Sale Price</th>
                <th className="px-4 py-3">Live Stock</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Actions & Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProducts.map(p => {
                const isLow = p.stockQuantity <= (p.reorderThreshold || 10);
                const isOut = p.stockQuantity <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-sky-400 text-xs">{p.name.slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5 flex-wrap">
                            <span>{p.name}</span>
                            {p.expiryDate && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Exp: {p.expiryDate}
                              </span>
                            )}
                            {p.batchNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                Batch: {p.batchNumber}
                              </span>
                            )}
                            {p.imeiNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                IMEI/SN: {p.imeiNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} | Barcode: {p.barcode}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-300">{p.category}</td>

                    <td className="px-4 py-3 font-mono text-slate-400">
                      {store?.currencySymbol}{p.costPrice.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-sky-400">
                      {store?.currencySymbol}{p.salePrice.toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isOut 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                          : isLow 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 badge-pulse-red' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {p.stockQuantity} {p.unit || 'units'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {p.supplier || 'N/A'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Supplier Stock In */}
                        <button
                          onClick={() => {
                            setStockInProduct(p);
                            setStockInQty('');
                            setStockInCost(p.costPrice);
                            setStockInSupplier(p.supplier);
                            setIsStockInOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1"
                          title="Receive Supplier Shipment"
                        >
                          <Truck className="w-3 h-3" />
                          <span>+ Stock In</span>
                        </button>

                        {/* Manual Stock Adjust (Strict Manager Reason Required) */}
                        <button
                          onClick={() => {
                            setAdjustProduct(p);
                            setNewStockVal(p.stockQuantity);
                            setMandatoryReason('');
                            setIsAdjustOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-all flex items-center gap-1"
                          title="Manual Adjustment with Mandatory Audit Reason"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>

                        {/* Edit & Delete */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800"
                          title="Edit Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${p.name}?`)) {
                              handleDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}

      {/* 1. Add / Edit Product Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingProduct ? 'Edit Product Catalog Item' : 'Add New Product to Inventory'}
      >
        <form onSubmit={handleSubmitProduct} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={prodForm.name}
              onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={prodForm.category}
                onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={prodForm.sku}
                onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cost Price ({store?.currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                required
                value={prodForm.costPrice}
                onChange={(e) => setProdForm({ ...prodForm, costPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Selling Price ({store?.currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={prodForm.salePrice}
                onChange={(e) => setProdForm({ ...prodForm, salePrice: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stock Qty</label>
              <input
                type="number"
                required
                value={prodForm.stockQuantity}
                onChange={(e) => setProdForm({ ...prodForm, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Low-Stock Alert Level</label>
              <input
                type="number"
                value={prodForm.reorderThreshold}
                onChange={(e) => setProdForm({ ...prodForm, reorderThreshold: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Industry Specific Fields: Pharmacy (Batch, Expiry) & Electronics (IMEI/Serial) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
              Industry Special Attributes (Optional)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Batch / Lot # (Pharmacy)</label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-9021"
                  value={prodForm.batchNumber}
                  onChange={(e) => setProdForm({ ...prodForm, batchNumber: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Expiry Date (Pharmacy)</label>
                <input
                  type="date"
                  value={prodForm.expiryDate}
                  onChange={(e) => setProdForm({ ...prodForm, expiryDate: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">IMEI / Serial # (Mobile)</label>
                <input
                  type="text"
                  placeholder="e.g. 86492019..."
                  value={prodForm.imeiNumber}
                  onChange={(e) => setProdForm({ ...prodForm, imeiNumber: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Supplier Name</label>
            <input
              type="text"
              value={prodForm.supplier}
              onChange={(e) => setProdForm({ ...prodForm, supplier: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Product Photo Upload / Camera Capture */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-sky-400">
                <ImageIcon className="w-4 h-4" />
                <span>Product Photo / Image</span>
              </span>
              {prodForm.image && (
                <button
                  type="button"
                  onClick={() => setProdForm(prev => ({ ...prev, image: '' }))}
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </label>

            {/* Thumbnail Preview */}
            {prodForm.image ? (
              <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center">
                <img src={prodForm.image} alt="Preview" className="h-full object-contain" />
              </div>
            ) : (
              <div className="text-center py-3 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 text-slate-400 text-xs">
                No product photo attached
              </div>
            )}

            {/* Action Buttons: Choose File & Camera Capture */}
            <div className="grid grid-cols-2 gap-2">
              <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
              </label>

              <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image URL fallback */}
            <input
              type="url"
              placeholder="Or paste image URL (e.g. https://...)"
              value={prodForm.image && !prodForm.image.startsWith('data:') ? prodForm.image : ''}
              onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky"
          >
            Save Product to Catalog
          </button>
        </form>
      </Modal>

      {/* 2. Stock In Supplier Modal */}
      <Modal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        title={`Receive Stock Shipment: ${stockInProduct?.name}`}
      >
        <form onSubmit={handleSubmitStockIn} className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex justify-between">
            <span>Current Stock: <strong className="text-white">{stockInProduct?.stockQuantity} units</strong></span>
            <span>SKU: <strong className="text-sky-300">{stockInProduct?.sku}</strong></span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Units Received (+ Qty)</label>
            <input
              type="number"
              required
              min="1"
              value={stockInQty}
              onChange={(e) => setStockInQty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Unit Cost Price ({store?.currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              value={stockInCost}
              onChange={(e) => setStockInCost(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Supplier Name</label>
            <input
              type="text"
              value={stockInSupplier}
              onChange={(e) => setStockInSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Confirm Stock Receiving & Log Audit</span>
          </button>
        </form>
      </Modal>

      {/* 3. Manual Stock Adjustment (Manager/Owner Mandatory Audit Reason) */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Manual Stock Adjustment (Audit Logged)"
      >
        <form onSubmit={handleSubmitAdjustment} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Anti-Leakage Security Protocol</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Manual stock overrides are permanently written to the read-only audit log with timestamp, manager ID, and reason.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">New Physical Stock Count</label>
            <input
              type="number"
              required
              value={newStockVal}
              onChange={(e) => setNewStockVal(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Adjustment Category *</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Breakage / Damage">Breakage / Damage</option>
              <option value="Physical Theft Loss">Physical Theft Loss</option>
              <option value="Supplier Miscount">Supplier Miscount</option>
              <option value="Expired / Defective">Expired / Defective</option>
              <option value="Stock Audit Reconciliation">Stock Audit Reconciliation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mandatory Audit Explanation / Details *</label>
            <textarea
              required
              rows={3}
              placeholder="Detailed explanation (e.g. 2 ceramic plates dropped by employee, verified on camera)..."
              value={mandatoryReason}
              onChange={(e) => setMandatoryReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Adjustment to Immutable Audit Trail</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
