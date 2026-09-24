import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { POSProvider } from './context/POSContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Modal } from './components/Modal.jsx';
import { NexcartFooterBanner } from './components/NexcartBranding.jsx';

import { AuthView } from './views/AuthView.jsx';
import { POSView } from './views/POSView.jsx';
import { InventoryView } from './views/InventoryView.jsx';
import { ReconciliationView } from './views/ReconciliationView.jsx';
import { CustomersView } from './views/CustomersView.jsx';
import { ReportsView } from './views/ReportsView.jsx';
import { AuditView } from './views/AuditView.jsx';
import { SuperAdminView } from './views/SuperAdminView.jsx';
import { SettingsView } from './views/SettingsView.jsx';
import { ReturnsView } from './views/ReturnsView.jsx';

import { KeyRound, ShieldAlert } from 'lucide-react';

const MainLayout = () => {
  const { user, loginWithPin } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  
  // Quick PIN Switcher Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [switchPinInput, setSwitchPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  if (!user) {
    return <AuthView onCompleteAuth={() => setActiveTab('pos')} />;
  }

  const handleQuickPinSwitch = (e) => {
    e.preventDefault();
    setPinError('');
    const res = loginWithPin(switchPinInput);
    if (res.success) {
      setIsPinModalOpen(false);
      setSwitchPinInput('');
    } else {
      setPinError(res.message);
      setSwitchPinInput('');
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'pos':
        return <POSView />;
      case 'inventory':
        return <InventoryView />;
      case 'reconciliation':
        return <ReconciliationView />;
      case 'customers':
        return <CustomersView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditView />;
      case 'superadmin':
        return <SuperAdminView />;
      case 'returns':
        return <ReturnsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <POSView />;
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* Top Header Navbar */}
      <Navbar 
        onOpenPinModal={() => {
          setSwitchPinInput('');
          setPinError('');
          setIsPinModalOpen(true);
        }}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area with Fixed Sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        <main className="flex-1 overflow-y-auto bg-slate-950/80 flex flex-col justify-between">
          <div className="flex-1">
            {renderView()}
          </div>
          {/* Footer Branding Banner */}
          <NexcartFooterBanner />
        </main>
      </div>

      {/* Quick Switch Cashier PIN Modal */}
      <Modal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Quick Switch Till Cashier PIN"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleQuickPinSwitch} className="space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">Enter Employee 4-Digit PIN</h4>
            <p className="text-[11px] text-slate-400">Instantly switch active cashier without logging out of register session</p>
          </div>

          <div>
            <input
              type="password"
              maxLength={4}
              required
              autoFocus
              placeholder="Enter PIN (e.g. 1234, 5678, 8888, 9999)"
              value={switchPinInput}
              onChange={(e) => setSwitchPinInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-center font-mono font-bold text-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {pinError && (
            <div className="text-xs text-rose-400 text-center font-semibold">{pinError}</div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg"
          >
            Switch Active Cashier
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default function App() {
  React.useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  return (
    <AuthProvider>
      <POSProvider>
        <MainLayout />
      </POSProvider>
    </AuthProvider>
  );
}
