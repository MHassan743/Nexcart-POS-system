import React from 'react';
import { ExternalLink, Shield, Zap } from 'lucide-react';

export const NexcartLogo = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 p-1.5 text-white shadow-glow-sky ${className}`}>
    <div className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm animate-pulse-slow"></div>
    <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,15 85,35 85,70 50,90 15,70 15,35" stroke="white" strokeWidth="6" fill="rgba(2, 132, 199, 0.4)"/>
      <text x="50" y="64" fontSize="44" fontWeight="800" fill="white" textAnchor="middle" fontFamily="Outfit, sans-serif">N</text>
    </svg>
  </div>
);

export const NexcartBadge = ({ showLink = true }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-sky-500/30 text-xs font-medium text-slate-300 backdrop-blur-md shadow-lg">
      <NexcartLogo className="w-4 h-4" />
      <span className="text-slate-400">Powered by</span>
      <span className="font-semibold text-sky-400 font-heading">Nexcart Agency</span>
      {showLink && (
        <a 
          href="https://www.nexcart-agency.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-1 text-slate-400 hover:text-sky-300 transition-colors inline-flex items-center gap-0.5"
          title="Visit Nexcart Official Website"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

export const NexcartFooterBanner = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-3 px-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <NexcartLogo className="w-5 h-5" />
        <span className="font-medium text-slate-300">Nexcart POS System v2.5</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Universal Anti-Leakage Retail Platform</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Immutable Audit Log Active</span>
        </div>
        <a 
          href="https://www.nexcart-agency.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium"
        >
          <span>Designed by Nexcart Agency</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
};
