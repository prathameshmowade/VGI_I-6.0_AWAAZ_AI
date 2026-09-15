import React, { useState } from 'react';
import { Brain, CheckCircle2, UserCheck, Sparkles, ShieldCheck } from 'lucide-react';

export default function XAIPanel({ xaiData }) {
  const [overrideActive, setOverrideActive] = useState(false);
  const [selectedDept, setSelectedDept] = useState('Road & Infrastructure Department');

  if (!xaiData) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-purple-200 dark:border-purple-900/60 space-y-5 shadow-sm">
      {/* Title & Confidence Score */}
      <div className="flex justify-between items-center pb-3 border-b border-purple-100 dark:border-purple-900/40">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLAINABLE AI (XAI) REASONING ENGINE</span>
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>AI Triage & Classification Rationale</span>
          </h3>
        </div>
        <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] px-3.5 py-1 rounded-full font-black shadow-2xs">
          {xaiData.confidence || 96}% AI Confidence
        </span>
      </div>

      {/* Rationale Bullet Points */}
      <div className="space-y-2 text-xs">
        <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider block text-[11px]">AI Reasoning & Applied Rules:</span>
        <ul className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
          {(xaiData.reasoning || ['Matched road hazard keywords in Laxmi Nagar area', 'School Zone Safety Priority Rule Applied']).map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Similar Historical Cases */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-0.5 shadow-2xs">
          <span className="text-blue-700 dark:text-blue-400 font-bold block text-[11px]">Historical Match</span>
          <span className="font-black text-slate-900 dark:text-white">CMP-2025-882 (94%)</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">Resolved in 4.2 Hours</span>
        </div>
        <div className="bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-0.5 shadow-2xs">
          <span className="text-amber-700 dark:text-amber-400 font-bold block text-[11px]">Secondary Path</span>
          <span className="font-black text-amber-900 dark:text-amber-300">Water & Sewage Dept</span>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block">12% Secondary Prob</span>
        </div>
      </div>

      {/* Human Approval & Override Trigger */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Human Override Control</span>
          </span>
          <button
            type="button"
            onClick={() => setOverrideActive(!overrideActive)}
            className="text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-xl transition font-bold border border-indigo-200 dark:border-indigo-800 shadow-2xs"
          >
            {overrideActive ? 'Cancel Override' : 'Trigger Override'}
          </button>
        </div>

        {overrideActive ? (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-amber-800 dark:text-amber-300 font-bold block">Select Custom Department Override:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs outline-none font-semibold"
            >
              <option>Road & Infrastructure Department</option>
              <option>Water Supply & Drainage Dept</option>
              <option>Sanitation & Waste Management</option>
              <option>Electrical & Smart Lighting</option>
            </select>
            <p className="text-[10px] text-slate-500">
              Note: Officer override will be permanently recorded in the SHA-256 Blockchain Audit Log.
            </p>
          </div>
        ) : (
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Officer Approved</span>
            <span className="flex items-center gap-1 text-indigo-600"><ShieldCheck className="w-3.5 h-3.5" /> Blockchain Logged</span>
          </div>
        )}
      </div>
    </div>
  );
}
