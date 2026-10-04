import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { printReceipt } from '../utils/printReceipt.js';
import { 
  Pill, 
  Plus, 
  Search, 
  FileText, 
  AlertTriangle, 
  User, 
  Calendar,
  ShieldAlert
} from 'lucide-react';

export const PrescriptionView = () => {
  const { store } = useAuth();
  const { products } = usePOS();

  // Prescription log stored in localStorage
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const data = localStorage.getItem('nexcart_prescriptions');
      return data ? JSON.parse(data) : [
        {
          id: 'RX-8801',
          patientName: 'Kashif Mehmood',
          patientAge: 42,
          doctorName: 'Dr. A. R. Khan (FCPS Cardiology)',
          medicines: 'Panadol Extra 500mg, Augmentin 1g, Softin 10mg',
          dosageInstruction: '1 tablet twice daily after meals for 5 days',
          batchNumber: 'B-99201',
          expiryDate: '2027-04-30',
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    patientAge: '',
    doctorName: '',
    medicines: '',
    dosageInstruction: '',
    batchNumber: '',
    expiryDate: ''
  });

  const savePrescriptions = (updated) => {
    setPrescriptions(updated);
    localStorage.setItem('nexcart_prescriptions', JSON.stringify(updated));
  };

  const handleCreateRx = (e) => {
    e.preventDefault();
    const newRx = {
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: form.patientName,
      patientAge: form.patientAge,
      doctorName: form.doctorName,
      medicines: form.medicines,
      dosageInstruction: form.dosageInstruction,
      batchNumber: form.batchNumber,
      expiryDate: form.expiryDate,
      createdAt: new Date().toISOString()
    };

    const updated = [newRx, ...prescriptions];
    savePrescriptions(updated);
    setIsModalOpen(false);
    setForm({ patientName: '', patientAge: '', doctorName: '', medicines: '', dosageInstruction: '', batchNumber: '', expiryDate: '' });
  };

  // Filter pharmacy items near expiry (< 60 days)
  const today = new Date();
  const nearExpiryProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Pill className="w-7 h-7 text-rose-400" />
            <span>Pharmacy Doctor Prescription Register & Batch Expiry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log patient doctor prescriptions, controlled drug records, and track near-expiry batch stock.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Patient Prescription</span>
        </button>
      </div>

      {/* Near Expiry Warning Banner if any */}
      {nearExpiryProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Near Expiry Alert ({nearExpiryProducts.length} items expiring within 60 days)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {nearExpiryProducts.map(p => (
              <div key={p.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="font-bold text-white">{p.name}</div>
                <div className="text-[10px] text-amber-400">Exp: {p.expiryDate} | Batch: {p.batchNumber || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Log List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prescriptions.map(rx => (
          <div key={rx.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-400 text-xs">{rx.id}</span>
              <span className="text-[10px] text-slate-400">
                {new Date(rx.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">{rx.patientName} ({rx.patientAge || 'N/A'} yrs)</h3>
              <div className="text-xs text-emerald-400 font-semibold">{rx.doctorName}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div><strong>Medicines:</strong> <span className="text-white">{rx.medicines}</span></div>
              <div><strong>Dosage:</strong> <span className="text-amber-300">{rx.dosageInstruction}</span></div>
              {(rx.batchNumber || rx.expiryDate) && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  Batch: {rx.batchNumber} | Exp: {rx.expiryDate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log Rx Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Patient Doctor Prescription">
        <form onSubmit={handleCreateRx} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Patient Age</label>
              <input
                type="text"
                placeholder="e.g. 42"
                value={form.patientAge}
                onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Prescribing Doctor *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. A. R. Khan (Cardiologist)"
              value={form.doctorName}
              onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Medicines Prescribed *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Panadol 500mg, Augmentin 1g..."
              value={form.medicines}
              onChange={(e) => setForm({ ...form, medicines: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Dosage Instructions</label>
            <input
              type="text"
              placeholder="e.g. 1 tab 1x daily after dinner"
              value={form.dosageInstruction}
              onChange={(e) => setForm({ ...form, dosageInstruction: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Batch #</label>
              <input
                type="text"
                placeholder="e.g. B-8841"
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg"
          >
            Save Prescription Record
          </button>
        </form>
      </Modal>
    </div>
  );
};
