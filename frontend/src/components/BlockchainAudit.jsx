import React from 'react';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function BlockchainAudit({ hash = '8f9a2b3c4d5e6f7a...' }) {
  return (
    <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 font-mono text-xs space-y-3 shadow-xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-emerald-900">
        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-sans">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>SHA-256 Blockchain Audit Verification</span>
        </span>
        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded font-bold border border-emerald-200">
          Block #142
        </span>
      </div>

      <div className="space-y-1">
        <span className="text-slate-400 text-[10px] block font-sans">Cryptographic Ledger Event Hash:</span>
        <p className="text-slate-900 dark:text-white break-all bg-slate-50 dark:bg-emerald-900/30 p-3 rounded-xl border border-slate-200 dark:border-emerald-800 text-[11px] select-all">
          {hash}
        </p>
      </div>

      <div className="flex justify-between items-center text-[11px] font-sans text-slate-500 font-medium pt-1">
        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tamper-Evident Immutable Log</span>
        </span>
        <span>Public Ledger Verified ✓</span>
      </div>
    </div>
  );
}
