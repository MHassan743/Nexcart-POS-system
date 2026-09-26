import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  RefreshCw,
  PieChart as PieIcon,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

export const ExpensesView = () => {
  const { store } = useAuth();
  const { transactions } = usePOS();
  const currency = store?.currencySymbol || 'Rs. ';

  const [activeSubTab, setActiveSubTab] = useState('operational'); // 'operational' | 'purchases'
  const [expenseList, setExpenseList] = useState([
    {
      id: 'exp-1',
      category: 'Electricity Bill',
      amount: 14500,
      description: 'Shop Electricity Bill September 2026',
      date: '2026-09-24',
      isRecurring: true,
      type: 'Operational'
    },
    {
      id: 'exp-2',
      category: 'Shop Rent',
      amount: 45000,
      description: 'Monthly Premises Lease Payment',
      date: '2026-09-01',
      isRecurring: true,
      type: 'Operational'
    },
    {
      id: 'exp-3',
      category: 'Staff Tea & Refreshments',
      amount: 2500,
      description: 'Weekly tea & snacks for store sales team',
      date: '2026-09-25',
      isRecurring: false,
      type: 'Operational'
    }
  ]);

  // Quick Add Form
  const [category, setCategory] = useState('Electricity Bill');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  // Financial Calculations for Profit Report (Doxfen Parity)
  const salesRevenue = transactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
  const costOfGoodsSold = salesRevenue * 0.70; // 70% estimated COGS
  const grossProfit = salesRevenue - costOfGoodsSold;
  const totalOperationalExpenses = expenseList.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperationalExpenses;

  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return alert('Please enter valid expense amount');

    const created = {
      id: `exp-${Date.now()}`,
      category,
      amount: amt,
      description: description || category,
      date: expenseDate,
      isRecurring,
      type: 'Operational'
    };

    setExpenseList([created, ...expenseList]);
    setAmount('');
    setDescription('');
    setIsRecurring(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenseList(expenseList.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('operational')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'operational'
                ? 'bg-blue-600 text-white shadow-glow-blue border border-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Operational Expenses
          </button>
          <button
            onClick={() => setActiveSubTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'purchases'
                ? 'bg-blue-600 text-white shadow-glow-blue border border-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Stock Purchases
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Currency: <span className="text-white font-bold">{currency}</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Today's Expenses</div>
            <div className="font-heading font-extrabold text-2xl text-white mt-1">{currency}0</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">This Month</div>
            <div className="font-heading font-extrabold text-2xl text-amber-400 mt-1">
              {currency}{totalOperationalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Operational</div>
            <div className="font-heading font-extrabold text-2xl text-blue-400 mt-1">
              {currency}{totalOperationalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">All-Time Total</div>
            <div className="font-heading font-extrabold text-2xl text-rose-400 mt-1">
              {currency}{totalOperationalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Form & Profit Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Quick Add Expense & History List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Add Expense Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Quick Add Expense</span>
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Electricity Bill">Electricity Bill</option>
                    <option value="Shop Rent">Shop Rent</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Staff Tea & Refreshments">Staff Tea & Refreshments</option>
                    <option value="Maintenance & Repair">Maintenance & Repair</option>
                    <option value="Marketing & Printing">Marketing & Printing</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount ({currency}) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g., Electricity bill June"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="recurringCheck"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                    />
                    <label htmlFor="recurringCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      Recurring
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Operational Expense</span>
              </button>
            </form>
          </div>

          {/* Expenses History Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
              Expense Log Records
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Category & Description</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {expenseList.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3">
                        <div className="font-bold text-white">{exp.category}</div>
                        <div className="text-[10px] text-slate-400">{exp.description}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{exp.date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700 font-semibold">
                          {exp.isRecurring ? 'Recurring' : 'One-Time'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-400 text-sm">
                        {currency}{exp.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Profit Report (Doxfen Parity) */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Profit Report</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Period Net</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Sales Revenue:</span>
                <span className="font-mono font-bold text-white">{currency}{salesRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Cost of Goods Sold (COGS):</span>
                <span className="font-mono text-rose-400">- {currency}{costOfGoodsSold.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
                <span className="text-slate-200">Gross Profit:</span>
                <span className="font-mono text-emerald-400">{currency}{grossProfit.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Operational Expenses:</span>
                <span className="font-mono text-rose-400">- {currency}{totalOperationalExpenses.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-between font-extrabold text-base">
                <span className="text-white uppercase tracking-wide">Net Profit:</span>
                <span className={`font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currency}{netProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cash Flow Section */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CASH FLOW</div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Purchases Made:</span>
                <span className="font-mono text-white">{currency}0</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Payments Received:</span>
                <span className="font-mono text-white">{currency}{salesRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Payments Made:</span>
                <span className="font-mono text-white">{currency}0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
