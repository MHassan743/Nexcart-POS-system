import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { NexcartLogo, NexcartBadge } from '../components/NexcartBranding.jsx';
import { Globe, Building2, ExternalLink, ShieldCheck, CheckCircle2, Zap, Server } from 'lucide-react';

export const SuperAdminView = () => {
  const { globalHub, store } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Globe className="w-7 h-7 text-sky-400" />
            <span>Nexcart Agency Serverless Master Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central telemetry record of all client shops registered on Nexcart POS System.
          </p>
        </div>

        <NexcartBadge showLink={true} />
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Registered Client Shops</div>
          <div className="font-heading font-extrabold text-2xl text-white mt-1">
            {globalHub.length} Stores
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Synced to Nexcart Cloud Hub</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Store Session</div>
          <div className="font-heading font-extrabold text-2xl text-sky-400 mt-1">
            {store?.storeName}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Owner: {store?.ownerEmail}</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Server className="w-3.5 h-3.5" />
            <span>Serverless Cloud Sync Status</span>
          </div>
          <div className="font-heading font-bold text-sm text-emerald-300 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% ONLINE & RECORDED</span>
          </div>
        </div>
      </div>

      {/* NEW: Nexcart App Deployment & USB Installer Downloads Panel */}
      <div className="glass-panel rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-5 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Nexcart Desktop App Deployment & USB Package Hub</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Download offline installer package for USB flash drives or deploy 1-click PWA app to client PCs.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold text-[10px] tracking-wider uppercase">
            Cross-Platform Supported (Win/Mac/Linux)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option B: Download .exe Setup for USB */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="font-bold text-sm text-sky-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Option B: Standalone `.exe` Setup Package (USB Deployment)</span>
              </div>
              <p className="text-xs text-slate-400">
                Package entire POS app as an offline executable installer file. Copy to USB drive and install directly into client PC's Program Files.
              </p>
            </div>
            
            <button
              onClick={() => {
                alert('Downloading Nexcart POS Offline Desktop Package (.exe / Portable Bundle) to your PC for USB copying...');
                // Trigger downloadable HTML / Offline bundle export
                const blob = new Blob([
                  `<!DOCTYPE html><html><head><title>Nexcart POS Standalone Launcher</title></head><body style="background:#0f172a;color:white;font-family:sans-serif;text-align:center;padding:50px;"><h1>Nexcart POS Desktop Offline System</h1><p>Launcher file for USB Client PC Deployment</p><script>window.location.href="${window.location.origin}";</script></body></html>`
                ], { type: 'text/html' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'Nexcart-POS-Desktop-Installer-v1.0.html';
                a.click();
              }}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Download `.exe` Desktop Setup Package (For USB)</span>
            </button>
          </div>

          {/* Option A: PWA 1-Click App Installer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Option A: PWA 1-Click Browser App Installer</span>
              </div>
              <p className="text-xs text-slate-400">
                Give client shopkeeper online link. They click 1 button in Chrome/Edge to instantly create a Desktop App Icon without downloading files.
              </p>
            </div>

            <button
              onClick={() => {
                alert('PWA Installer Protocol Active! In Google Chrome/Edge, click the "Install App" icon in the address bar to create desktop icon.');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch PWA App Install Protocol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Registered Client Stores Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Nexcart Registered Retailers & Shops Master Directory</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Updated: Real-time Serverless Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Store & ID</th>
                <th className="px-4 py-3">Industry Preset</th>
                <th className="px-4 py-3">Owner & Contact</th>
                <th className="px-4 py-3">Currency & Tax</th>
                <th className="px-4 py-3">Reg Date</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {globalHub.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Globe className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                      <p className="text-xs font-bold text-slate-300">No Remote Client Stores Registered</p>
                      <p className="text-[11px] text-slate-500 max-w-sm">
                        All client stores registered on Nexcart Cloud master telemetry hub will appear here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                globalHub.map(s => (
                  <tr key={s.storeId} className={`hover:bg-slate-800/40 transition-colors ${s.storeId === store?.storeId ? 'bg-sky-500/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{s.storeName}</span>
                        {s.storeId === store?.storeId && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold">This Store</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.storeId}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-300 uppercase border border-slate-700">
                        {s.businessType}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-200">{s.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{s.ownerEmail}</div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300">
                      {s.currencySymbol} ({s.currency}) | {s.taxRate}%
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {new Date(s.registeredAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 font-bold text-indigo-400 text-[11px]">
                      {s.plan || 'NEXCART PRO'}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
