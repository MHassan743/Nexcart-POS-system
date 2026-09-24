import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  FileText, 
  Globe, 
  Settings, 
  RefreshCw,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { NexcartBadge } from './NexcartBranding.jsx';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, store } = useAuth();

  const navItems = [
    {
      id: 'pos',
      label: 'POS Billing Terminal',
      icon: ShoppingCart,
      badge: 'Main',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock In',
      icon: Package
    },
    {
      id: 'reconciliation',
      label: 'Stock Reconciliation',
      icon: ShieldCheck,
      badge: 'Anti-Leakage',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'customers',
      label: 'Customers & Khaata',
      icon: Users,
      badge: 'Ledger',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
      id: 'reports',
      label: 'Sales & Analytics',
      icon: BarChart3
    },
    {
      id: 'returns',
      label: 'Product Returns',
      icon: RefreshCw,
      badge: 'Refunds',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
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
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full z-20 shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Retail Operations
        </div>

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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-glow-sky border border-sky-400/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Branding */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] font-bold text-slate-200">Nexcart POS Engine</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Multi-business anti-leakage system with real-time stock deduction.
          </p>
          <div className="pt-1">
            <NexcartBadge showLink={true} />
          </div>
        </div>
      </div>
    </aside>
  );
};
