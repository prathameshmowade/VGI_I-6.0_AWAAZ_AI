import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { ThumbsUp, MapPin, Sparkles, Camera, CheckCircle2, Play, Building2, Bot, AlertTriangle, Send, UserCheck } from 'lucide-react';

const DEPT_BADGES = {
  'Road Damage': { label: 'Roads & Infra', icon: '🏛️', color: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200' },
  'DEPT_ROAD': { label: 'Roads & Infra', icon: '🏛️', color: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200' },
  'Roads & Infrastructure Department': { label: 'Roads & Infra', icon: '🏛️', color: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200' },

  'Water Supply': { label: 'Water & Drainage', icon: '💧', color: 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-200' },
  'DEPT_WATER': { label: 'Water & Drainage', icon: '💧', color: 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-200' },
  'Water Supply & Drainage Dept': { label: 'Water & Drainage', icon: '💧', color: 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-200' },

  'Sanitation': { label: 'Sanitation & Waste', icon: '🧹', color: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200' },
  'DEPT_SANITATION': { label: 'Sanitation & Waste', icon: '🧹', color: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200' },
  'Sanitation & Waste Management': { label: 'Sanitation & Waste', icon: '🧹', color: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200' },

  'Electrical': { label: 'Electrical & Lighting', icon: '⚡', color: 'bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-200' },
  'DEPT_ELECTRICAL': { label: 'Electrical & Lighting', icon: '⚡', color: 'bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-200' },
  'Electrical & Smart Lighting': { label: 'Electrical & Lighting', icon: '⚡', color: 'bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-200' },

  'Parks': { label: 'Parks & Amenities', icon: '🌳', color: 'bg-teal-50 text-teal-900 border-teal-300 dark:bg-teal-950/50 dark:text-teal-200' },
  'DEPT_PARKS': { label: 'Parks & Amenities', icon: '🌳', color: 'bg-teal-50 text-teal-900 border-teal-300 dark:bg-teal-950/50 dark:text-teal-200' },
  'Parks & Public Amenities': { label: 'Parks & Amenities', icon: '🌳', color: 'bg-teal-50 text-teal-900 border-teal-300 dark:bg-teal-950/50 dark:text-teal-200' }
};

export default function KanbanCard({ complaint, onSelect, onStatusChange }) {
  const [upvotes, setUpvotes] = useState(complaint.upvotes || Math.floor(Math.random() * 20) + 5);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (!hasUpvoted) {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  const compId = complaint.complaintId || complaint._id;
  const verificationsCount = complaint.verified_count ?? complaint.verificationsCount ?? (complaint.verifications ? complaint.verifications.length : 0);
  const priorityWeight = complaint.priority_weight || 1;
  const verificationStatus = complaint.verification_status || 'NONE';
  const verificationFailures = complaint.verification_failures || 0;

  const handleAssign = (e) => {
    e.stopPropagation();
    onStatusChange?.(compId, 'Assigned');
  };

  const handleStartWork = (e) => {
    e.stopPropagation();
    onStatusChange?.(compId, 'In Progress');
  };

  const handleMarkSolved = (e) => {
    e.stopPropagation();
    onStatusChange?.(compId, 'Resolved');
  };

  // Resolve Department Badge info
  const deptKey = complaint.department || complaint.departmentCode || complaint.category;
  const deptInfo = DEPT_BADGES[deptKey] || DEPT_BADGES[complaint.category] || {
    label: complaint.department || complaint.category || 'Municipal Services',
    icon: '🏛️',
    color: 'bg-slate-50 text-slate-900 border-slate-200'
  };

  const isAutoFromOther = complaint.isAutoClassified || (complaint.category && complaint.category.includes('Other')) || complaint.customCategory;

  return (
    <div
      onClick={() => onSelect?.(complaint)}
      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer space-y-3 shadow-xs transition-all hover:-translate-y-1"
    >
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {compId}
        </span>
        <StatusBadge status={complaint.status} />
      </div>

      {/* Department & AI Badges */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${deptInfo.color}`}>
          <span>{deptInfo.icon}</span>
          <span>{deptInfo.label}</span>
        </span>

        {/* Telegram Direct Ingestion Badge */}
        {complaint.source === 'telegram' && (
          <span className="text-[10px] font-bold bg-sky-50 text-sky-900 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
            <Send className="w-3 h-3 text-[#2AABEE]" />
            <span>Telegram Bot</span>
          </span>
        )}

        {isAutoFromOther && (
          <span className="text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
            <Bot className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>🤖 NLP Auto-Routed</span>
          </span>
        )}

        {/* Priority Weight Badge for failed verification */}
        {priorityWeight > 1 && (
          <span className="text-[10px] font-bold bg-rose-50 text-rose-900 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>⚡ Priority ×{priorityWeight}</span>
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">{complaint.title}</h4>

      {/* Description */}
      {complaint.description && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{complaint.description}</p>
      )}

      {/* Resolution Photo Proof Badge & 7-Day Window Indicator */}
      {complaint.resolutionProof && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 flex items-center gap-2">
          <img src={complaint.resolutionProof} alt="Work Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
          <div className="text-[10px] space-y-0.5 flex-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Camera className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Officer Proof Attached</span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold block">
              Official Municipal Certification
            </span>
          </div>
        </div>
      )}

      {/* Review Window Banner */}
      {(complaint.status === 'Under Verification' || complaint.status === 'Pending Verification') && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-2 text-[10px] text-amber-950 dark:text-amber-200 font-semibold space-y-0.5">
          <span className="font-bold text-amber-900 dark:text-amber-300 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>⏳ Review & Audit Window Active</span>
          </span>
          <span className="text-amber-800 dark:text-amber-400 text-[9.5px] block leading-tight">
            {complaint.timeRemainingHuman ? `${complaint.timeRemainingHuman} remaining in audit cycle.` : 'Work under community citizen review.'}
          </span>
        </div>
      )}

      {/* Verification Failed Banner */}
      {verificationFailures > 0 && complaint.status === 'Not Assigned' && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl p-2 text-[10px] text-rose-950 dark:text-rose-200 font-semibold space-y-0.5">
          <span className="font-bold text-rose-900 dark:text-rose-300 block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>🔄 Returned — Verification {verificationStatus === 'EXPIRED' ? 'Expired' : 'Failed'} ({verificationFailures}x)</span>
          </span>
          <span className="text-rose-800 dark:text-rose-400 text-[9.5px] block leading-tight">
            Priority weight: ×{priorityWeight}. Requires reassignment.
          </span>
        </div>
      )}

      {/* Meta Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>{complaint.location?.address || complaint.location || 'Nagpur Central'}</span>
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>{complaint.confidenceScore || 95}% AI</span>
        </span>
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between pt-1 gap-1.5">
        <button
          type="button"
          onClick={handleUpvote}
          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
            hasUpvoted
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
          <span>{upvotes}</span>
        </button>

        {onStatusChange && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* New / Accepted / Not Assigned: Show "Assign" Button */}
            {(complaint.status === 'New' || complaint.status === 'new' || complaint.status === 'Accepted' || complaint.status === 'Not Assigned' || !complaint.status) && (
              <button
                type="button"
                onClick={handleAssign}
                className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-800 dark:text-indigo-200 font-bold px-2.5 py-1 rounded-lg transition border border-indigo-200 dark:border-indigo-700 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                title="Assign ticket to officer"
              >
                <UserCheck className="w-3 h-3 text-indigo-600" />
                <span>Assign</span>
              </button>
            )}

            {/* Assigned: Show "Start Work" Button */}
            {complaint.status === 'Assigned' && (
              <button
                type="button"
                onClick={handleStartWork}
                className="text-[10px] bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-200 font-bold px-2.5 py-1 rounded-lg transition border border-amber-200 dark:border-amber-700 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                title="Start field work on this assigned grievance"
              >
                <Play className="w-3 h-3 text-amber-600" />
                <span>Start Work</span>
              </button>
            )}

            {/* In Progress: Show "Mark Solved" Button */}
            {(complaint.status === 'In Progress' || complaint.status === 'In-Progress' || complaint.status === 'Started') && (
              <button
                type="button"
                onClick={handleMarkSolved}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
                title="Attach resolution proof & move to verification"
              >
                <Camera className="w-3 h-3 text-white" />
                <span>Mark Solved</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
