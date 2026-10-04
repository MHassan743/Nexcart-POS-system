import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  ShoppingBag, 
  Users, 
  Wallet, 
  Percent, 
  RotateCcw, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Globe, 
  Settings, 
  Store, 
  Sparkles, 
  ChevronRight, 
  PhoneCall, 
  CheckCircle2, 
  LogOut,
  Lock,
  Send,
  Calculator,
  Wrench,
  CreditCard,
  Pill,
  Cake,
  Gem
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from './Modal.jsx';
import { DB } from '../services/db.js';
import { syncStoreToCloud } from '../services/cloudSync.js';

import { SyncStatusIndicator } from './SyncStatusIndicator.jsx';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, store, logout } = useAuth();

  // Locked feature modal state
  const [lockedFeatureModal, setLockedFeatureModal] = useState({ isOpen: false, feature: null, requestSent: false });

  // 6 Enterprise Features + 6 Industry Category Features lock check
  const isFeatureUnlocked = (featureId) => {
    // Non-locked items (Core POS features)
    const lockedKeys = [
      'suppliers', 
      'salesmen', 
      'reconciliation', 
      'audit', 
      'reports', 
      'customers',
      'register',
      'warranty',
      'installments',
      'prescription',
      'custom_orders',
      'jewelry'
    ];
    if (!lockedKeys.includes(featureId)) return true;

    // Premium plan unlocks ALL features
    const plan = (store?.subscriptionPlan || store?.subscription?.planId || store?.plan || '').toLowerCase();
    if (plan.includes('premium') || plan === 'premium') return true;

    // 1. Individual permission set by Super Admin (React Store State)
    if (store?.featurePermissions && Boolean(store.featurePermissions[featureId])) {
      return true;
    }

    // 2. Direct DB storage check (Current Store)
    const currentLocal = DB.getStore();
    if (currentLocal?.featurePermissions && Boolean(currentLocal.featurePermissions[featureId])) {
      return true;
    }

    // 3. Global Hub storage check (Master Registry)
    const localHub = DB.getGlobalHub();
    const matchInHub = localHub.find(s => s.storeId === currentLocal?.storeId || s.storeName === currentLocal?.storeName);
    if (matchInHub?.featurePermissions && Boolean(matchInHub.featurePermissions[featureId])) {
      return true;
    }

    return false;
  };

  const navItems = [
    {
      id: 'reports',
      label: 'Dashboard & Reports',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'pos',
      label: 'New Sale (POS)',
      icon: ShoppingCart,
      badge: 'Terminal',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'register',
      label: 'Day Register & Z-Report',
      icon: Calculator,
      badge: 'Cash Drawer',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'warranty',
      label: 'Warranty & Repairs',
      icon: Wrench,
      badge: 'Electronics/Auto',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
      id: 'installments',
      label: 'Installments (EMI)',
      icon: CreditCard,
      badge: 'Financing',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'prescription',
      label: 'Rx Doctor Register',
      icon: Pill,
      badge: 'Pharmacy',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'custom_orders',
      label: 'Custom Orders & Advance',
      icon: Cake,
      badge: 'Bakery/Tailor',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'jewelry',
      label: 'Gold Rate & Karat Calc',
      icon: Gem,
      badge: 'Jewelry',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30'
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock In',
      icon: Package
    },
    {
      id: 'suppliers',
      label: 'Suppliers Management',
      icon: Truck,
      badge: 'Payables',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'purchases',
      label: 'New Purchase (GRN)',
      icon: ShoppingBag
    },
    {
      id: 'customers',
      label: 'Customers & Khaata',
      icon: Users,
      badge: 'Ledger',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
      id: 'expenses',
      label: 'Operational Expenses',
      icon: Wallet
    },
    {
      id: 'discounts',
      label: 'Discounts & Promos',
      icon: Percent
    },
    {
      id: 'returns',
      label: 'Product Returns',
      icon: RotateCcw,
      badge: 'Refunds',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'salesmen',
      label: 'Salesmen & Commissions',
      icon: UserCheck
    },
    {
      id: 'reconciliation',
      label: 'Stock Reconciliation',
      icon: ShieldCheck,
      badge: 'Anti-Leakage',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'audit',
      label: 'Security Audit Trail',
      icon: FileText,
      role: 'ADMIN' // Owner & Manager only
    },
    {
      id: 'superadmin',
      label: 'Nexcart Cloud Hub',
      icon: Globe,
      badge: 'Super Admin',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: Settings
    }
  ];

  const handleNavClick = (item) => {
    if (!isFeatureUnlocked(item.id)) {
      setLockedFeatureModal({
        isOpen: true,
        feature: item,
        requestSent: store?.featureRequests?.[item.id] === 'pending'
      });
      return;
    }
    onSelectTab(item.id);
  };

  const handleSendFeatureRequest = async () => {
    if (!lockedFeatureModal.feature) return;
    const featureId = lockedFeatureModal.feature.id;
    const currentRequests = store?.featureRequests || {};
    const updatedRequests = { ...currentRequests, [featureId]: 'pending' };

    const updatedStore = DB.updateStore({ featureRequests: updatedRequests });
    await syncStoreToCloud(updatedStore);

    setLockedFeatureModal(prev => ({ ...prev, requestSent: true }));
  };

  // Calculate dynamic license expiry date
  const getFormattedExpiryDate = () => {
    const rawDate = store?.trialEndDate || store?.subscription?.trialEndDate || store?.subscriptionExpiry;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {}
    }
    const regDate = store?.registeredAt ? new Date(store.registeredAt) : new Date();
    const expiry = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col h-full z-20 shrink-0 select-none shadow-2xl">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-[#080b12]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-glow-blue border border-blue-400/30 shrink-0">
            <Store className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white truncate tracking-wide">
                {store?.name || 'Nexcart Store'}
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {store?.businessCategory || store?.category || 'Retail POS'} System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-2.5 space-y-0.5 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const unlocked = isFeatureUnlocked(item.id);
          
          if (item.role && user?.role === 'CASHIER') {
            return null;
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                !unlocked
                  ? 'text-slate-500 hover:bg-slate-900/60 border border-slate-800/40'
                  : isActive
                    ? 'bg-blue-600 text-white shadow-glow-blue font-semibold border border-blue-400/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  !unlocked ? 'text-slate-600' : isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!unlocked ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED</span>
                  </span>
                ) : item.badge ? (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border tracking-tight ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
                {isActive && unlocked && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Account & License Indicator */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080b12] space-y-2">
        <div className="px-2.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-[10px]">
          <div className="flex items-center justify-between font-mono text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              <PhoneCall className="w-3 h-3 text-sky-400" /> +92 340 7542382
            </span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 font-semibold pt-0.5 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Licensed
            </span>
            <span className="text-slate-400 font-mono text-[9px]">Expires {getFormattedExpiryDate()}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 hover:border-rose-700/50 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account / Logout</span>
        </button>
      </div>

      {/* Locked Feature Modal */}
      <Modal
        isOpen={lockedFeatureModal.isOpen}
        onClose={() => setLockedFeatureModal({ isOpen: false, feature: null, requestSent: false })}
        title="Feature Locked — Add-on Feature Required"
        maxWidth="max-w-md"
      >
        {lockedFeatureModal.feature && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-white">
                {lockedFeatureModal.feature.label} is Locked
              </h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                This feature is locked in standard plans. Upgrade to <strong className="text-purple-300">Premium All-Inclusive Plan</strong> or request individual add-on approval from Super Admin.
              </p>
            </div>

            {lockedFeatureModal.requestSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Unlock Request Sent to Super Admin! Pending Approval.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendFeatureRequest}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Send Feature Access Request to Admin</span>
              </button>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setLockedFeatureModal({ isOpen: false, feature: null, requestSent: false })}
                className="w-full py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </Modal>
    </aside>
  );
};
