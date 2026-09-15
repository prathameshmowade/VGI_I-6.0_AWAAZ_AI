import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, HardHat, MapPin, FileText, BarChart3, Clock, Trophy, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ContractorProfileModal({ contractorId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/civic/contractors/${contractorId}/profile`);
        if (res.data && res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        // Fallback demo data
        setProfile({
          contractorId,
          name: 'Apex Infrastructure Pvt Ltd',
          departmentId: 'DEPT_ROAD',
          assignedWards: ['12', '7', '1'],
          contactOffice: 'IMC Contractor Office, Nagar Nigam HQ, Indore',
          registrationNo: 'IMC-REG-2024-0142',
          stats: {
            totalAssigned: 128, completed: 102, pending: 21, overdue: 5,
            avgResolutionHours: 18.4, slaCompliance: 92, resolutionRate: 88,
            citizenSatisfaction: 84, repeatComplaints: 7, performanceScore: 87
          },
          contractDetails: [{
            workOrderId: 'WO-2026-1042', project: 'Ward 12 Road Resurfacing & Pothole Repair',
            ward: '12', assetType: 'Road', slaHours: 48, status: 'Active',
            startDate: '2026-04-01', endDate: '2027-03-31'
          }],
          calculatedPerformanceScore: 87,
          performanceBadge: '🏆 Good Performance'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [contractorId]);

  const MetricBar = ({ label, value, max = 100, color }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="font-bold text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-black text-slate-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value, max)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-base">Contractor Profile</h3>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Registered Business Information</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading contractor profile...</div>
        ) : profile ? (
          <div className="p-6 space-y-5">
            {/* Contractor Name + Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">{profile.name}</h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Registration: {profile.registrationNo || 'N/A'}
                </span>
                {profile.contactOffice && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    📍 {profile.contactOffice}
                  </span>
                )}
              </div>
              <span className={`text-xs font-black px-3 py-1.5 rounded-xl border shadow-2xs whitespace-nowrap ${
                profile.calculatedPerformanceScore >= 85
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : profile.calculatedPerformanceScore >= 70
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}>
                {profile.performanceBadge}
              </span>
            </div>

            {/* Assigned Areas */}
            <div className="flex flex-wrap gap-1.5">
              {(profile.assignedWards || []).map(w => (
                <span key={w} className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-bold">
                  Ward {w}
                </span>
              ))}
            </div>

            {/* Performance Score */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Performance Score</span>
              </div>
              <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300 block">{profile.calculatedPerformanceScore}%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                40% SLA + 25% Resolution + 20% Satisfaction + 15% Repeat Complaints
              </span>
            </div>

            {/* Metric Bars */}
            <div className="space-y-3">
              <MetricBar label="SLA Compliance" value={profile.stats?.slaCompliance} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
              <MetricBar label="Resolution Rate" value={profile.stats?.resolutionRate} color="bg-gradient-to-r from-blue-500 to-indigo-500" />
              <MetricBar label="Citizen Satisfaction" value={profile.stats?.citizenSatisfaction} color="bg-gradient-to-r from-purple-500 to-pink-500" />
              <MetricBar label={`Repeat Complaints (lower is better)`} value={profile.stats?.repeatComplaints} max={30} color="bg-gradient-to-r from-rose-500 to-red-500" />
            </div>

            {/* Work Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-base font-black text-slate-900 dark:text-white block">{profile.stats?.totalAssigned}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Total</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300 block">{profile.stats?.completed}</span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase">Done</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-700">
                <span className="text-base font-black text-amber-700 dark:text-amber-300 block">{profile.stats?.pending}</span>
                <span className="text-[9px] font-bold text-amber-600 uppercase">Pending</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-700">
                <span className="text-base font-black text-rose-700 dark:text-rose-300 block">{profile.stats?.overdue}</span>
                <span className="text-[9px] font-bold text-rose-600 uppercase">Overdue</span>
              </div>
            </div>

            {/* Avg Resolution */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Average Resolution Time</span>
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">{profile.stats?.avgResolutionHours} hours</span>
            </div>

            {/* Active Contracts */}
            {profile.contractDetails && profile.contractDetails.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" /> Active Contracts
                </h5>
                {profile.contractDetails.map((c, i) => (
                  <div key={i} className="bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-amber-800 dark:text-amber-300 font-mono">{c.workOrderId}</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">{c.status}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-bold block">{c.project}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">Ward {c.ward} • {c.assetType} • SLA: {c.slaHours}h • {c.startDate} to {c.endDate}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Only registered business and official project information is displayed. Individual employee details are not shared.</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">Contractor not found.</div>
        )}
      </div>
    </div>
  );
}
