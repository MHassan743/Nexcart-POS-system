import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { printReceipt } from '../utils/printReceipt.js';
import { exportToExcel } from '../utils/excelExport.js';
import { 
  Calculator, 
  Banknote, 
  CreditCard, 
  Lock, 
  CheckCircle, 
  Printer, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Clock
} from 'lucide-react';

export const RegisterView = () => {
  const { store, user } = useAuth();
  const { transactions, reconciliations, handleRunReconciliation } = usePOS();

  const [openingCash, setOpeningCash] = useState('5000');
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [closingNotes, setClosingNotes] = useState('');
  const [activeZReport, setActiveZReport] = useState(null);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);

  // Calculate today's real-time sales metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.timestamp && t.timestamp.startsWith(todayStr));

  const totalSalesVal = todayTransactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
  const cashSalesVal = todayTransactions.filter(t => t.paymentMethod === 'CASH').reduce((acc, t) => acc + (t.amountPaid || 0), 0);
  const cardSalesVal = todayTransactions.filter(t => t.paymentMethod === 'CARD').reduce((acc, t) => acc + (t.amountPaid || 0), 0);
  const splitSalesVal = todayTransactions.filter(t => t.paymentMethod === 'SPLIT').reduce((acc, t) => acc + (t.amountPaid || 0), 0);
  const khaataAddedVal = todayTransactions.reduce((acc, t) => acc + (t.remainingBalance || 0), 0);

  const totalItemsSold = todayTransactions.reduce((acc, t) => acc + (t.itemCount || t.items?.length || 0), 0);
  const expectedTillCash = Number(openingCash || 0) + cashSalesVal;

  // Generate Z-Report & Close Register
  const handleCloseRegister = () => {
    const zReportData = {
      id: `zrep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: todayStr,
      closedBy: user?.name || 'Cashier',
      openingCash: Number(openingCash),
      totalSalesVal,
      cashSalesVal,
      cardSalesVal,
      splitSalesVal,
      khaataAddedVal,
      expectedTillCash,
      totalTransactions: todayTransactions.length,
      totalItemsSold,
      notes: closingNotes
    };

    setActiveZReport(zReportData);
    setIsZReportModalOpen(true);
    setIsSessionActive(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Calculator className="w-7 h-7 text-emerald-400" />
            <span>Daily Cash Register & Z-Report Summary</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track till opening float, live cash/card sales, and print end-of-day Z-Report totals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isSessionActive 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{isSessionActive ? 'Till Session OPEN' : 'Till Register CLOSED'}</span>
          </span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Opening Float Cash</div>
          <div className="font-heading font-extrabold text-2xl text-amber-400">
            {store?.currencySymbol}{Number(openingCash).toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500">Initial cash drawer balance</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Net Sales</div>
          <div className="font-heading font-extrabold text-2xl text-emerald-400">
            {store?.currencySymbol}{totalSalesVal.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-300">{todayTransactions.length} Total Invoices</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Till Cash</div>
          <div className="font-heading font-extrabold text-2xl text-sky-400">
            {store?.currencySymbol}{expectedTillCash.toFixed(2)}
          </div>
          <div className="text-[10px] text-sky-300">Float + Cash Sales</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khaata Debt Generated</div>
          <div className="font-heading font-extrabold text-2xl text-rose-400">
            {store?.currencySymbol}{khaataAddedVal.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500">Unpaid partial balances</div>
        </div>
      </div>

      {/* Main Register Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales Breakdown */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Payment Method Real-time Breakdown</span>
            <button
              onClick={() => {
                const data = todayTransactions.map(t => ({
                  Invoice: t.invoiceNumber,
                  Time: new Date(t.timestamp).toLocaleTimeString(),
                  Customer: t.customer?.name || 'Walk-in',
                  PaymentMethod: t.paymentMethod,
                  Total: t.grandTotal,
                  Paid: t.amountPaid,
                  KhaataBalance: t.remainingBalance
                }));
                exportToExcel(data, `Z_Report_${todayStr}`, 'Today_Sales');
              }}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Today's Register Excel</span>
            </button>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Cash Sales</div>
              <div className="font-heading font-extrabold text-lg text-emerald-400">
                {store?.currencySymbol}{cashSalesVal.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Card Sales</div>
              <div className="font-heading font-extrabold text-lg text-sky-400">
                {store?.currencySymbol}{cardSalesVal.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Split / Partial</div>
              <div className="font-heading font-extrabold text-lg text-indigo-400">
                {store?.currencySymbol}{splitSalesVal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Today's Transactions Log Table */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-300">Today's Completed Invoices</div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {todayTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500 text-xs">
                        No sales recorded yet today
                      </td>
                    </tr>
                  ) : (
                    todayTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold font-mono text-sky-300">{t.invoiceNumber}</td>
                        <td className="p-2.5 text-slate-400">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-2.5 text-slate-200">{t.customer?.name || 'Walk-in'}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {t.paymentMethod}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          {store?.currencySymbol}{t.grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Close Register Actions */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register Session Controls</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Opening Till Float ({store?.currencySymbol})</label>
              <input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Shift / Manager Closing Notes</label>
              <textarea
                rows={3}
                placeholder="Notes on register count, petty cash, or cashier shift..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={handleCloseRegister}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-extrabold text-xs text-white shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Close Till & Generate Z-Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* End of Day Z-Report Modal */}
      <Modal
        isOpen={isZReportModalOpen}
        onClose={() => setIsZReportModalOpen(false)}
        title="Official End of Day Z-Report"
        maxWidth="max-w-md"
      >
        {activeZReport && (
          <div className="space-y-4">
            <div id="printable-z-report" className="p-4 bg-white text-slate-900 rounded-xl font-sans text-xs space-y-3 shadow">
              <div className="text-center border-b border-slate-300 pb-2 space-y-1">
                <h2 className="font-bold text-base text-slate-900 uppercase">{store?.storeName || 'Nexcart Store'}</h2>
                <div className="text-[10px] text-slate-600">END OF DAY Z-REPORT SUMMARY</div>
                <div className="text-[10px] font-mono font-bold text-slate-700">Date: {activeZReport.date}</div>
              </div>

              <div className="space-y-1.5 text-[11px] border-b border-slate-200 pb-2">
                <div className="flex justify-between"><span>Closed By:</span><strong>{activeZReport.closedBy}</strong></div>
                <div className="flex justify-between"><span>Total Invoices:</span><strong>{activeZReport.totalTransactions}</strong></div>
                <div className="flex justify-between"><span>Items Sold:</span><strong>{activeZReport.totalItemsSold}</strong></div>
              </div>

              <div className="space-y-1.5 text-[11px] border-b border-slate-200 pb-2">
                <div className="flex justify-between text-slate-700"><span>Opening Float:</span><span className="font-mono">{store?.currencySymbol}{activeZReport.openingCash.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-700"><span>Cash Received:</span><span className="font-mono">{store?.currencySymbol}{activeZReport.cashSalesVal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-700"><span>Card Payments:</span><span className="font-mono">{store?.currencySymbol}{activeZReport.cardSalesVal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-700"><span>Khaata Credit Added:</span><span className="font-mono">{store?.currencySymbol}{activeZReport.khaataAddedVal.toFixed(2)}</span></div>
              </div>

              <div className="pt-1 space-y-1 text-xs">
                <div className="flex justify-between font-extrabold text-slate-900">
                  <span>TOTAL SALES VOLUME:</span>
                  <span className="font-mono">{store?.currencySymbol}{activeZReport.totalSalesVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-800 p-1.5 rounded bg-emerald-50 border border-emerald-200">
                  <span>EXPECTED DRAWER CASH:</span>
                  <span className="font-mono">{store?.currencySymbol}{activeZReport.expectedTillCash.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => printReceipt('printable-z-report', `Z-Report ${activeZReport.date}`)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Z-Report</span>
              </button>
              <button
                onClick={() => setIsZReportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
