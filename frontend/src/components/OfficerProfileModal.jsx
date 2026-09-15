import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, UserCheck, Building2, MapPin, Briefcase, BarChart3, Clock, AlertTriangle } from 'lucide-react';

export default function OfficerProfileModal({ officerId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/civic/officers/${officerId}/profile`);
        if (res.data && res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        // Fallback demo data
        setProfile({
          officerId,
          name: 'Er. Rajesh Sharma',
          designation: 'Ward Engineer',
          departmentId: 'DEPT_ROAD',
          departmentName: 'Roads & Infrastructure Department',
          jurisdiction: { ward: '12', zone: 'East', zoneName: 'Laxmi Nagar Zone' },
          responsibilities: ['Road Infrastructure', 'Footpath Maintenance', 'Flyover Inspection'],
          stats: { activeComplaints: 14, pending: 8, inProgress: 4, overdue: 2, avgResolutionHours: 31 },
          areaCovered: [{ wardId: '12', wardName: 'Ward 12 — Laxmi Nagar', zoneName: 'Laxmi Nagar Zone' }]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [officerId]);

  const StatBox = ({ label, value, color }) => (
    <div className={`p-3 rounded-xl border ${color} text-center`}>
      <span className="text-lg font-black block">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5 opacity-80">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-base">Officer Profile</h3>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Official Government Information</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading officer profile...</div>
        ) : profile ? (
          <div className="p-6 space-y-5">
            {/* Officer Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-200 dark:border-emerald-800">
                  {profile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">{profile.name}</h4>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">{profile.designation}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{profile.departmentName}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Ward {profile.jurisdiction?.ward} — {profile.jurisdiction?.zoneName}
                </span>
                <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {profile.jurisdiction?.zone} Zone
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            {profile.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatBox label="Active" value={profile.stats.activeComplaints} color="bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" />
                <StatBox label="Pending" value={profile.stats.pending} color="bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300" />
                <StatBox label="In Progress" value={profile.stats.inProgress} color="bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300" />
                <StatBox label="Overdue" value={profile.stats.overdue} color="bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300" />
              </div>
            )}

            {/* Avg Resolution */}
            {profile.stats && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Average Resolution Time</span>
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-white">{profile.stats.avgResolutionHours} hours</span>
              </div>
            )}

            {/* Responsibilities */}
            {profile.responsibilities && profile.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Current Responsibilities
                </h5>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Ward {profile.jurisdiction?.ward}</span>
                  {profile.responsibilities.map((r, i) => (
                    <span key={i} className="text-emerald-700 dark:text-emerald-400 block pl-4 relative before:content-['├──'] before:absolute before:left-0 before:text-emerald-400 before:font-mono last:before:content-['└──']">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Area Covered */}
            {profile.areaCovered && profile.areaCovered.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Area Covered
                </h5>
                <div className="flex flex-wrap gap-2">
                  {profile.areaCovered.map((area, i) => (
                    <span key={i} className="text-[11px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg font-bold">
                      {area.wardName} • {area.zoneName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Only official government information is displayed. Personal contact details are not shared as per privacy policy.</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">Officer not found.</div>
        )}
      </div>
    </div>
  );
}
