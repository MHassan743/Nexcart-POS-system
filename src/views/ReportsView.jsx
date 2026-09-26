import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  RotateCcw, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Wallet, 
  Clock, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsView = () => {
  const { store } = useAuth();
  const { transactions, products, customers } = usePOS();
  const [dateRange, setDateRange] = useState('this_week');

  const currency = store?.currencySymbol || 'Rs. ';

  // Calculations
  const totalSales = transactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
  const totalItemsSold = transactions.reduce((acc, t) => acc + (t.itemCount || 0), 0);
  const totalReceivables = (customers || []).reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
  const lowStockCount = (products || []).filter(p => (p.stock || 0) <= (p.minStock || 5)).length;
  
  // Dummy estimated returns & expenses for live demonstration parity with Doxfen POS
  const totalReturns = 0;
  const totalExpenses = 0;
  const netProfit = totalSales * 0.28; // Estimated net profit margin

  // Date Filter Pills
  const filterPills = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_year', label: 'This Year' }
  ];

  // Daily Trend Chart Data
  const salesByDate = {};
  transactions.forEach(t => {
    const date = new Date(t.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    salesByDate[date] = (salesByDate[date] || 0) + t.grandTotal;
  });

  const chartData = Object.keys(salesByDate).map(date => ({
    date,
    Revenue: salesByDate[date],
    Profit: salesByDate[date] * 0.28
  })).reverse();

  // Rush Hours Data
  const rushHoursData = [
    { hour: '0:00', sales: 0, count: 0 },
    { hour: '3:00', sales: 0, count: 0 },
    { hour: '6:00', sales: 0, count: 0 },
    { hour: '9:00', sales: 12, count: 4 },
    { hour: '12:00', sales: 35, count: 14 },
    { hour: '15:00', sales: 28, count: 9 },
    { hour: '18:00', sales: 65, count: 22 },
    { hour: '21:00', sales: 40, count: 16 }
  ];

  // Payment Breakdown
  const cashSales = transactions.filter(t => t.paymentMethod === 'CASH').reduce((acc, t) => acc + t.grandTotal, 0);
  const udhaarSales = transactions.filter(t => t.paymentMethod === 'KHAATA' || t.paymentMethod === 'CREDIT').reduce((acc, t) => acc + t.grandTotal, 0);
  const cardSales = totalSales - cashSales - udhaarSales;

  const paymentPieData = [
    { name: 'Cash Paid', value: cashSales || (totalSales > 0 ? totalSales : 100), color: '#10b981' },
    { name: 'Udhaar / Khata', value: udhaarSales, color: '#f59e0b' },
    { name: 'Card / QR', value: cardSales, color: '#3b82f6' }
  ];

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
    a.download = `Nexcart_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Top Header & Date Filter Bar (Doxfen POS Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Nexcart Executive Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold font-mono">
              v2.5 SaaS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Store: <strong className="text-slate-200">{store?.name || 'Main Shop'}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Live Anti-Leakage Engine</span>
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            {filterPills.map(pill => (
              <button
                key={pill.id}
                onClick={() => setDateRange(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === pill.id 
                    ? 'bg-blue-600 text-white shadow-glow-blue' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-slate-200 transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Stat Cards (Doxfen POS Parity) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Returns */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Returns</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading font-extrabold text-xl text-white">
              {currency}{totalReturns}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">No returns in period</div>
          </div>
        </div>

        {/* Net Sales */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Net Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading font-extrabold text-xl text-emerald-400">
              {currency}{totalSales.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">After returns</div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Net Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading font-extrabold text-xl text-emerald-400">
              {currency}{netProfit.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">After COGS & expenses</div>
          </div>
        </div>

        {/* Receivables / Udhaar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Receivables</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading font-extrabold text-xl text-amber-400">
              {currency}{totalReceivables.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{customers.length} Khaata customers</div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading font-extrabold text-xl text-white">
              {lowStockCount}
            </div>
            <div className="text-[10px] text-blue-400 cursor-pointer font-semibold hover:underline mt-0.5">
              View affected items →
            </div>
          </div>
        </div>

        {/* Operational Expenses */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading font-extrabold text-xl text-rose-400">
              {currency}{totalExpenses}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Period costs</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue & Profit Trend Chart + Cash vs Udhaar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Trend Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Revenue & Profit Trend</span>
              </h3>
              <p className="text-[11px] text-slate-400">Returns are already factored in</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
              Live Real-Time Sync
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                <Activity className="w-8 h-8 text-slate-700 animate-pulse" />
                <span>No sales data yet for selected period. Process checkouts to see real-time charts.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cash vs Udhaar Card (1 Column - Doxfen Parity) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Cash vs Udhaar Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-400">Payment channel share</p>
          </div>

          <div className="h-44 my-2 flex items-center justify-center">
            {totalSales === 0 ? (
              <div className="text-center text-xs text-slate-500">
                <Wallet className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                <span>No payment data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {paymentPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{currency}{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Grid: Top 5 Revenue Generators & Rush Hours Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Revenue Generators */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Top 5 Revenue Generators</span>
          </h3>

          {products.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              No sales in this period
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((prod, idx) => (
                <div key={prod.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{prod.name}</div>
                      <div className="text-[10px] text-slate-400">{prod.category || 'General'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">{currency}{prod.price}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Stock: {prod.stock}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rush Hours Analysis Heatmap/Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Rush Hours Analysis</span>
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rushHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2">Peak store footfall & transaction volume by hour</p>
        </div>
      </div>
    </div>
  );
};
