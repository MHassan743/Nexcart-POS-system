import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePOS } from '../context/POSContext.jsx';
import { Settings, Save, KeyRound, User, Mail, Building2, Phone, MapPin } from 'lucide-react';

export const SettingsView = () => {
  const { store, updateStoreConfig } = useAuth();

  const [form, setForm] = useState({
    storeName: store?.storeName || '',
    ownerName: store?.ownerName || '',
    ownerEmail: store?.ownerEmail || '',
    ownerPin: store?.ownerPin || '',
    phone: store?.phone || '',
    address: store?.address || '',
    currency: store?.currency || 'PKR',
    currencySymbol: store?.currencySymbol || '₨',
    taxRate: store?.taxRate !== undefined ? store.taxRate : 0
  });

  const [savedMsg, setSavedMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStoreConfig(form);
    setSavedMsg('Store configuration & Owner credentials saved successfully!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Settings className="w-7 h-7 text-sky-400" />
            <span>Store Configuration & Owner Setup</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your shop identity, owner details, contact details, currency, and Till security PIN.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center animate-fade-in shadow-lg">
          {savedMsg}
        </div>
      )}

      {/* Main Combined Form */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Shop Identity & Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4" />
              <span>Shop Identity & Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Store / Shop Name *</label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Business Category Type *</label>
                <select
                  value={form.businessCategory || store?.businessCategory || 'Pharmacy & Medical Store'}
                  onChange={(e) => setForm({ ...form, businessCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="Pharmacy & Medical Store">💊 Pharmacy & Medical Store</option>
                  <option value="Grocery & Supermarket">🛒 Grocery & Supermarket</option>
                  <option value="Crockery & Home Goods">🍽️ Crockery & Home Goods</option>
                  <option value="Electronics & Mobile Store">📱 Electronics & Mobile Store</option>
                  <option value="Fashion & Apparel">👔 Fashion & Apparel</option>
                  <option value="Cosmetics & Beauty">💄 Cosmetics & Beauty</option>
                  <option value="Hardware & Building Supplies">🔧 Hardware & Building Supplies</option>
                  <option value="Footwear & Shoes Store">👞 Footwear & Shoes Store</option>
                  <option value="Books & Stationery Shop">📚 Books & Stationery Shop</option>
                  <option value="Toys & Gift Shop">🧸 Toys & Gift Shop</option>
                  <option value="Auto Parts & Bike Accessories">🚗 Auto Parts & Bike Accessories</option>
                  <option value="Jewelry & Watches Store">💍 Jewelry & Watches Store</option>
                  <option value="Bakery & Confectionery">🎂 Bakery & Confectionery</option>
                  <option value="General Store / Retail Shop">🏪 General Store / Retail Shop</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Business Phone Number *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shop Address / Location * (Appears on Printed Receipts)</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner Identity & Till Security Credentials */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <KeyRound className="w-4 h-4" />
              <span>Owner Account & Till Security Credentials</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner Name *</label>
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Till Login 4-Digit PIN *</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={form.ownerPin}
                  onChange={(e) => setForm({ ...form, ownerPin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Billing & Currency Settings */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Settings className="w-4 h-4" />
              <span>Billing Currency & Tax Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Currency Code & Symbol</label>
                <select
                  value={form.currency}
                  onChange={(e) => {
                    const code = e.target.value;
                    const symbols = { PKR: '₨', USD: '$', GBP: '£', EUR: '€', AED: 'Dh' };
                    setForm({ ...form, currency: code, currencySymbol: symbols[code] || '$' });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="PKR">PKR (₨)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (Dh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Sales Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Store Configuration & Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

