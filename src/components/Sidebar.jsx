import React from 'react';
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
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { NexcartBadge } from './NexcartBranding.jsx';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, store, logout } = useAuth();

  const navItems = [
    {
      id: 'reports',
      label: 'Dashboard',
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

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col h-full z-20 shrink-0 select-none shadow-2xl">
      {/* Sidebar Header (Store Name & Account Indicator - Doxfen Style) */}
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
          
          // Role restriction
          if (item.role && user?.role === 'CASHIER') {
            return null; // Cashiers cannot access admin audit logs
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-glow-blue font-semibold border border-blue-400/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border tracking-tight ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Account & License Indicator (Doxfen Parity) */}
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
            <span className="text-slate-400 font-mono text-[9px]">Expires 20 Dec 2026</span>
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
    </aside>
  );
};
