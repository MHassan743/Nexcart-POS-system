import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Upload, 
  Copy, 
  Check, 
  Smartphone, 
  Building2, 
  Globe, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  CreditCard,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';

export const PAYMENT_METHODS = {
  jazzcash: {
    id: 'jazzcash',
    name: 'JazzCash',
    accountTitle: 'Muhammad Hassan Asghar',
    accountNumber: '03226352346',
    instructions: 'Send funds via JazzCash mobile app or retail agent to 03226352346.',
    color: 'amber'
  },
  easypaisa: {
    id: 'easypaisa',
    name: 'EasyPaisa',
    accountTitle: 'Muhammad Hassan Asghar',
    accountNumber: '03407542382',
    instructions: 'Send funds via EasyPaisa mobile app or shopkeeper to 03407542382.',
    color: 'emerald'
  },
  bank: {
    id: 'bank',
    name: 'Bank Transfer',
    accountTitle: 'Muhammad Hassan Asghar',
    iban: 'PK56JCMA2104923226352346',
    bankName: 'JazzCash Digital Microfinance Bank',
    instructions: 'Transfer funds via any Banking App (HBL, Meezan, Alfalah, UBL, etc.) to JazzCash IBAN.',
    color: 'sky'
  },
  sadapay: {
    id: 'sadapay',
    name: 'International / SadaPay',
    accountTitle: 'Muhammad Hassan Asghar',
    bankName: 'SadaPay Digital Bank — Pakistan',
    iban: 'PK88SADA0000003407542382',
    swift: 'SADAPKKA',
    country: 'PK Pakistan',
    instructions: 'Send international wire or domestic transfer via SadaPay, Wise, or Remitly.',
    color: 'purple'
  }
};

export const PRICING_PLANS = [
  {
    id: 'trial',
    name: '1 Month Free Trial',
    badge: '100% FREE',
    price: 'Rs 0',
    period: 'for 30 Days',
    highlight: 'Ideal for trying out Nexcart POS',
    features: [
      'Full Access to POS Billing Terminal',
      'Inventory & Barcode Scanner',
      'Customer Khaata & Balance Ledger',
      'Real-time Cloud Telemetry Sync',
      '30 Days Zero-Cost Access'
    ],
    note: '1 month use is 100% FREE with zero setup fee. After 1 month, if you choose to continue, a one-time Setup Fee of Rs 17,000 + Rs 10,000/month System Maintenance Fee will be charged. If you do not choose a paid plan, access will be automatically blocked after 1 month.',
    isPopular: false,
    requiresProof: false
  },
  {
    id: 'monthly',
    name: 'Monthly Maintenance Plan',
    badge: 'POPULAR',
    price: 'Rs 10,000',
    period: '/ month',
    highlight: 'Rs 10,000/month + Rs 17,000 setup = Rs 27,000 first month total',
    features: [
      'All POS Terminal & Inventory Features',
      'Unlimited Cloud Telemetry & Backup',
      'Customer Khaata & SMS Invoicing',
      'Priority 24/7 Technical Support',
      'Regular Anti-Leakage System Updates'
    ],
    note: 'One-time Setup Fee: Rs 17,000 (charged once at activation) + Rs 10,000/month ongoing maintenance. First month total: Rs 27,000.',
    isPopular: true,
    requiresProof: true
  },
  {
    id: 'annual',
    name: 'Annual Discounted Plan',
    badge: 'BEST VALUE - SAVE Rs 34,400 (29% OFF)',
    price: 'Rs 85,600',
    period: '/ year',
    highlight: 'Rs 85,600/year + Rs 17,000 setup = Rs 102,600 first year total',
    features: [
      'Everything in Monthly Plan',
      'Save Rs 34,400 — 29% Annual Discount',
      '1 Full Year VIP Priority Cloud Sync',
      'Free Business Onboarding Support',
      'Guaranteed Zero Price Increase for 1 Year'
    ],
    note: 'First year total: Rs 85,600 annual fee + Rs 17,000 one-time setup = Rs 102,600. From 2nd year onwards, only Rs 85,600/year.',
    isPopular: false,
    requiresProof: true
  },
  {
    id: 'premium',
    name: 'Premium All-Inclusive Plan',
    badge: 'ALL FEATURES UNLOCKED',
    price: 'Rs 20,000',
    period: '/ month',
    highlight: 'Monthly: Rs 41,000 first month total | Yearly: Rs 200,000/year (Save Rs 40,000)',
    features: [
      'Includes All Core POS Features',
      'Suppliers Management & Payables',
      'Salesmen & Commission Tracking',
      'Stock Reconciliation Anti-Leakage',
      'Security Audit Trail',
      'Advanced Reporting & Analytics',
      'Outdoor Medicine Sourcing'
    ],
    note: 'Includes ALL 6 Enterprise Features unlocked out of the box with zero feature locking + 1 Year VIP Priority Support.',
    isPopular: false,
    requiresProof: true
  }
];

