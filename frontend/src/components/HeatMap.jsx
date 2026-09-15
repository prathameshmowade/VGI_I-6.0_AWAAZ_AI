import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

export default function HeatMap() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-emerald-100 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI CIVIC DIGITAL TWIN</span>
            </div>
            <h4 className="font-extrabold text-emerald-950 text-lg">
              Live City Infrastructure Health Representation
            </h4>
          </div>
        </div>

        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold shrink-0">
          Vijay Nagar Zone Health: 67/100
        </span>
      </div>

      {/* Infrastructure Health Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-amber-200 space-y-2">
          <div className="flex justify-between font-bold text-emerald-950">
            <span>Road Health</span>
            <span className="text-amber-600">62%</span>
          </div>
          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '62%' }} />
          </div>
          <span className="text-[10px] text-emerald-700 block font-semibold">Pothole Density: High</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
          <div className="flex justify-between font-bold text-emerald-950">
            <span>Water Mainlines</span>
            <span className="text-emerald-600">91%</span>
          </div>
          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '91%' }} />
          </div>
          <span className="text-[10px] text-emerald-700 block font-semibold">Pressure Normal</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-red-200 space-y-2">
          <div className="flex justify-between font-bold text-emerald-950">
            <span>Sanitation</span>
            <span className="text-red-600">48%</span>
          </div>
          <div className="w-full bg-red-100 h-2 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: '48%' }} />
          </div>
          <span className="text-[10px] text-red-700 block font-semibold">Dump Cleanup Needed</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
          <div className="flex justify-between font-bold text-emerald-950">
            <span>Smart Lighting</span>
            <span className="text-teal-600">88%</span>
          </div>
          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: '88%' }} />
          </div>
          <span className="text-[10px] text-emerald-700 block font-semibold">Grid Stable</span>
        </div>
      </div>
    </div>
  );
}
