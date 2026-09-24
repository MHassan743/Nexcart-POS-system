import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { FileText, Shield, Search, Lock, UserCheck, Clock } from 'lucide-react';

export const AuditView = () => {
  const { auditLogs } = usePOS();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchQuery = log.details.toLowerCase().includes(search.toLowerCase()) || 
                        log.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchQuery && matchAction;
  });

  const actionsList = ['ALL', ...new Set(auditLogs.map(l => l.action))];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-400" />
            <span>Immutable Security Audit Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System anti-fraud backbone: Read-only permanent ledger recording every inventory, sales, and auth event.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>READ-ONLY IMMUTABLE LOG</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail details or employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          {actionsList.map(a => (
            <option key={a} value={a}>Event: {a}</option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Employee & Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Event Details</th>
                <th className="px-4 py-3">Register Till</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{log.employeeName}</div>
                    <div className="text-[10px] text-sky-400 font-mono">{log.role}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.action.includes('SALE') 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : log.action.includes('MANUAL') || log.action.includes('DISCREPANCY')
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-200 leading-relaxed text-[11px]">
                    {log.details}
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-400">
                    {log.tillId || 'Till-01'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
