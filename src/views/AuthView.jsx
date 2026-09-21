import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { BUSINESS_TYPES } from '../services/seedData.js';
import { NexcartLogo, NexcartBadge } from '../components/NexcartBranding.jsx';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Store, 
  User, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';

export const AuthView = ({ onCompleteAuth }) => {
  const { loginWithPin, loginWithEmail, registerStore } = useAuth();
  const [mode, setMode] = useState('pin'); // 'pin', 'email', 'signup'
  
  // PIN Form State
  const [pin, setPin] = useState('');
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup Form State
  const [signupForm, setSignupForm] = useState({
    storeName: '',
    businessType: 'crockery',
    ownerName: '',
    ownerEmail: '',
    ownerPin: '9999',
    currency: 'GBP',
    taxRate: 20,
    phone: '',
    address: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Quick PIN Keypad press
  const handlePinPress = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        submitPin(newPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const submitPin = (pinToSubmit) => {
    setError('');
    const result = loginWithPin(pinToSubmit);
    if (result.success) {
      onCompleteAuth();
    } else {
      setError(result.message);
      setPin('');
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = loginWithEmail(email, password);
    if (result.success) {
      onCompleteAuth();
    } else {
      setError(result.message);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!signupForm.storeName || !signupForm.ownerEmail || !signupForm.ownerName) {
      setError('Please fill in all required store information');
      return;
    }

    try {
      registerStore(signupForm);
      setSuccessMsg('Store registered successfully under Nexcart Serverless Cloud Hub!');
      setTimeout(() => {
        onCompleteAuth();
      }, 1000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex mb-3">
            <NexcartLogo className="w-14 h-14" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-wide">
            Nexcart POS System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Universal Anti-Leakage Retail & Inventory Management System
          </p>
          <div className="mt-3 flex justify-center">
            <NexcartBadge showLink={true} />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => { setMode('pin'); setError(''); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'pin' ? 'bg-sky-600 text-white shadow-glow-sky' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Till PIN</span>
          </button>
          <button
            onClick={() => { setMode('email'); setError(''); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'email' ? 'bg-sky-600 text-white shadow-glow-sky' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Owner Login</span>
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>New Store</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center animate-bounce-subtle">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Quick Till PIN Login */}
          {mode === 'pin' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-slate-200">Enter Cashier 4-Digit PIN</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Quick access for Cashier or Manager at Register</p>
              </div>

              {/* PIN Display Dots */}
              <div className="flex justify-center gap-4 py-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      i < pin.length 
                        ? 'bg-sky-400 border-sky-300 shadow-glow-sky scale-110' 
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handlePinPress(num.toString())}
                    className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 font-heading font-bold text-lg text-white transition-all active:scale-95 shadow"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handlePinBackspace}
                  className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-400 transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={() => handlePinPress('0')}
                  className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 font-heading font-bold text-lg text-white transition-all active:scale-95 shadow"
                >
                  0
                </button>
                <button
                  onClick={() => submitPin(pin)}
                  className="h-12 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white transition-all active:scale-95 shadow-glow-sky flex items-center justify-center"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Demo Credentials hint */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-sky-400 uppercase tracking-wide">Demo Cashier PINs:</div>
                <div className="flex justify-between">
                  <span>Senior Cashier: <strong className="text-white">1234</strong></span>
                  <span>Junior Cashier: <strong className="text-white">5678</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>Store Owner: <strong className="text-white">9999</strong></span>
                  <span>Store Manager: <strong className="text-white">8888</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Admin Email Login */}
          {mode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@nexcart.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password / Secret</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-glow-sky transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In as Store Owner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-center">
                Demo Owner Email: <strong className="text-sky-300">admin@nexcart.com</strong> (Password: any)
              </div>
            </form>
          )}

          {/* 3. Serverless Store Signup / Onboarding */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Crockery & Glassware London"
                  value={signupForm.storeName}
                  onChange={(e) => setSignupForm({ ...signupForm, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Business Industry *</label>
                  <select
                    value={signupForm.businessType}
                    onChange={(e) => {
                      const bType = e.target.value;
                      const config = BUSINESS_TYPES[bType.toUpperCase()] || BUSINESS_TYPES.GENERAL;
                      setSignupForm({
                        ...signupForm,
                        businessType: bType,
                        currency: config.defaultCurrency,
                        taxRate: config.defaultTaxRate
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="crockery">Crockery & Home Goods</option>
                    <option value="grocery">Grocery & Supermarket</option>
                    <option value="electronics">Electronics & Gadgets</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="general">General Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Currency</label>
                  <select
                    value={signupForm.currency}
                    onChange={(e) => setSignupForm({ ...signupForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="PKR">PKR (₨)</option>
                    <option value="AED">AED (Dh)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={signupForm.ownerName}
                    onChange={(e) => setSignupForm({ ...signupForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@store.com"
                    value={signupForm.ownerEmail}
                    onChange={(e) => setSignupForm({ ...signupForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Till Owner PIN *</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={signupForm.ownerPin}
                    onChange={(e) => setSignupForm({ ...signupForm, ownerPin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white text-center font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={signupForm.taxRate}
                    onChange={(e) => setSignupForm({ ...signupForm, taxRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register Store on Nexcart Serverless Cloud</span>
              </button>
            </form>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Anti-Leakage Audit Protection & Serverless Telemetry Enabled</span>
        </div>
      </div>
    </div>
  );
};
