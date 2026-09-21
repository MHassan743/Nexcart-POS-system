import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { Users, CreditCard, DollarSign, Plus, Search, CheckCircle2, History } from 'lucide-react';

export const CustomersView = () => {
  const { store } = useAuth();
  const { customers, handleSaveCustomer, handleRecordKhaataPayment } = usePOS();
  const [search, setSearch] = useState('');

  // Payment Collection Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeCust, setActiveCust] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  // Add / Edit Customer Modal State
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [editingCust, setEditingCust] = useState(null);
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '', creditBalance: '' });

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  const totalOutstandingKhaata = customers.reduce((acc, c) => acc + (c.creditBalance || 0), 0);

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!activeCust || !payAmount) return;
    handleRecordKhaataPayment(activeCust.id, payAmount);
    setIsPayModalOpen(false);
    setActiveCust(null);
    setPayAmount('');
  };

  const handleOpenAdd = () => {
    setEditingCust(null);
    setCustForm({ name: '', phone: '', email: '', creditBalance: '' });
    setIsAddCustOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCust(c);
    setCustForm({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      creditBalance: c.creditBalance || 0
    });
    setIsAddCustOpen(true);
  };

  const handleSaveCustSubmit = (e) => {
    e.preventDefault();
    if (!custForm.name) return;
    handleSaveCustomer({
      id: editingCust ? editingCust.id : `cust-${Date.now()}`,
      name: custForm.name,
      phone: custForm.phone || 'N/A',
      email: custForm.email || 'N/A',
      creditBalance: Number(custForm.creditBalance) || 0,
      totalSpent: editingCust ? (editingCust.totalSpent || 0) : 0
    });
    setIsAddCustOpen(false);
    setEditingCust(null);
    setCustForm({ name: '', phone: '', email: '', creditBalance: '' });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-400" />
            <span>Customer Accounts & Khaata Credit Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track repeat buyers, gift registries, and outstanding debt balances ("Khaata") per invoice.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Registered Customers</div>
          <div className="font-heading font-extrabold text-2xl text-white mt-1">
            {customers.length} Accounts
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Total Outstanding Debt (Khaata)</div>
          <div className="font-heading font-extrabold text-2xl text-amber-300 mt-1">
            {store?.currencySymbol}{totalOutstandingKhaata.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Remaining bill balances to be collected</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default Debt Balance Rule</div>
          <div className="font-heading font-semibold text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>0.00 when bill is paid in full</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search customer by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Customer List Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Total Lifetime Spent</th>
                <th className="px-4 py-3">Khaata Credit Balance (Debt)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.phone} | {c.email || 'N/A'}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                    {store?.currencySymbol}{(c.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {c.creditBalance > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 badge-pulse-red">
                        {store?.currencySymbol}{c.creditBalance.toFixed(2)} Outstanding
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        {store?.currencySymbol}0.00 (Clear)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-all"
                        title="Edit Customer Profile & Balance"
                      >
                        Edit Profile / Balance
                      </button>

                      {c.creditBalance > 0 && (
                        <button
                          onClick={() => {
                            setActiveCust(c);
                            setPayAmount(c.creditBalance.toFixed(2));
                            setIsPayModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect Payment</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Receive Khaata Payment: ${activeCust?.name}`}
      >
        <form onSubmit={handlePaySubmit} className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex justify-between">
            <span>Outstanding Balance:</span>
            <strong className="text-amber-400 font-mono">{store?.currencySymbol}{activeCust?.creditBalance?.toFixed(2)}</strong>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Amount Collected ({store?.currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg"
          >
            Record Payment & Clear Debt
          </button>
        </form>
      </Modal>

      {/* Add / Edit Customer Profile & Khaata Balance Modal */}
      <Modal
        isOpen={isAddCustOpen}
        onClose={() => setIsAddCustOpen(false)}
        title={editingCust ? `Edit Customer Profile & Balance` : "Add New Customer Account"}
      >
        <form onSubmit={handleSaveCustSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              value={custForm.name}
              onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={custForm.phone}
              onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={custForm.email}
              onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Previous Balance / Khaata Debt Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Previous Balance / Khaata Debt ({store?.currencySymbol})</span>
              <span className="text-[10px] text-amber-400 font-bold">Outstanding Debt</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={custForm.creditBalance}
              onChange={(e) => setCustForm({ ...custForm, creditBalance: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Shopkeeper can manually enter or update the customer's previous outstanding balance here.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky"
          >
            {editingCust ? 'Save Customer Changes' : 'Create Customer Profile'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
