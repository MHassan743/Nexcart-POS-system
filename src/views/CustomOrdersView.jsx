import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { printReceipt } from '../utils/printReceipt.js';
import { 
  Cake, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Printer, 
  DollarSign,
  PackageCheck
} from 'lucide-react';

export const CustomOrdersView = () => {
  const { store } = useAuth();

  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart_custom_orders');
      return stored ? JSON.parse(stored) : [
        {
          id: 'ORD-501',
          customerName: 'Zainab Bibi',
          customerPhone: '03335551234',
          orderType: 'Bakery 3-Tier Birthday Cake', // Bakery, Tailoring, Crockery Set, Hardware
          details: 'Chocolate Fudge 5lbs with custom edible picture & gold pearls',
          deliveryDate: '2026-10-10',
          totalAmount: 12000,
          advancePaid: 4000,
          remainingBalance: 8000,
          status: 'PENDING_PRODUCTION', // PENDING_PRODUCTION, READY_FOR_PICKUP, DELIVERED
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    orderType: 'Bakery Custom Cake',
    details: '',
    deliveryDate: '',
    totalAmount: '',
    advancePaid: ''
  });

  const saveOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem('nexcart_custom_orders', JSON.stringify(updated));
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const tot = Number(form.totalAmount || 0);
    const adv = Number(form.advancePaid || 0);
    const rem = Math.max(0, tot - adv);

    const newOrd = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      orderType: form.orderType,
      details: form.details,
      deliveryDate: form.deliveryDate || new Date().toISOString().split('T')[0],
      totalAmount: tot,
      advancePaid: adv,
      remainingBalance: rem,
      status: 'PENDING_PRODUCTION',
      createdAt: new Date().toISOString()
    };

    const updated = [newOrd, ...orders];
    saveOrders(updated);
    setIsModalOpen(false);
    setForm({ customerName: '', customerPhone: '', orderType: 'Bakery Custom Cake', details: '', deliveryDate: '', totalAmount: '', advancePaid: '' });
  };

  const handleUpdateStatus = (ordId, newStatus) => {
    const updated = orders.map(o => o.id === ordId ? { ...o, status: newStatus } : o);
    saveOrders(updated);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Cake className="w-7 h-7 text-amber-400" />
            <span>Custom Advance Orders & Production Booking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Book advance custom orders for Bakery Cakes, Tailoring, Crockery sets & Hardware special orders.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Book Custom Order</span>
        </button>
      </div>

      {/* Grid of Custom Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(ord => (
          <div key={ord.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400 text-xs">{ord.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ord.status === 'DELIVERED' ? 'bg-slate-800 text-slate-400' :
                  ord.status === 'READY_FOR_PICKUP' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                }`}>
                  {ord.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h3 className="font-bold text-white text-base mt-2">{ord.orderType}</h3>
              <div className="text-xs text-slate-300 font-semibold">{ord.customerName} ({ord.customerPhone})</div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 mt-3 space-y-1.5">
                <div><strong>Customization Specs:</strong> <span className="text-amber-200">{ord.details}</span></div>
                <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-800">
                  <span>Due Date: <strong className="text-sky-300">{ord.deliveryDate}</strong></span>
                  <span>Total: <strong className="text-white">{store?.currencySymbol}{ord.totalAmount.toFixed(2)}</strong></span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Advance Paid: <strong className="text-emerald-400">{store?.currencySymbol}{ord.advancePaid.toFixed(2)}</strong></span>
                  <span>Bal Due: <strong className="text-rose-400">{store?.currencySymbol}{ord.remainingBalance.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <select
                value={ord.status}
                onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-white border border-slate-700 focus:outline-none"
              >
                <option value="PENDING_PRODUCTION">Pending Production</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="DELIVERED">Delivered & Closed</option>
              </select>

              <button
                onClick={() => printReceipt(ord.id, `Order_${ord.id}`)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Print Order Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Custom Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book New Custom Order / Advance Deposit">
        <form onSubmit={handleCreateOrder} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Phone *</label>
              <input
                type="text"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Order Category *</label>
              <select
                value={form.orderType}
                onChange={(e) => setForm({ ...form, orderType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="Bakery Custom Cake">🎂 Bakery Custom Cake</option>
                <option value="Tailoring & Dress Stitching">👔 Tailoring & Stitching</option>
                <option value="Crockery Special Gift Set">🍽️ Crockery Custom Set</option>
                <option value="Hardware Special Order">🔧 Hardware Special Supply</option>
                <option value="Jewelry Custom Gold Order">💍 Jewelry Custom Order</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Delivery / Due Date *</label>
              <input
                type="date"
                required
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customization Details & Instructions *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. 5lbs Chocolate cake with name 'Happy Birthday Bilal'..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Agreed Price ({store?.currencySymbol}) *</label>
              <input
                type="number"
                required
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Advance Received ({store?.currencySymbol}) *</label>
              <input
                type="number"
                required
                value={form.advancePaid}
                onChange={(e) => setForm({ ...form, advancePaid: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg"
          >
            Save Custom Booking
          </button>
        </form>
      </Modal>
    </div>
  );
};
