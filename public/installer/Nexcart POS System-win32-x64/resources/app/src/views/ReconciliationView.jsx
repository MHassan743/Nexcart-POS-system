import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Video, 
  Calculator, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  Clock, 
  UserCheck, 
  Sparkles,
  Plus
} from 'lucide-react';

export const ReconciliationView = () => {
  const { store, user } = useAuth();
  const { products, transactions, reconciliations, handleRunReconciliation } = usePOS();

  // Calculation metrics
  const totalCatalogUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalInvoicedUnits = transactions.reduce((acc, t) => acc + (t.itemCount || 0), 0);
  const totalRevenue = transactions.reduce((acc, t) => acc + t.grandTotal, 0);

  // Run new reconciliation state
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [measuredCountInput, setMeasuredCountInput] = useState('');
  const [cctvNotesInput, setCctvNotesInput] = useState('');

  // Sample calculated expected stock: catalog stock + invoiced units
  const openingStockEst = totalCatalogUnits + totalInvoicedUnits;
  const expectedStockEst = totalCatalogUnits;

  const measuredVal = measuredCountInput === '' ? expectedStockEst : Number(measuredCountInput);
  const discrepancyUnits = expectedStockEst - measuredVal;
  const avgUnitPrice = 15.00;
  const discrepancyValue = discrepancyUnits * avgUnitPrice;

  const handleRunSubmit = (e) => {
    e.preventDefault();
    const payload = {
      date: new Date().toISOString().split('T')[0],
      totalOpeningStock: openingStockEst,
      totalClosingStock: measuredVal,
      totalInvoicedUnits,
      expectedStock: expectedStockEst,
      discrepancyUnits,
      discrepancyValue,
      cctvNotes: cctvNotesInput
    };

    handleRunReconciliation(payload);
    setIsRunModalOpen(false);
    setMeasuredCountInput('');
    setCctvNotesInput('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Audit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <span>Anti-Leakage Stock Reconciliation Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated formula matching actual physical stock depletion against officially recorded invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setMeasuredCountInput(expectedStockEst);
            setIsRunModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          <span>Run Daily Reconciliation Audit</span>
        </button>
      </div>

      {/* Reconciliation Formula Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Recorded Invoices</div>
          <div className="font-heading font-extrabold text-2xl text-sky-400 mt-1">
            {transactions.length} Sales
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Units Invoiced: <strong className="text-white">{totalInvoicedUnits} Pcs</strong>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Stock Balance</div>
          <div className="font-heading font-extrabold text-2xl text-slate-100 mt-1">
            {expectedStockEst} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            (Opening Stock - Sales Invoiced)
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales Volume</div>
          <div className="font-heading font-extrabold text-2xl text-emerald-400 mt-1">
            {store?.currencySymbol}{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Invoiced & Accounted
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Leakage Discrepancy</span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-300 mt-1">
            {reconciliations.length > 0 ? reconciliations[0].discrepancyUnits : 0} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Status: <strong className="text-emerald-400">AUDITED & SECURED</strong>
          </div>
        </div>
      </div>

      {/* Recent Daily Reconciliations Log Table */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Daily Employee Reconciliation Records</span>
        </h3>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Audit Date & Timestamp</th>
                  <th className="px-4 py-3">Auditor / Manager</th>
                  <th className="px-4 py-3">Invoiced Units</th>
                  <th className="px-4 py-3">Expected Stock</th>
                  <th className="px-4 py-3">Actual Measured</th>
                  <th className="px-4 py-3">Discrepancy (Leakage)</th>
                  <th className="px-4 py-3">CCTV Notes & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {reconciliations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No reconciliation audits run yet. Click "Run Daily Reconciliation Audit" above to perform physical stock audit.
                    </td>
                  </tr>
                ) : (
                  reconciliations.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {new Date(rec.timestamp).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{rec.employeeName}</div>
                      </td>

                      <td className="px-4 py-3 font-mono text-sky-400 font-bold">
                        {rec.totalInvoicedUnits} Units
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-300">
                        {rec.expectedStock} Units
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-300">
                        {rec.totalClosingStock} Units
                      </td>

                      <td className="px-4 py-3">
                        {rec.discrepancyUnits === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            0 (Perfect Match)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 badge-pulse-red">
                            -{rec.discrepancyUnits} Units ({store?.currencySymbol}{rec.discrepancyValue.toFixed(2)})
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-300 text-[11px]">
                        {rec.cctvNotes ? (
                          <div className="flex items-center gap-1.5 text-amber-300">
                            <Video className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="italic truncate max-w-xs">{rec.cctvNotes}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No CCTV note tag</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Run Daily Stock Reconciliation */}
      <Modal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        title="Execute Daily Stock Reconciliation Audit"
      >
        <form onSubmit={handleRunSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Total Units Invoiced Today:</span>
              <strong className="text-sky-400 font-mono">{totalInvoicedUnits} Pcs</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Expected System Stock Balance:</span>
              <strong className="text-white font-mono">{expectedStockEst} Pcs</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Actual Physical Count (Measured Stock at Register/Shelf) *
            </label>
            <input
              type="number"
              required
              value={measuredCountInput}
              onChange={(e) => setMeasuredCountInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          {discrepancyUnits !== 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Stock Discrepancy Flagged!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Physical count differs from expected catalog stock by <strong className="text-white font-mono">{discrepancyUnits} units</strong>. Unaccounted stock loss: {store?.currencySymbol}{discrepancyValue.toFixed(2)}.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>CCTV Footage Cross-Reference Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Reviewed CCTV camera 3 footage between 14:00-15:00, verified 2 plates un-invoiced sale by cashier..."
              value={cctvNotesInput}
              onChange={(e) => setCctvNotesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Finalize Daily Reconciliation & Log Flag</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
