import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePOS } from '../context/POSContext.jsx';
import { BUSINESS_TYPES, INITIAL_PRODUCTS } from '../services/seedData.js';
import { DB } from '../services/db.js';
import { Settings, Building2, DollarSign, Users, Shield, Save, KeyRound, Sparkles, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export const SettingsView = () => {
  const { store, updateStoreConfig } = useAuth();
  const { refreshData } = usePOS();

  const [form, setForm] = useState({
    storeName: store?.storeName || '',
    businessType: store?.businessType || 'crockery',
    currency: store?.currency || 'GBP',
    currencySymbol: store?.currencySymbol || '£',
    taxRate: store?.taxRate || 20,
    phone: store?.phone || '',
    address: store?.address || ''
  });

  const [savedMsg, setSavedMsg] = useState('');
  const employees = DB.getEmployees();

  const handleZeroMeterReset = () => {
    if (window.confirm('Are you sure you want to perform a 0-Meter Factory Reset? This will permanently delete all dummy products, dummy transactions, and customer balances!')) {
      DB.resetToZeroMeter();
      refreshData();
      setSavedMsg('0-Meter Reset Completed! All dummy data has been 100% purged.');
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStoreConfig(form);
    setSavedMsg('Store configuration updated & synced!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSwitchPreset = (bTypeKey) => {
    const config = BUSINESS_TYPES[bTypeKey.toUpperCase()] || BUSINESS_TYPES.GENERAL;
    const newForm = {
      ...form,
      businessType: bTypeKey,
      currency: config.defaultCurrency,
      currencySymbol: config.currencySymbol,
      taxRate: config.defaultTaxRate
    };
    setForm(newForm);
    updateStoreConfig(newForm);

    // Optionally load default sample products for that industry
    if (INITIAL_PRODUCTS[bTypeKey]) {
      localStorage.setItem('nexcart_products', JSON.stringify(INITIAL_PRODUCTS[bTypeKey]));
      refreshData();
    }

    setSavedMsg(`Switched store preset to ${config.name}!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Settings className="w-7 h-7 text-sky-400" />
            <span>Store Configuration & Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize store identity, tax rates, currency formatting, and staff PIN credentials.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center animate-fade-in">
          {savedMsg}
        </div>
      )}

      {/* Settings Form */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Business Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Currency Code</label>
              <select
                value={form.currency}
                onChange={(e) => {
                  const code = e.target.value;
                  const symbols = { GBP: '£', USD: '$', EUR: '€', PKR: '₨', AED: 'Dh' };
                  setForm({ ...form, currency: code, currencySymbol: symbols[code] || '$' });
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="PKR">PKR (₨)</option>
                <option value="AED">AED (Dh)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tax / VAT Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Store Address (Appears on Receipts)</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </form>
      </div>

      {/* Staff & PIN Credentials Manager */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-3">
        <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Active Staff Accounts & PIN Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {employees.map(e => (
            <div key={e.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{e.name}</div>
                <div className="text-[10px] text-slate-400">{e.email}</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono font-bold text-[10px] border border-slate-700">
                  PIN: {e.pin}
                </span>
                <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{e.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zero-Meter Factory Reset Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-rose-900/40 bg-rose-950/10 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>0-Meter Factory Data Reset (Clean System Setup)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Purge all demo products, dummy sales transactions, customer debts/udhari, and audit logs to initialize a 100% clean, zero-meter system for real production use.
            </p>
          </div>

          <button
            type="button"
            onClick={handleZeroMeterReset}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 font-extrabold text-xs text-white shadow-lg flex items-center justify-center gap-2 whitespace-nowrap transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Purge All Dummy Data (0-Meter)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
