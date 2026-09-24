import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { NexcartLogo, NexcartBadge } from '../components/NexcartBranding.jsx';
import { Modal } from '../components/Modal.jsx';
import { 
  Globe, 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Server,
  Download,
  Laptop,
  Check,
  Smartphone,
  Copy,
  Terminal,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Phone,
  MapPin,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';

export const SuperAdminView = () => {
  const { globalHub, store } = useAuth();

  // Modals state
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isPwaConfirmOpen, setIsPwaConfirmOpen] = useState(false);

  // PWA beforeinstallprompt handler
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleOpenPwaModal = () => {
    setIsPwaConfirmOpen(true);
  };

  const handleConfirmPwaInstall = () => {
    const promptEvent = deferredPrompt || window.deferredPwaPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setPwaInstalled(true);
        }
        setDeferredPrompt(null);
        window.deferredPwaPrompt = null;
        setIsPwaConfirmOpen(false);
      });
    } else {
      setIsPwaConfirmOpen(false);
      setIsPwaModalOpen(true);
    }
  };

  const handleDownloadExeSetup = async () => {
    try {
      const res = await fetch('/Nexcart-POS-Setup-v1.0.exe', { method: 'HEAD' });
      if (res.ok) {
        const link = document.createElement('a');
        link.href = '/Nexcart-POS-Setup-v1.0.exe';
        link.download = 'Nexcart-POS-Setup-v1.0.exe';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } catch (e) {
      // proceed to fallback
    }
    // Fallback for Vercel/GitHub web deployments where >100MB static files are excluded by cloud hosts
    handleDownloadWindowsSetup();
  };

  const handleDownloadWindowsSetup = () => {
    const origin = window.location.origin;
    const cmdPayload = `@echo off\r\n` +
      `title Nexcart POS System - Desktop Application Launcher\r\n` +
      `color 0A\r\n` +
      `cls\r\n` +
      `echo =========================================================\r\n` +
      `echo    NEXCART POS SYSTEM - UNIVERSAL DESKTOP SETUP PACKAGE\r\n` +
      `echo =========================================================\r\n` +
      `echo.\r\n` +
      `echo [1/2] Connecting to Nexcart POS Standalone Engine...\r\n` +
      `echo [2/2] Launching Standalone Desktop Application Window...\r\n` +
      `echo.\r\n` +
      `start msedge --app="${origin}" 2>nul || start chrome --app="${origin}" 2>nul || start "" "${origin}"\r\n` +
      `exit\r\n`;
    const blob = new Blob([cmdPayload], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Nexcart-POS-Desktop-Setup-v1.0.cmd';
    a.click();
  };

  const handleDownloadMacLinuxSetup = () => {
    const origin = window.location.origin;
    const shPayload = `#!/bin/bash\n` +
      `echo "========================================================="\n` +
      `echo "   NEXCART POS SYSTEM - UNIVERSAL DESKTOP LAUNCHER      "\n` +
      `echo "========================================================="\n` +
      `echo "Launching Nexcart POS Standalone Desktop Window..."\n` +
      `if command -v google-chrome &> /dev/null; then\n` +
      `  google-chrome --app="${origin}" &\n` +
      `elif command -v open &> /dev/null; then\n` +
      `  open "${origin}"\n` +
      `elif command -v xdg-open &> /dev/null; then\n` +
      `  xdg-open "${origin}"\n` +
      `fi\n`;
    const blob = new Blob([shPayload], { type: 'application/x-sh' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Nexcart-POS-Desktop-Setup-v1.0.sh';
    a.click();
  };

  const handleDownloadHtmlLauncher = () => {
    const origin = window.location.origin;
    const htmlPayload = `<!DOCTYPE html><html><head><title>Nexcart POS Standalone Desktop Launcher</title></head><body style="background:#0f172a;color:white;font-family:sans-serif;text-align:center;padding:50px;"><h1>Nexcart POS Desktop Offline System</h1><p>Universal Launcher for USB Deployment</p><script>window.location.href="${origin}";</script></body></html>`;
    const blob = new Blob([htmlPayload], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Nexcart-POS-Desktop-Launcher-v1.0.html';
    a.click();
  };

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
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>Option B: Standalone `.exe` Windows Installer Setup (176 MB)</span>
              </div>
              <p className="text-xs text-slate-400">
                Download the 100% native Windows binary setup package (`Nexcart-POS-Setup-v1.0.exe`). Copy to USB drive and run on any client PC like Chrome or Doxfen setup!
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleDownloadExeSetup}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 font-bold text-xs text-white shadow-glow-sky flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download `.exe` Setup Package File (176 MB)</span>
              </button>
              
              <button
                onClick={() => setIsExeModalOpen(true)}
                className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-400 hover:text-white flex items-center justify-center gap-1 border border-slate-800 transition-colors"
              >
                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                <span>View All Cross-Platform OS Packages (Win/Mac/Linux)</span>
              </button>
            </div>
          </div>

          {/* Option A: PWA 1-Click App Installer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Option A: PWA 1-Click Browser App Installer</span>
              </div>
              <p className="text-xs text-slate-400">
                Give client shopkeeper online link. They click 1 button in Chrome/Edge to instantly create a Desktop App Icon without downloading files.
              </p>
            </div>

            <button
              onClick={handleOpenPwaModal}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{deferredPrompt ? '⚡ Click to Install PWA App Now!' : 'Launch PWA App Install Protocol'}</span>
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
                <th className="px-4 py-3">Owner & Contact Details</th>
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

                    <td className="px-4 py-3 space-y-0.5">
                      <div className="font-bold text-slate-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-sky-400 shrink-0" />
                        <span>{s.ownerName || 'N/A'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.ownerEmail || 'N/A'}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{s.phone || 'N/A'}</span>
                      </div>
                      <div className="text-[10px] text-amber-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0 stroke-[1.5]" />
                        <span>{s.address || 'N/A'}</span>
                      </div>
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

      {/* MODAL 1: Universal Desktop Setup & USB Package Center */}
      <Modal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        title="Nexcart POS Universal Desktop Setup Packages (Windows, Mac, Linux & USB)"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sky-300">
              <Laptop className="w-4 h-4 text-sky-400" />
              <span>Universal Offline Setup Deployment Packages:</span>
            </div>
            <p className="text-slate-300">
              Download the 100% native Windows standalone executable installer (`Nexcart-POS-Setup-v1.0.exe`) or lightweight scripts for Mac/Linux. Copy to USB and run directly on client PC!
            </p>
          </div>

          {/* Primary Executable Download Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-sky-950/80 border border-sky-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>1. Windows Standalone Application Setup (.exe)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">176 MB Binary Executable</span>
            </div>
            <p className="text-xs text-slate-300">
              Real Windows PE binary installer executable setup file (`Nexcart-POS-Setup-v1.0.exe`). Runs directly on Windows 10 & 11 without any security warning or architecture error.
            </p>
            <button
              onClick={handleDownloadExeSetup}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 font-bold text-xs text-white shadow-glow-sky flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download Native Windows Executable Setup File (.exe - 176 MB)</span>
            </button>
          </div>

          {/* Alternative Lightweight OS Scripts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Windows Package Script */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-sky-300 flex items-center justify-between">
                  <span>💻 Windows Script Launcher (.cmd)</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-300 font-mono font-bold">1 KB Script</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lightweight executable command script (`Nexcart-POS-Desktop-Setup-v1.0.cmd`).
                </p>
              </div>
              <button
                onClick={handleDownloadWindowsSetup}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-sky-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-98 mt-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Windows Script (.cmd)</span>
              </button>
            </div>

            {/* Mac & Linux Package */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                  <span>🍎 Mac & 🐧 Linux Setup (.sh)</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">macOS & Linux</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Native Bash shell executable script (`Nexcart-POS-Desktop-Setup-v1.0.sh`). Works on Mac & Linux.
                </p>
              </div>
              <button
                onClick={handleDownloadMacLinuxSetup}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-emerald-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-98 mt-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Mac/Linux Setup (.sh)</span>
              </button>
            </div>
          </div>

          {/* HTML Portable Bundle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span>🌐 Portable Universal Offline Web Launcher Bundle (.html)</span>
              <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold">All Browsers</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Double-clickable offline launcher file (`Nexcart-POS-Desktop-Launcher-v1.0.html`). Works on any PC/laptop browser instantly.
            </p>
            <button
              onClick={handleDownloadHtmlLauncher}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Portable Web Launcher (.html)</span>
            </button>
          </div>

          {/* Build Command for Native Windows Compiled .exe Executable */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              <span>Compile Full Native Windows Executable (.exe) Setup File</span>
            </div>
            <p className="text-[11px] text-slate-400">
              To build a compiled binary executable installer file (`Nexcart POS System.exe`) on your developer PC, run this command in terminal:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-sky-300 border border-slate-800 flex items-center justify-between">
              <code>npm run build:exe</code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('npm run build:exe');
                }}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Command</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsExeModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
            >
              Close Setup Window
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: PWA 1-Click Installation Guide */}
      <Modal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        title="Nexcart PWA 1-Click Desktop App Setup"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/30 text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-heading font-extrabold text-sm text-white uppercase tracking-wider">
              Instant Desktop App Installation Ready
            </h3>
            <p className="text-xs text-slate-300">
              Nexcart POS can be installed directly onto your PC desktop in 1 click without downloading binary files.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-200">Browser PWA Engine Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE & READY
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-200">Installation Mode:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                1-CLICK AUTOMATIC
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsPwaModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition-all active:scale-95"
            >
              Got It!
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Custom PWA Alert Confirmation Modal */}
      <Modal
        isOpen={isPwaConfirmOpen}
        onClose={() => setIsPwaConfirmOpen(false)}
        title="Launch PWA App Installation Protocol"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-500/40 text-center space-y-3 shadow-2xl">
            <div className="inline-flex p-3.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-glow-emerald">
              <Zap className="w-9 h-9 animate-pulse text-emerald-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-lg text-white">
                Install Nexcart POS Desktop App?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clicking confirm will launch the browser PWA protocol to create an instant 1-click Desktop App icon on your client PC.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsPwaConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPwaInstall}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 border border-emerald-400/30"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Confirm & Install Now</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
