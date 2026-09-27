import React, { useState, useEffect } from 'react';
import { syncService } from '../services/syncService.js';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const SyncStatusIndicator = ({ compact = false }) => {
  const [status, setStatus] = useState(syncService.getStatus());

  useEffect(() => {
    // Subscribe to background sync service updates
    const unsubscribe = syncService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = (e) => {
    e.stopPropagation();
    syncService.triggerSync();
  };

  const { isSyncing, isOnline, pendingCount, isStorePending } = status;

  // Determine state display theme & label
  let stateConfig = {
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    dotBg: 'bg-emerald-400 shadow-glow-emerald',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    label: 'Synced with Cloud',
    subLabel: 'All local data backed up'
  };

  if (!isOnline) {
    stateConfig = {
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      dotBg: 'bg-rose-500',
      icon: <CloudOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
      label: pendingCount > 0 ? `Offline (${pendingCount} Pending)` : 'Offline Mode',
      subLabel: 'Working locally, will auto-sync when online'
    };
  } else if (isSyncing) {
    stateConfig = {
      badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
      dotBg: 'bg-sky-400 animate-ping',
      icon: <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />,
      label: 'Syncing Data...',
      subLabel: 'Uploading records to Nexcart Cloud Hub'
    };
  } else if (pendingCount > 0) {
    stateConfig = {
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      dotBg: 'bg-amber-400 animate-pulse',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
      label: `Sync Pending (${pendingCount})`,
      subLabel: isStorePending ? 'Store setup waiting for cloud sync' : `${pendingCount} record(s) queued for sync`
    };
  }

  if (compact) {
    return (
      <div 
        onClick={handleManualSync}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ${stateConfig.badgeBg}`}
        title={`${stateConfig.label} — ${stateConfig.subLabel}. Click to sync now.`}
      >
        <span className={`w-2 h-2 rounded-full ${stateConfig.dotBg}`}></span>
        {stateConfig.icon}
        <span className="truncate max-w-[130px]">{stateConfig.label}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${stateConfig.badgeBg}`}>
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          {stateConfig.icon}
          <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${stateConfig.dotBg}`}></span>
        </div>
        <div>
          <div className="font-bold flex items-center gap-1.5">
            <span>{stateConfig.label}</span>
          </div>
          <div className="text-[10px] opacity-80 leading-tight mt-0.5">
            {stateConfig.subLabel}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleManualSync}
        disabled={isSyncing}
        className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-200 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 shrink-0 ml-2"
        title="Trigger manual cloud sync now"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
      </button>
    </div>
  );
};
