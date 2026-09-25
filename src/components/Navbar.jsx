import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePOS } from '../context/POSContext.jsx';
import { NexcartLogo, NexcartBadge } from './NexcartBranding.jsx';
import { 
  UserCheck, 
  LogOut, 
  Bell, 
  ShieldAlert, 
  Store, 
  KeyRound, 
  Globe, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ onOpenPinModal, onNavigate }) => {
  const { user, store, logout } = useAuth();
  const { products } = usePOS();
  const [showNotifications, setShowNotifications] = useState(false);

  // Low stock alert items
  const lowStockItems = products.filter(p => p.stockQuantity <= (p.reorderThreshold || 10));

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
      {/* Left Store Brand Identity */}
      <div className="flex items-center gap-3">
        <NexcartLogo className="w-9 h-9" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-base font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[300px]">
              {store?.storeName || 'Nexcart POS'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
              {store?.businessType || 'Universal'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Currency: <strong className="text-slate-200">{store?.currencySymbol} ({store?.currency})</strong></span>
            <span>•</span>
            <span>Tax: <strong className="text-slate-200">{store?.taxRate}%</strong></span>
          </div>
        </div>
      </div>

      {/* Right Controls & Cashier Profile */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Low Stock Alert Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors relative"
            title="Notifications & Inventory Alerts"
          >
            <Bell className="w-4 h-4" />
            {lowStockItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center badge-pulse-red">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Inventory Alerts ({lowStockItems.length})</span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  All inventory stock levels are healthy!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="p-2 rounded-lg bg-slate-800/60 border border-amber-500/20 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.stockQuantity} {item.unit || 'units'} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Active Cashier / User Profile Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-200 leading-tight">{user.name}</div>
                <div className="text-[10px] text-sky-400 font-mono leading-tight">{user.role}</div>
              </div>
            </div>

            {/* Quick Till Switch PIN Button */}
            <button
              onClick={onOpenPinModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Quick Switch Till Cashier (PIN)"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
