import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { printReceipt } from '../utils/printReceipt.js';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  DollarSign, 
  Printer,
  AlertTriangle
} from 'lucide-react';

export const InstallmentView = () => {
  const { store } = useAuth();

  // Installment plans state stored in localStorage
  const [plans, setPlans] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart_installment_plans');
      return stored ? JSON.parse(stored) : [
        {
          id: 'EMI-101',
          customerName: 'Muhammad Tariq',
          customerPhone: '03129876543',
          productName: 'Haier Inverter AC 1.5 Ton',
          totalAmount: 180000,
          downPayment: 40000,
          remainingBalance: 140000,
          monthlyInstallment: 14000,
          totalMonths: 10,
          paidMonths: 3,
          nextDueDate: '2026-10-15',
          status: 'ACTIVE',
          paymentsHistory: [
            { date: '2026-07-15', amount: 14000, receipt: 'REC-01' },
            { date: '2026-08-15', amount: 14000, receipt: 'REC-02' },
            { date: '2026-09-15', amount: 14000, receipt: 'REC-03' }
          ]
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
    productName: '',
    totalAmount: '',
    downPayment: '',
    months: '6'
  });

  const [paymentModalPlan, setPaymentModalPlan] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const savePlans = (updated) => {
    setPlans(updated);
    localStorage.setItem('nexcart_installment_plans', JSON.stringify(updated));
  };

  const handleCreatePlan = (e) => {
    e.preventDefault();
    const tot = Number(form.totalAmount || 0);
    const down = Number(form.downPayment || 0);
    const rem = Math.max(0, tot - down);
    const m = Number(form.months || 6);
    const monthly = Math.ceil(rem / m);

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    const newPlan = {
      id: `EMI-${Math.floor(100 + Math.random() * 900)}`,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      productName: form.productName,
      totalAmount: tot,
      downPayment: down,
      remainingBalance: rem,
      monthlyInstallment: monthly,
      totalMonths: m,
      paidMonths: 0,
      nextDueDate: nextDate.toISOString().split('T')[0],
      status: 'ACTIVE',
      paymentsHistory: []
    };

    const updated = [newPlan, ...plans];
    savePlans(updated);
    setIsModalOpen(false);
    setForm({ customerName: '', customerPhone: '', productName: '', totalAmount: '', downPayment: '', months: '6' });
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentModalPlan || !payAmount) return;

    const amt = Number(payAmount);
    const updated = plans.map(p => {
      if (p.id === paymentModalPlan.id) {
        const newRem = Math.max(0, p.remainingBalance - amt);
        const newPaidMonths = p.paidMonths + 1;

        const nextDate = new Date(p.nextDueDate);
        nextDate.setMonth(nextDate.getMonth() + 1);

        return {
          ...p,
          remainingBalance: newRem,
          paidMonths: newPaidMonths,
          status: newRem === 0 ? 'COMPLETED' : 'ACTIVE',
          nextDueDate: nextDate.toISOString().split('T')[0],
          paymentsHistory: [
            ...p.paymentsHistory,
            { date: new Date().toISOString().split('T')[0], amount: amt, receipt: `EMI-REC-${Date.now().toString().slice(-4)}` }
          ]
        };
      }
      return p;
    });

    savePlans(updated);
    setPaymentModalPlan(null);
    setPayAmount('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-400" />
            <span>Installment & Monthly EMI Schedule Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer installment contracts, down payments, and monthly payment collection receipts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Installment Contract</span>
        </button>
      </div>

      {/* Grid of active EMI Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-400 text-xs">{p.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.status === 'COMPLETED' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {p.status}
                </span>
              </div>

              <h3 className="font-bold text-white text-base mt-2">{p.productName}</h3>
              <div className="text-xs text-slate-300 font-semibold">{p.customerName} ({p.customerPhone})</div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Paid: {p.paidMonths}/{p.totalMonths} months</span>
                  <span className="text-indigo-400">{Math.round((p.paidMonths / p.totalMonths) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500" 
                    style={{ width: `${(p.paidMonths / p.totalMonths) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 mt-3 space-y-1">
                <div className="flex justify-between"><span>Total Price:</span><span className="font-mono">{store?.currencySymbol}{p.totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Down Payment:</span><span className="font-mono">{store?.currencySymbol}{p.downPayment.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-rose-400 pt-1 border-t border-slate-800">
                  <span>Remaining Bal:</span>
                  <span className="font-mono">{store?.currencySymbol}{p.remainingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sky-400">
                  <span>Monthly EMI:</span>
                  <span className="font-mono">{store?.currencySymbol}{p.monthlyInstallment.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400">
                Next Due: <strong className="text-amber-300">{p.nextDueDate}</strong>
              </span>

              {p.remainingBalance > 0 && (
                <button
                  onClick={() => {
                    setPaymentModalPlan(p);
                    setPayAmount(p.monthlyInstallment.toString());
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow"
                >
                  Receive EMI Payment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New EMI Plan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New EMI / Installment Contract">
        <form onSubmit={handleCreatePlan} className="space-y-3">
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

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Haier Inverter AC / iPhone 14 Pro Max"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Price ({store?.currencySymbol}) *</label>
              <input
                type="number"
                required
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Down Payment ({store?.currencySymbol}) *</label>
              <input
                type="number"
                required
                value={form.downPayment}
                onChange={(e) => setForm({ ...form, downPayment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tenure (Months) *</label>
              <select
                value={form.months}
                onChange={(e) => setForm({ ...form, months: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="10">10 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg"
          >
            Save Installment Contract
          </button>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={Boolean(paymentModalPlan)} onClose={() => setPaymentModalPlan(null)} title="Record Monthly EMI Installment">
        {paymentModalPlan && (
          <form onSubmit={handleRecordPayment} className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Contract: <strong className="text-white">{paymentModalPlan.id}</strong></div>
              <div>Product: <strong className="text-sky-300">{paymentModalPlan.productName}</strong></div>
              <div>Customer: <strong>{paymentModalPlan.customerName}</strong></div>
              <div className="text-rose-400 font-bold">Remaining Balance: {store?.currencySymbol}{paymentModalPlan.remainingBalance.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Amount Received ({store?.currencySymbol}) *</label>
              <input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg"
            >
              Record Payment & Update Contract
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
