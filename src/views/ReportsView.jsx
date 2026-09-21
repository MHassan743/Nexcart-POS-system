import React from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  DollarSign, 
  PieChart, 
  Award, 
  Package, 
  UserCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const ReportsView = () => {
  const { store } = useAuth();
  const { transactions, products } = usePOS();

  const totalSales = transactions.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalItemsSold = transactions.reduce((acc, t) => acc + (t.itemCount || 0), 0);
  const avgOrderVal = transactions.length > 0 ? totalSales / transactions.length : 0;

  // Chart Data Preparation: Daily Revenue Trends
  const salesByDate = {};
  transactions.forEach(t => {
    const date = new Date(t.timestamp).toLocaleDateString();
    salesByDate[date] = (salesByDate[date] || 0) + t.grandTotal;
  });

  const chartData = Object.keys(salesByDate).map(date => ({
    date,
    Sales: salesByDate[date]
  })).reverse();

  // Export CSV Handler
  const handleExportCSV = () => {
    if (transactions.length === 0) return alert('No transactions to export');
    
    let csv = 'Invoice Number,Date,Cashier,Total,Items Count,Payment Method\n';
    transactions.forEach(t => {
      csv += `${t.invoiceNumber},${new Date(t.timestamp).toLocaleString()},${t.employeeName},${t.grandTotal},${t.itemCount},${t.paymentMethod}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexcart_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-400" />
            <span>Sales & Profit Analytics Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time revenue metrics, profit margins, top cashiers, and accountant CSV reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-slate-200 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-sky-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales Revenue</div>
          <div className="font-heading font-extrabold text-2xl text-emerald-400 mt-1">
            {store?.currencySymbol}{totalSales.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Gross Invoiced</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Invoice Volume</div>
          <div className="font-heading font-extrabold text-2xl text-sky-400 mt-1">
            {transactions.length} Invoices
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Units Sold: {totalItemsSold}</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Basket Value</div>
          <div className="font-heading font-extrabold text-2xl text-purple-400 mt-1">
            {store?.currencySymbol}{avgOrderVal.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Per transaction</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Store Catalog</div>
          <div className="font-heading font-extrabold text-2xl text-amber-300 mt-1">
            {products.length} Products
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across categories</div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider mb-4">
          Sales Revenue Trend
        </h3>
        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No sales recorded yet. Process checkouts on the POS screen to populate revenue charts.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="Sales" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
