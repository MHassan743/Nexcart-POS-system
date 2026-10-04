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
import { SuppliersView } from './views/SuppliersView.jsx';
import { PurchasesView } from './views/PurchasesView.jsx';
import { ExpensesView } from './views/ExpensesView.jsx';
import { SalesmenView } from './views/SalesmenView.jsx';
import { DiscountsView } from './views/DiscountsView.jsx';
import { PricingModal } from './components/PricingModal.jsx';

import { RegisterView } from './views/RegisterView.jsx';
import { WarrantyView } from './views/WarrantyView.jsx';
import { InstallmentView } from './views/InstallmentView.jsx';
import { PrescriptionView } from './views/PrescriptionView.jsx';
import { CustomOrdersView } from './views/CustomOrdersView.jsx';
import { JewelryView } from './views/JewelryView.jsx';

import { KeyRound, ShieldAlert, Lock } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Nexcart POS Uncaught UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">System Protection Recovery</h2>
            <p className="text-xs text-slate-400">
              An unexpected display error occurred. Click below to refresh session safely.
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl text-left border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('nexcart_active_user');
                window.location.reload();
              }}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-lg transition-all"
            >
              Reset Session & Reload POS Terminal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainLayout = () => {
  const { user, store, loginWithPin, updateSubscription } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');

  const rawSubStatus = store?.subscriptionStatus || store?.subscription?.status || store?.status;
  const subStatus = (typeof rawSubStatus === 'string' ? rawSubStatus : 'pending_verification').toLowerCase();
  const planId = store?.subscriptionPlan || store?.subscription?.planId || store?.subscription?.planName || store?.plan || null;

  const isPending = subStatus === 'pending_verification';
  const isBlocked = subStatus === 'blocked';
  const isTrial = subStatus === 'trial_active';
  const trialEnd = store?.trialEndDate || store?.subscription?.trialEndDate;
  const isTrialExpired = isTrial && trialEnd && new Date() > new Date(trialEnd);

  const isLocked = (!planId || isPending || isBlocked || isTrialExpired) && activeTab !== 'superadmin';
  const [isPricingOpen, setIsPricingOpen] = useState(isLocked);

  React.useEffect(() => {
    if (isLocked) {
      setIsPricingOpen(true);
    } else {
      setIsPricingOpen(false);
    }
  }, [isLocked]);

  // Quick PIN Switcher Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [switchPinInput, setSwitchPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Super Admin Secret Lock State
  const [isSuperAdminUnlocked, setIsSuperAdminUnlocked] = useState(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminKeyInput, setSuperAdminKeyInput] = useState('');
  const [superAdminError, setSuperAdminError] = useState('');

  const SUPER_ADMIN_KEY = 'Chicknare43@&$';

  if (!user) {
    return <AuthView onCompleteAuth={() => setActiveTab('pos')} />;
  }

  const handleSelectTab = (tabId) => {
    if (tabId === 'superadmin') {
      if (isSuperAdminUnlocked) {
        setActiveTab('superadmin');
      } else {
        setSuperAdminKeyInput('');
        setSuperAdminError('');
        setIsSuperAdminModalOpen(true);
      }
    } else {
      setActiveTab(tabId);
    }
  };

  const handleSuperAdminAuthSubmit = (e) => {
    e.preventDefault();
    setSuperAdminError('');
    if (superAdminKeyInput === SUPER_ADMIN_KEY) {
      setIsSuperAdminUnlocked(true);
      setIsSuperAdminModalOpen(false);
      setIsPricingOpen(false);
      setActiveTab('superadmin');
      setSuperAdminKeyInput('');
    } else {
      setSuperAdminError('Access Denied: This area is restricted for Super Admin only! Kindly back to your work.');
      setSuperAdminKeyInput('');
    }
  };

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
      case 'register':
        return <RegisterView />;
      case 'warranty':
        return <WarrantyView />;
      case 'installments':
        return <InstallmentView />;
      case 'prescription':
        return <PrescriptionView />;
      case 'custom_orders':
        return <CustomOrdersView />;
      case 'jewelry':
        return <JewelryView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'purchases':
        return <PurchasesView />;
      case 'expenses':
        return <ExpensesView />;
      case 'salesmen':
        return <SalesmenView />;
      case 'discounts':
        return <DiscountsView />;
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
        onNavigate={(tab) => handleSelectTab(tab)}
      />

      {/* Main Content Area with Fixed Sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => handleSelectTab(tab)} />

        <main className="flex-1 overflow-y-auto bg-slate-950/80 flex flex-col justify-between">
          <div className="flex-1">
            {renderView()}
          </div>
          {/* Footer Branding Banner */}
          <NexcartFooterBanner />
        </main>
      </div>

      {/* Super Admin Secret Lock Key Modal */}
      <Modal
        isOpen={isSuperAdminModalOpen}
        onClose={() => {
          setIsSuperAdminModalOpen(false);
          setSuperAdminError('');
          setSuperAdminKeyInput('');
        }}
        title="Super Admin Secret Key Verification"
        maxWidth="max-w-md"
        zIndex="z-[60]"
      >
        <form onSubmit={handleSuperAdminAuthSubmit} className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Restricted Super Admin Hub</h4>
            <p className="text-xs text-slate-400">Enter the secret key to access Nexcart Cloud Master Telemetry & Directory</p>
          </div>

          <div>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter Super Admin Secret Key..."
              value={superAdminKeyInput}
              onChange={(e) => setSuperAdminKeyInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-center font-mono font-bold text-base text-white focus:outline-none focus:border-sky-500 tracking-widest"
            />
          </div>

          {superAdminError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{superAdminError}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSuperAdminModalOpen(false)}
              className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 border border-slate-700"
            >
              Back to Work
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-lg transition-all"
            >
              Verify Secret Key
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Switch Cashier PIN Modal */}
      <Modal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Quick Switch Till Cashier PIN"
        maxWidth="max-w-sm"
        zIndex="z-[60]"
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

      {/* Pricing & Subscription Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={isLocked ? undefined : () => setIsPricingOpen(false)}
        currentSubscription={store?.subscription}
        onOpenSuperAdmin={() => {
          setSuperAdminKeyInput('');
          setSuperAdminError('');
          setIsSuperAdminModalOpen(true);
        }}
        onSelectPlan={(subscriptionData) => {
          updateSubscription(subscriptionData);
          if (subscriptionData.status === 'trial_active' || subscriptionData.status === 'paid_active') {
            setIsPricingOpen(false);
          }
        }}
      />
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
    <ErrorBoundary>
      <AuthProvider>
        <POSProvider>
          <MainLayout />
        </POSProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
