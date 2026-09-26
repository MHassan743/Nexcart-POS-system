import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  UserCheck, 
  Plus, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Phone, 
  CheckCircle2, 
  Percent 
} from 'lucide-react';
import { Modal } from '../components/Modal.jsx';

export const SalesmenView = () => {
  const { store } = useAuth();
  const { transactions } = usePOS();
  const currency = store?.currencySymbol || 'Rs. ';

  const [salesmen, setSalesmen] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSalesman, setNewSalesman] = useState({
    name: '',
    phone: '',
    role: 'Counter Sales Representative',
    commissionRate: 2.0
  });

  const totalVolume = salesmen.reduce((acc, s) => acc + s.totalSalesVolume, 0);
  const totalCommission = salesmen.reduce((acc, s) => acc + s.totalCommissionEarned, 0);

  const handleAddSalesman = (e) => {
    e.preventDefault();
    const created = {
      ...newSalesman,
      id: `sal-${Date.now()}`,
      commissionRate: parseFloat(newSalesman.commissionRate) || 0,
      totalSalesVolume: 0,
      totalCommissionEarned: 0,
      status: 'Active'
    };
    setSalesmen([...salesmen, created]);
    setIsAddModalOpen(false);
    setNewSalesman({ name: '', phone: '', role: 'Counter Sales Representative', commissionRate: 2.0 });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-sky-400" />
            <span>Salesmen & Staff Commission Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign counter sales staff to checkout tickets and calculate monthly commission payouts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-glow-blue transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Salesman</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Active Salesmen</div>
            <div className="font-heading font-extrabold text-2xl text-white mt-1">{salesmen.length} Representatives</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Sales Generated</div>
            <div className="font-heading font-extrabold text-2xl text-emerald-400 mt-1">{currency}{totalVolume.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Commission Payable</div>
            <div className="font-heading font-extrabold text-2xl text-amber-400 mt-1">{currency}{totalCommission.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Salesman Name</th>
                <th className="p-4">Role / Title</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Commission % Rate</th>
                <th className="p-4">Total Sales Volume</th>
                <th className="p-4">Earned Commission</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {salesmen.map((sal) => (
                <tr key={sal.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>{sal.name}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-300">{sal.role}</td>
                  <td className="p-4 font-mono text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> {sal.phone}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs border border-blue-500/30">
                      {sal.commissionRate}%
                    </span>
                  </td>
                  <td className="p-4 font-mono font-semibold text-emerald-400">
                    {currency}{sal.totalSalesVolume.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-400">
                    {currency}{sal.totalCommissionEarned.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      {sal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Salesman Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Counter Salesman Representative"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSalesman} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Muhammad Usman"
              value={newSalesman.name}
              onChange={(e) => setNewSalesman({ ...newSalesman, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone Number *</label>
            <input
              type="text"
              required
              placeholder="+92 300 0000000"
              value={newSalesman.phone}
              onChange={(e) => setNewSalesman({ ...newSalesman, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Role Title</label>
              <input
                type="text"
                placeholder="e.g. Sales Executive"
                value={newSalesman.role}
                onChange={(e) => setNewSalesman({ ...newSalesman, role: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Commission % Rate *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="2.0"
                value={newSalesman.commissionRate}
                onChange={(e) => setNewSalesman({ ...newSalesman, commissionRate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue"
          >
            Save Salesman Profile
          </button>
        </form>
      </Modal>
    </div>
  );
};
