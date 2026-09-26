import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  FileText, 
  CreditCard,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Modal } from '../components/Modal.jsx';

export const SuppliersView = () => {
  const { store } = useAuth();
  const currency = store?.currencySymbol || 'Rs. ';

  const [suppliers, setSuppliers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  // Form State
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'General'
  });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const totalPayables = suppliers.reduce((acc, s) => acc + s.payableBalance, 0);

  const handleAddSupplier = (e) => {
    e.preventDefault();
    const created = {
      ...newSupplier,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
      totalPaid: 0,
      payableBalance: 0,
      lastOrderDate: new Date().toISOString().split('T')[0]
    };
    setSuppliers([created, ...suppliers]);
    setIsAddModalOpen(false);
    setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '', category: 'General' });
  };

  const handlePaySupplier = (e) => {
    e.preventDefault();
    const amt = parseFloat(payAmount) || 0;
    if (amt <= 0 || !selectedSupplier) return;

    setSuppliers(suppliers.map(s => {
      if (s.id === selectedSupplier.id) {
        const newPaid = s.totalPaid + amt;
        const newPayable = Math.max(0, s.payableBalance - amt);
        return { ...s, totalPaid: newPaid, payableBalance: newPayable };
      }
      return s;
    }));

    setIsPayModalOpen(false);
    setSelectedSupplier(null);
    setPayAmount('');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-indigo-400" />
            <span>Suppliers & Payables Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage vendor accounts, purchase ledgers, and clear supplier payable balances.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-glow-blue transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Payable Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Active Suppliers</div>
            <div className="font-heading font-extrabold text-2xl text-white mt-1">{suppliers.length} Vendors</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Supplier Payables</div>
            <div className="font-heading font-extrabold text-2xl text-rose-400 mt-1">{currency}{totalPayables.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Supplier Payment Status</div>
            <div className="font-heading font-extrabold text-2xl text-emerald-400 mt-1">
              {suppliers.filter(s => s.payableBalance === 0).length} Cleared
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search suppliers by company, person name, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Supplier Company</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Total Purchases</th>
                <th className="p-4">Payable Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>{sup.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{sup.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{sup.contactPerson}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-sky-400" />{sup.phone}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{sup.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700">
                      {sup.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-semibold text-slate-200">
                    {currency}{sup.totalPurchases.toLocaleString()}
                  </td>
                  <td className="p-4">
                    {sup.payableBalance > 0 ? (
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        {currency}{sup.payableBalance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        Fully Cleared
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSupplier(sup);
                        setPayAmount(sup.payableBalance.toString());
                        setIsPayModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Vendor / Supplier"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Company / Firm Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. National Distributors Ltd"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contact Representative</label>
              <input
                type="text"
                placeholder="e.g. Muhammad Ali"
                value={newSupplier.contactPerson}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+92 300 0000000"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
            <input
              type="email"
              placeholder="vendor@company.com"
              value={newSupplier.email}
              onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Office / Warehouse Address</label>
            <textarea
              rows={2}
              placeholder="Full address details..."
              value={newSupplier.address}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue"
          >
            Save Supplier Record
          </button>
        </form>
      </Modal>

      {/* Pay Supplier Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Clear Supplier Payable - ${selectedSupplier?.name}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handlePaySupplier} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
            <div className="text-slate-400">Current Payable Outstanding:</div>
            <div className="font-mono font-bold text-rose-400 text-lg">
              {currency}{selectedSupplier?.payableBalance.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Amount ({currency}) *</label>
            <input
              type="number"
              required
              min={1}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-base font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald"
          >
            Confirm Payable Clearance
          </button>
        </form>
      </Modal>
    </div>
  );
};
