import React from 'react';
import { TrendingUp, PieChart } from 'lucide-react';

export default function AnalyticsCharts() {
  const trendData = [45, 52, 38, 64, 71, 89, 110, 142];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      {/* Monthly Grievance Resolution Trend */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
          <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Monthly Resolution Trend</span>
          </h4>
          <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded text-[11px] border border-emerald-200">
            +28% Month-over-Month
          </span>
        </div>

        <div className="h-40 flex items-end gap-2 pt-4">
          {trendData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className="w-full bg-emerald-600 rounded-t transition-all group-hover:bg-emerald-700"
                style={{ height: `${(v / 150) * 100}%` }}
                title={`${months[i]}: ${v} Resolved`}
              />
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Workload Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
          <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Department Volume Distribution</span>
          </h4>
          <span className="text-emerald-800 font-mono text-[11px] font-bold">100% Verified</span>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-emerald-900">
              <span>Roads & Infrastructure</span>
              <span className="text-emerald-700 font-bold">42%</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-emerald-900">
              <span>Water Supply & Drainage</span>
              <span className="text-emerald-700 font-bold">28%</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: '28%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-emerald-900">
              <span>Sanitation & Solid Waste</span>
              <span className="text-amber-700 font-bold">18%</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-emerald-900">
              <span>Electrical & Smart Lighting</span>
              <span className="text-blue-700 font-bold">12%</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '12%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
