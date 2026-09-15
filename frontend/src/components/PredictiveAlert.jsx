import React from 'react';
import { AlertTriangle, CloudRain, Sparkles, ShieldCheck } from 'lucide-react';

export default function PredictiveAlert() {
  return (
    <div className="bg-amber-50/80 border border-amber-200 p-6 md:p-8 rounded-2xl space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>PREDICTIVE INFRASTRUCTURE INTELLIGENCE</span>
            </div>
            <h4 className="font-extrabold text-emerald-950 text-lg">
              Monsoon Failure Hotspot & Policy Alert
            </h4>
          </div>
        </div>

        <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-bold shrink-0">
          Monsoon Risk Score: High (88%)
        </span>
      </div>

      {/* Grid of Predictive Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
          <div className="flex justify-between items-center text-amber-900 font-bold">
            <span className="flex items-center gap-1">
              <CloudRain className="w-4 h-4 text-amber-600" />
              <span>Weather & Infra Sync</span>
            </span>
            <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded">Dharampeth Zone</span>
          </div>
          <p className="text-emerald-900 text-[11px] leading-relaxed">
            3-Day heavy rain forecast + 8-yr drainage pipe age. AI has auto-scheduled pre-emptive clearance before 40+ complaints occur.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
          <div className="flex justify-between items-center text-emerald-900 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Capital Policy Advisor</span>
            </span>
            <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Capital Upgrade</span>
          </div>
          <p className="text-emerald-900 text-[11px] leading-relaxed">
            Recommends allocating ₹18 Lakh for Sadar Zone mainline resurfacing instead of 34 repeated pothole patches. Projected 48% complaint drop.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
          <div className="flex justify-between items-center text-emerald-900 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-City Brain Sync</span>
            </span>
            <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Nagpur + Pune</span>
          </div>
          <p className="text-emerald-900 text-[11px] leading-relaxed">
            Privacy-preserving AI trained across Nagpur, Pune & Bengaluru. Instant pattern transfer for waterlogging mitigation.
          </p>
        </div>
      </div>
    </div>
  );
}
