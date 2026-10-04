import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { printReceipt, printJobCardReceipt } from '../utils/printReceipt.js';
import { 
  ShieldCheck, 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Printer, 
  AlertTriangle,
  User
} from 'lucide-react';

export const WarrantyView = () => {
  const { store } = useAuth();
  const { transactions } = usePOS();

  const [searchIMEI, setSearchIMEI] = useState('');
  const [activeTab, setActiveTab] = useState('REPAIR'); // 'REPAIR' or 'WARRANTY'

  // Service / Repair Job Cards State (stored in localStorage)
  const [jobCards, setJobCards] = useState(() => {
    try {
      const data = localStorage.getItem('nexcart_job_cards');
      return data ? JSON.parse(data) : [
        {
          id: 'JOB-9001',
          customerName: 'Usman Ali',
          customerPhone: '03001234567',
          deviceModel: 'iPhone 13 Pro',
          imei: '358920192830192',
          issue: 'Screen cracked & battery replacement',
          estimatedCost: 25000,
          advancePaid: 5000,
          status: 'IN_PROGRESS', // RECEIVED, IN_PROGRESS, READY, DELIVERED
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceModel: '',
    imei: '',
    issue: '',
    estimatedCost: '',
    advancePaid: ''
  });

  const saveJobCards = (updated) => {
    setJobCards(updated);
    localStorage.setItem('nexcart_job_cards', JSON.stringify(updated));
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    const newJob = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: jobForm.customerName,
      customerPhone: jobForm.customerPhone,
      deviceModel: jobForm.deviceModel,
      imei: jobForm.imei,
      issue: jobForm.issue,
      estimatedCost: Number(jobForm.estimatedCost || 0),
      advancePaid: Number(jobForm.advancePaid || 0),
      status: 'RECEIVED',
      createdAt: new Date().toISOString()
    };

    const updated = [newJob, ...jobCards];
    saveJobCards(updated);
    setIsNewJobModalOpen(false);
    setJobForm({ customerName: '', customerPhone: '', deviceModel: '', imei: '', issue: '', estimatedCost: '', advancePaid: '' });
  };

  const handleUpdateStatus = (jobId, newStatus) => {
    const updated = jobCards.map(j => j.id === jobId ? { ...j, status: newStatus } : j);
    saveJobCards(updated);
  };

  // Find sold items with IMEI / Serial Numbers for Warranty Claims
  const soldWarrantyItems = [];
  transactions.forEach(tx => {
    tx.items?.forEach(item => {
      if (item.imeiNumber || item.batchNumber) {
        soldWarrantyItems.push({
          invoiceNumber: tx.invoiceNumber,
          date: tx.timestamp,
          customer: tx.customer?.name || 'Walk-in',
          phone: tx.customer?.phone || '',
          itemName: item.name,
          imei: item.imeiNumber || item.batchNumber,
          salePrice: item.salePrice
        });
      }
    });
  });

  const filteredWarrantyItems = soldWarrantyItems.filter(i => 
    i.imei?.toLowerCase().includes(searchIMEI.toLowerCase()) ||
    i.itemName?.toLowerCase().includes(searchIMEI.toLowerCase()) ||
    i.invoiceNumber?.toLowerCase().includes(searchIMEI.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Wrench className="w-7 h-7 text-sky-400" />
            <span>Warranty Management & Repair Job Cards</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track device repairs, service job card status, and lookup sold product IMEI warranty serials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('REPAIR')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'REPAIR' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            🔧 Repair Job Cards ({jobCards.length})
          </button>
          <button
            onClick={() => setActiveTab('WARRANTY')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'WARRANTY' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            🛡️ IMEI Warranty Register ({soldWarrantyItems.length})
          </button>

          <button
            onClick={() => setIsNewJobModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Job Card</span>
          </button>
        </div>
      </div>

      {activeTab === 'REPAIR' ? (
        /* REPAIR JOB CARDS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['RECEIVED', 'IN_PROGRESS', 'READY', 'DELIVERED'].map(st => {
              const count = jobCards.filter(j => j.status === st).length;
              return (
                <div key={st} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    {st.replace('_', ' ')}
                  </div>
                  <div className="font-heading font-extrabold text-2xl text-white">{count} Devices</div>
                </div>
              );
            })}
          </div>

          {/* Job Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobCards.map(job => (
              <div key={job.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-400 text-xs">{job.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'READY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      job.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      job.status === 'DELIVERED' ? 'bg-slate-800 text-slate-400' :
                      'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mt-2">{job.deviceModel}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">IMEI/SN: {job.imei || 'N/A'}</div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 mt-2 space-y-1">
                    <div>Customer: <strong className="text-white">{job.customerName}</strong> ({job.customerPhone})</div>
                    <div>Issue: <span className="text-amber-300">{job.issue}</span></div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span>Est Cost: <strong className="text-emerald-400">{store?.currencySymbol}{job.estimatedCost.toFixed(2)}</strong></span>
                      <span>Advance: <strong className="text-sky-300">{store?.currencySymbol}{job.advancePaid.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <select
                    value={job.status}
                    onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-white border border-slate-700 focus:outline-none"
                  >
                    <option value="RECEIVED">Status: Received</option>
                    <option value="IN_PROGRESS">Status: In Progress</option>
                    <option value="READY">Status: Ready</option>
                    <option value="DELIVERED">Status: Delivered</option>
                  </select>

                  <button
                    onClick={() => printJobCardReceipt(job, store)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Print Job Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* WARRANTY LOOKUP VIEW */
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by IMEI / Serial # or Invoice #..."
              value={searchIMEI}
              onChange={(e) => setSearchIMEI(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">IMEI / Serial #</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Sale Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredWarrantyItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500">
                      No matching sold items with IMEI / Serial warranty numbers found
                    </td>
                  </tr>
                ) : (
                  filteredWarrantyItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400">{item.imei}</td>
                      <td className="p-3 font-bold text-white">{item.itemName}</td>
                      <td className="p-3 font-mono text-sky-300">{item.invoiceNumber}</td>
                      <td className="p-3 text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="p-3 text-slate-200">{item.customer}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {store?.currencySymbol}{item.salePrice.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Job Card Modal */}
      <Modal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        title="Create Device Repair Job Card"
      >
        <form onSubmit={handleCreateJob} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={jobForm.customerName}
                onChange={(e) => setJobForm({ ...jobForm, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Phone *</label>
              <input
                type="text"
                required
                value={jobForm.customerPhone}
                onChange={(e) => setJobForm({ ...jobForm, customerPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Device Model *</label>
              <input
                type="text"
                required
                placeholder="e.g. Samsung S22 Ultra"
                value={jobForm.deviceModel}
                onChange={(e) => setJobForm({ ...jobForm, deviceModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">IMEI / Serial #</label>
              <input
                type="text"
                placeholder="15-digit IMEI"
                value={jobForm.imei}
                onChange={(e) => setJobForm({ ...jobForm, imei: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Fault / Repair Description *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Battery replacement & Charging port repair..."
              value={jobForm.issue}
              onChange={(e) => setJobForm({ ...jobForm, issue: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Est. Repair Cost ({store?.currencySymbol})</label>
              <input
                type="number"
                value={jobForm.estimatedCost}
                onChange={(e) => setJobForm({ ...jobForm, estimatedCost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Advance Received ({store?.currencySymbol})</label>
              <input
                type="number"
                value={jobForm.advancePaid}
                onChange={(e) => setJobForm({ ...jobForm, advancePaid: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg"
          >
            Create Repair Job Card
          </button>
        </form>
      </Modal>
    </div>
  );
};