export const PricingModal = ({ isOpen, onClose, onSelectPlan, currentSubscription, onOpenSuperAdmin }) => {
  const [selectedPlanId, setSelectedPlanId] = useState('trial');
  const [premiumCycle, setPremiumCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [activePaymentTab, setActivePaymentTab] = useState('jazzcash');
  const [copiedField, setCopiedField] = useState('');
  const [slipImage, setSlipImage] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Early return if not open placed after hooks below

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 10MB');
        return;
      }
      setErrorMsg('');
      setSlipImage(file);

      // Compress image using Canvas to ensure fast sync to MongoDB
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setSlipPreview(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const rawPlan = PRICING_PLANS.find(p => p.id === selectedPlanId);

    if (rawPlan.id === 'trial' && hasAlreadyUsedTrial) {
      setErrorMsg('Free Trial can only be claimed once! Please select a paid maintenance plan.');
      return;
    }

    if (rawPlan.requiresProof && !slipPreview) {
      setErrorMsg('Please upload payment transaction slip image to submit your plan claim!');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Determine final plan details for Premium Plan based on toggle
    let finalPlanId = rawPlan.id;
    let finalPlanName = rawPlan.name;
    let finalPlanPrice = rawPlan.price;

    if (rawPlan.id === 'premium') {
      if (premiumCycle === 'monthly') {
        finalPlanId = 'premium_monthly';
        finalPlanName = 'Premium Plan (Monthly)';
        finalPlanPrice = 'Rs 20,000 / month (+ Rs 21,000 setup = Rs 41,000 total)';
      } else {
        finalPlanId = 'premium_yearly';
        finalPlanName = 'Premium Plan (Yearly Discounted)';
        finalPlanPrice = 'Rs 200,000 / year (Save Rs 40,000)';
      }
    }

    const subscriptionData = {
      planId: finalPlanId,
      planName: finalPlanName,
      planPrice: finalPlanPrice,
      status: rawPlan.id === 'trial' ? 'trial_active' : 'pending_verification',
      trialStartDate: now.toISOString(),
      trialEndDate: trialExpiry,
      hasUsedTrial: true,
      paymentMethod: rawPlan.requiresProof ? activePaymentTab : 'none',
      paymentSlip: slipPreview || null,
      submittedAt: now.toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSelectPlan(subscriptionData);
    }, 600);
  };

  const isPending = currentSubscription?.status === 'pending_verification';
  const isBlocked = currentSubscription?.status === 'blocked';
  const isTrialActive = currentSubscription?.status === 'trial_active';
  const hasAlreadyUsedTrial = Boolean(
    currentSubscription?.hasUsedTrial || 
    currentSubscription?.planId === 'trial' || 
    currentSubscription?.trialStartDate ||
    isBlocked
  );

  // If trial was already used and trial is selected, fallback to monthly plan
  useEffect(() => {
    if (hasAlreadyUsedTrial && selectedPlanId === 'trial') {
      setSelectedPlanId('monthly');
    }
  }, [hasAlreadyUsedTrial]);

  if (!isOpen) return null;

  const getTransferDetails = (planId, cycle) => {
    if (planId === 'trial') {
      return {
        name: '1 Month Free Trial',
        priceLabel: 'Rs 0',
        transferTotal: 'Rs 0',
        transferNote: 'Zero Cost (30 Days Free Trial)'
      };
    }
    if (planId === 'monthly') {
      return {
        name: 'Monthly Maintenance Plan',
        priceLabel: 'Rs 10,000 / mo',
        transferTotal: 'Rs 27,000',
        transferNote: 'Rs 10,000/mo fee + Rs 17,000 setup = Rs 27,000 first month total'
      };
    }
    if (planId === 'annual') {
      return {
        name: 'Annual Discounted Plan',
        priceLabel: 'Rs 85,600 / yr',
        transferTotal: 'Rs 1,02,600',
        transferNote: 'Rs 85,600/yr annual fee + Rs 17,000 setup = Rs 1,02,600 first year total'
      };
    }
    if (planId === 'premium') {
      if (cycle === 'monthly') {
        return {
          name: 'Premium All-Inclusive Plan (Monthly)',
          priceLabel: 'Rs 20,000 / mo',
          transferTotal: 'Rs 41,000',
          transferNote: 'Rs 20,000/mo fee + Rs 21,000 setup = Rs 41,000 first month total'
        };
      } else {
        return {
          name: 'Premium All-Inclusive Plan (Yearly)',
          priceLabel: 'Rs 200,000 / yr',
          transferTotal: 'Rs 200,000',
          transferNote: 'Rs 200,000 annual fee (Save Rs 40,000 OFF standard rate)'
        };
      }
    }
    return {
      name: 'Monthly Maintenance Plan',
      priceLabel: 'Rs 10,000 / mo',
      transferTotal: 'Rs 27,000',
      transferNote: 'Rs 10,000/mo fee + Rs 17,000 setup = Rs 27,000 first month total'
    };
  };

  const currentPlanObj = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[1];
  const currentTransfer = getTransferDetails(selectedPlanId, premiumCycle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 text-center relative shrink-0">
          {onOpenSuperAdmin && (
            <button
              type="button"
              onClick={onOpenSuperAdmin}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="Super Admin Secret Key Verification"
            >
              <CreditCard className="w-3.5 h-3.5 text-sky-400" />
              <span>Super Admin Key</span>
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nexcart POS Business Subscription & Pricing</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-white tracking-wide">
            Select Your Store Maintenance Plan
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-1">
            Start with our 1 Month 100% Free Trial or activate your paid maintenance subscription with instant cloud telemetry verification.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {isPending && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-1 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>⏳ Payment Proof Slip Submitted — Pending Super Admin Approval</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Your transaction proof slip is currently being reviewed by Super Admin in Nexcart Cloud Hub. Terminal access will unlock automatically upon Super Admin approval.
              </p>
            </div>
          )}

          {isBlocked && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>⛔ Store POS Access Blocked — Subscription Maintenance Expired</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Your 1 Month Free Trial or Subscription has ended. Please select a paid maintenance plan, transfer funds, and upload receipt screenshot below to restore register access.
              </p>
            </div>
          )}
          {/* Plan Cards Selection — 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isTrial = plan.id === 'trial';
              const isPremium = plan.id === 'premium';
              const isTrialDisabled = isTrial && hasAlreadyUsedTrial;

              // Dynamic price & period for Premium Plan toggle
              const displayPrice = isPremium
                ? (premiumCycle === 'monthly' ? 'Rs 20,000' : 'Rs 200,000')
                : plan.price;
              
              const displayPeriod = isPremium
                ? (premiumCycle === 'monthly' ? '/ month' : '/ year')
                : plan.period;

              const displayHighlight = isPremium
                ? (premiumCycle === 'monthly' 
                    ? 'Rs 20,000/mo + Rs 21,000 setup = Rs 41,000 first month total' 
                    : 'Rs 200,000/year (Save Rs 40,000 OFF standard Rs 240,000 rate)')
                : plan.highlight;

              const displayNote = isPremium
                ? (premiumCycle === 'monthly'
                    ? 'One-time Setup Fee: Rs 21,000 + Rs 20,000/month. First month: Rs 41,000. Unlocks ALL 6 enterprise features automatic!'
                    : 'Annual Fee: Rs 200,000/year (Standard rate Rs 240,000/yr). You SAVE Rs 40,000! Unlocks ALL 6 enterprise features automatic!')
                : plan.note;

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    if (isTrialDisabled) return;
                    setSelectedPlanId(plan.id);
                  }}
                  className={`relative rounded-xl p-5 transition-all flex flex-col justify-between border ${
                    isTrialDisabled
                      ? 'bg-slate-900/30 border-slate-800/80 opacity-50 cursor-not-allowed grayscale-[40%]'
                      : isSelected 
                        ? isPremium 
                          ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/30 scale-[1.02] cursor-pointer'
                          : 'bg-slate-800/90 border-sky-500 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/30 scale-[1.02] cursor-pointer' 
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600 cursor-pointer'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow ${
                      isTrialDisabled 
                        ? 'bg-slate-700 text-slate-400' 
                        : isPremium
                          ? 'bg-purple-500 text-white shadow-purple-500/20'
                          : 'bg-sky-500 text-slate-950'
                    }`}>
                      {isTrialDisabled ? 'CLAIMED / USED' : isPremium && premiumCycle === 'yearly' ? 'SAVE Rs 40,000 (17% OFF)' : plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading text-base font-bold text-white">{plan.name}</h3>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected && !isTrialDisabled ? (isPremium ? 'border-purple-400 bg-purple-500 text-white' : 'border-sky-400 bg-sky-500 text-slate-950') : 'border-slate-600'
                      }`}>
                        {isSelected && !isTrialDisabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Premium Plan Toggle Selector */}
                    {isPremium && (
                      <div 
                        className="my-2 p-1 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanId('premium');
                            setPremiumCycle('monthly');
                          }}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                            premiumCycle === 'monthly'
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Monthly (Rs 20k)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanId('premium');
                            setPremiumCycle('yearly');
                          }}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                            premiumCycle === 'yearly'
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Yearly (Rs 200k)
                        </button>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-extrabold text-white">{displayPrice}</span>
                      <span className="text-xs text-slate-400 font-medium">{displayPeriod}</span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 font-medium">{displayHighlight}</p>

                    <div className="space-y-2 pt-3 border-t border-slate-700/60 text-xs">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPremium ? 'text-purple-400' : 'text-emerald-400'}`} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note block */}
                  <div className={`mt-4 pt-3 border-t text-[11px] leading-snug p-2.5 rounded-lg border ${
                    isTrialDisabled
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-300/90'
                      : isPremium
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-200'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300/90'
                  }`}>
                    <span className="font-bold">
                      {isTrialDisabled ? '⚠️ Trial Claimed: ' : 'Note: '}
                    </span>
                    {isTrialDisabled 
                      ? 'Free trial has already been used on this register. Please choose a paid plan to activate your store.' 
                      : displayNote}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Section (If Paid Plan or Claim Verification) */}
          {currentPlanObj.requiresProof && (
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>Official Online Payment Gateway Accounts</span>
                </div>
                <div className="text-xs text-slate-400">
                  Transfer total <strong className="text-amber-300 text-sm font-extrabold">{currentTransfer.transferTotal}</strong> ({currentTransfer.transferNote}) to any account below:
                </div>
              </div>

              {/* Payment Tab Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const isActive = activePaymentTab === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setActivePaymentTab(method.id)}
                      className={`p-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                        isActive 
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      {method.id === 'jazzcash' && <Smartphone className="w-4 h-4 text-amber-400" />}
                      {method.id === 'easypaisa' && <Smartphone className="w-4 h-4 text-emerald-400" />}
                      {method.id === 'bank' && <Building2 className="w-4 h-4 text-sky-400" />}
                      {method.id === 'sadapay' && <Globe className="w-4 h-4 text-purple-400" />}
                      <span>{method.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Payment Details Box */}
              {activePaymentTab === 'jazzcash' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">JazzCash Account Number:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_METHODS.jazzcash.accountNumber, 'jazzcash')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px]"
                    >
                      {copiedField === 'jazzcash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'jazzcash' ? 'Copied!' : PAYMENT_METHODS.jazzcash.accountNumber}</span>
                    </button>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Account Title: <strong className="text-white">{PAYMENT_METHODS.jazzcash.accountTitle}</strong>
                  </div>
                </div>
              )}

              {activePaymentTab === 'easypaisa' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">EasyPaisa Account Number:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_METHODS.easypaisa.accountNumber, 'easypaisa')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px]"
                    >
                      {copiedField === 'easypaisa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'easypaisa' ? 'Copied!' : PAYMENT_METHODS.easypaisa.accountNumber}</span>
                    </button>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Account Title: <strong className="text-white">{PAYMENT_METHODS.easypaisa.accountTitle}</strong>
                  </div>
                </div>
              )}

              {activePaymentTab === 'bank' && (
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-3">
                  <div className="space-y-1">
                    <div className="text-slate-400 text-[11px]">Bank: <strong className="text-white">{PAYMENT_METHODS.bank.bankName}</strong></div>
                    <div className="text-slate-400 text-[11px]">Account Title: <strong className="text-white">{PAYMENT_METHODS.bank.accountTitle}</strong></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-sky-500/20">
                    <span className="text-slate-300 font-semibold">JazzCash IBAN:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_METHODS.bank.iban, 'bank_iban')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[11px] font-mono"
                    >
                      {copiedField === 'bank_iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'bank_iban' ? 'Copied IBAN!' : PAYMENT_METHODS.bank.iban}</span>
                    </button>
                  </div>
                </div>
              )}

              {activePaymentTab === 'sadapay' && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>Account Holder: <strong className="text-white">{PAYMENT_METHODS.sadapay.accountTitle}</strong></div>
                    <div>Bank: <strong className="text-white">{PAYMENT_METHODS.sadapay.bankName}</strong></div>
                    <div>SWIFT / BIC: <strong className="text-white font-mono">{PAYMENT_METHODS.sadapay.swift}</strong></div>
                    <div>Bank Country: <strong className="text-white">{PAYMENT_METHODS.sadapay.country}</strong></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                    <span className="text-slate-300 font-semibold">SadaPay IBAN:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_METHODS.sadapay.iban, 'sadapay_iban')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] font-mono"
                    >
                      {copiedField === 'sadapay_iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'sadapay_iban' ? 'Copied IBAN!' : PAYMENT_METHODS.sadapay.iban}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Payment Slip Proof Input */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-200">
                  Upload Payment Transaction Slip Proof (Screenshot/Receipt):
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/80 hover:bg-slate-900 cursor-pointer text-xs text-slate-400 hover:text-white transition-all">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>{slipImage ? slipImage.name : 'Click to select transaction receipt screenshot'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {slipPreview && (
                    <div className="w-12 h-12 rounded-lg border border-slate-700 overflow-hidden bg-slate-950 shrink-0">
                      <img src={slipPreview} alt="Payment Proof Slip" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Selected: <strong className="text-white">{currentTransfer.name} — Transfer Total: {currentTransfer.transferTotal}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Processing Subscription...' : 'Claim & Confirm Plan'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
