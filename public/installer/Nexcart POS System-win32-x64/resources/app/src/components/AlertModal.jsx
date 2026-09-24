import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = "Attention Required", 
  message, 
  type = "warning", 
  confirmText = "Understood" 
}) => {
  if (!isOpen) return null;

  const styles = {
    warning: {
      border: "border-amber-500/40",
      glow: "shadow-amber-500/10",
      iconBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      button: "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold shadow-glow-amber",
      Icon: AlertTriangle
    },
    error: {
      border: "border-rose-500/40",
      glow: "shadow-rose-500/10",
      iconBg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      button: "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold shadow-lg",
      Icon: AlertCircle
    },
    success: {
      border: "border-emerald-500/40",
      glow: "shadow-emerald-500/10",
      iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      button: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-lg",
      Icon: CheckCircle2
    },
    info: {
      border: "border-sky-500/40",
      glow: "shadow-sky-500/10",
      iconBg: "bg-sky-500/15 border-sky-500/30 text-sky-400",
      button: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold shadow-glow-sky",
      Icon: Info
    }
  };

  const currentStyle = styles[type] || styles.warning;
  const { Icon } = currentStyle;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-sm bg-slate-900 ${currentStyle.border} border rounded-2xl p-6 shadow-2xl ${currentStyle.glow} flex flex-col items-center text-center space-y-4 animate-scale-up relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Icon Badge */}
        <div className={`p-4 rounded-2xl border ${currentStyle.iconBg} shadow-inner animate-bounce-short`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <div className="space-y-1.5">
          <h3 className="font-heading font-extrabold text-base text-white tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${currentStyle.button}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};
