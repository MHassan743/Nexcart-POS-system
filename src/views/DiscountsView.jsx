import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Percent, 
  Plus, 
  Tag, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Modal } from '../components/Modal.jsx';

export const DiscountsView = () => {
  const { store } = useAuth();
  const currency = store?.currencySymbol || 'Rs. ';

  const [discounts, setDiscounts] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDisc, setNewDisc] = useState({
    title: '',
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    minSubtotal: 1000,
    expiryDate: '2026-12-31'
  });

  const handleAddDiscount = (e) => {
    e.preventDefault();
    const created = {
      ...newDisc,
      id: `disc-${Date.now()}`,
      code: newDisc.code.toUpperCase().replace(/\s+/g, ''),
      value: parseFloat(newDisc.value) || 0,
      minSubtotal: parseFloat(newDisc.minSubtotal) || 0,
      status: 'Active'
    };
    setDiscounts([...discounts, created]);
    setIsAddModalOpen(false);
    setNewDisc({ title: '', code: '', type: 'PERCENTAGE', value: 10, minSubtotal: 1000, expiryDate: '2026-12-31' });
  };

  const handleDelete = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2.5">
            <Percent className="w-7 h-7 text-blue-400" />
            <span>Discounts & Promo Coupon Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated percentage discounts, flat subtotal vouchers, and promotional campaign codes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-glow-blue transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Offer</span>
        </button>
      </div>

      {/* Grid of Active Discounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {discounts.map((disc) => (
          <div key={disc.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs border border-blue-500/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {disc.code}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {disc.status}
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-base text-white mt-3">{disc.title}</h3>
              <div className="mt-2 font-mono font-extrabold text-3xl text-emerald-400">
                {disc.type === 'PERCENTAGE' ? `${disc.value}% OFF` : `${currency}${disc.value} OFF`}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Valid on orders above <strong className="text-slate-200">{currency}{disc.minSubtotal}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Calendar className="w-3 h-3 text-sky-400" /> Exp: {disc.expiryDate}
              </span>
              <button
                onClick={() => handleDelete(disc.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Promotional Discount Rule"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddDiscount} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Eid Festival Discount"
              value={newDisc.title}
              onChange={(e) => setNewDisc({ ...newDisc, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Promo Code *</label>
              <input
                type="text"
                required
                placeholder="EID2026"
                value={newDisc.code}
                onChange={(e) => setNewDisc({ ...newDisc, code: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Discount Type *</label>
              <select
                value={newDisc.type}
                onChange={(e) => setNewDisc({ ...newDisc, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Cash Amount ({currency})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Discount Value *</label>
              <input
                type="number"
                required
                placeholder="10"
                value={newDisc.value}
                onChange={(e) => setNewDisc({ ...newDisc, value: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Min Subtotal ({currency})</label>
              <input
                type="number"
                placeholder="1000"
                value={newDisc.minSubtotal}
                onChange={(e) => setNewDisc({ ...newDisc, minSubtotal: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Expiry Date</label>
            <input
              type="date"
              value={newDisc.expiryDate}
              onChange={(e) => setNewDisc({ ...newDisc, expiryDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue"
          >
            Create Promo Offer
          </button>
        </form>
      </Modal>
    </div>
  );
};
