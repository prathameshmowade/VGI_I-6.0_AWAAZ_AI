import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  ShieldCheck,
  Camera,
  MapPin,
  Calendar,
  UserCheck,
  ThumbsUp,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function CitizenResolutionModal({
  notification,
  complaint,
  onClose,
  onFeedback
}) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [satisfaction, setSatisfaction] = useState(null); // 'satisfied' | 'unsatisfied'

  const data = notification || complaint || {};
  const ticketId = data.complaintId || data._id || 'CMP-2026';
  const title = data.title || 'Civic Grievance';
  const category = data.category || 'Road Damage';
  const location = data.location || 'Reported Location';
  const officerName = data.officerName || 'Municipal Officer';
  const notes = data.resolutionNotes || data.completionNotes || 'Work has been executed and verified on site.';
  
  // Before photo (Issue Evidence)
  const beforePhoto = data.evidencePhoto || data.proof || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80';
  
  // After photo (Resolution Proof)
  const afterPhoto = data.resolutionProof || data.completionProof || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80';

  const handleSatisfaction = (isSatisfied) => {
    setSatisfaction(isSatisfied ? 'satisfied' : 'unsatisfied');
    setFeedbackSent(true);
    onFeedback?.(ticketId, isSatisfied);
    setTimeout(() => {
      onClose?.();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/60 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Official Resolution Proof
                </span>
                <span className="font-mono text-xs text-emerald-100 font-bold">
                  {ticketId}
                </span>
              </div>
              <h2 className="text-lg font-black leading-tight mt-0.5 text-white">
                Grievance Officially Resolved
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Issue Summary */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {location}
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {category}
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Verified & Resolved
            </span>
          </div>

          {/* Before & After Photo Proof Comparison */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Camera className="w-4 h-4 text-emerald-600" />
                Before & After Evidence Inspection
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Tamper-Proof Audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    🔴 BEFORE (Citizen Report)
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 dark:border-amber-800/80 bg-slate-950 aspect-video shadow-xs group">
                  <img
                    src={beforePhoto}
                    alt="Issue Reported"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Original Complaint Photo
                  </div>
                </div>
              </div>

              {/* After Photo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    🟢 AFTER (Officer Resolution)
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 dark:border-emerald-600 bg-slate-950 aspect-video shadow-md group">
                  <img
                    src={afterPhoto}
                    alt="Resolution Verified"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CERTIFIED WORK
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded">
                    Field Completion Proof
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Officer Certification & Notes */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Certified By: {officerName}</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-xs italic bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              "{notes}"
            </p>
          </div>

          {/* Citizen Feedback / Confirmation Action */}
          {feedbackSent ? (
            <div className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl text-center space-y-1 animate-in zoom-in-95">
              <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Thank you! Your feedback has been recorded on the civic ledger.</span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-300 text-xs">
                {satisfaction === 'satisfied' ? 'Rated as Satisfactorily Resolved ⭐' : 'Escalation noted for supervisory audit.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                Are you satisfied with the completed work?
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSatisfaction(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Yes, I Am Satisfied ✓</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSatisfaction(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 px-4 rounded-xl transition"
                >
                  Report Issue Still Exists
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
