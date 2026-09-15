import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Clock, AlertTriangle } from 'lucide-react';

export default function SLATimer({ hoursRemaining = 34, totalHours = 48 }) {
  const { t, isHindi } = useContext(LanguageContext);
  const pct = Math.max(0, (hoursRemaining / totalHours) * 100);
  const urgent = hoursRemaining <= 12;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{t('sla_timer_title')}</span>
        </span>
        <span className={`font-bold font-mono px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1.5 shadow-2xs ${
          urgent
            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 animate-pulse border border-rose-200 dark:border-rose-800'
            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
        }`}>
          {urgent && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
          <span>{hoursRemaining}{isHindi ? ' घंटे शेष (48 घंटे SLA)' : `h remaining (${totalHours}h SLA)`}</span>
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            urgent ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
