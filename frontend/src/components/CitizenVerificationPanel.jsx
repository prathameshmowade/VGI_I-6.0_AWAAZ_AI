import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import {
  ShieldCheck, CheckCircle2, UserCheck, Camera, AlertCircle,
  Sparkles, XCircle, Clock, AlertTriangle, ThumbsUp, ThumbsDown,
  MessageSquare, Award, Shield, Loader2
} from 'lucide-react';

const VOTE_STORAGE_KEY = 'awaaz_citizen_7day_votes';

export const getCitizenClientId = () => {
  try {
    let id = localStorage.getItem('awaaz_citizen_client_id');
    if (!id) {
      id = 'CITIZEN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('awaaz_citizen_client_id', id);
    }
    return id;
  } catch (e) {
    return 'CITIZEN-' + Date.now().toString(36);
  }
};

export const getStoredVotes = () => {
  try {
    const raw = localStorage.getItem(VOTE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const valid = {};
    Object.entries(parsed).forEach(([key, record]) => {
      if (record && record.votedAt && (now - new Date(record.votedAt).getTime() < sevenDaysMs)) {
        valid[key] = record;
      }
    });
    return valid;
  } catch (e) {
    return {};
  }
};

export const storeUserVote = (complaintId, userIdentifiers, voteType) => {
  try {
    const stored = getStoredVotes();
    const now = new Date().toISOString();
    const ids = Array.isArray(userIdentifiers) ? userIdentifiers : [userIdentifiers];
    ids.filter(Boolean).forEach((id) => {
      const key = `${complaintId}_${String(id).trim().toLowerCase()}`;
      stored[key] = {
        complaintId,
        userIdentifier: id,
        vote: voteType,
        votedAt: now
      };
    });
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(stored));
  } catch (e) {}
};

export const checkUserStoredVote = (complaintId, identifiers = []) => {
  try {
    const stored = getStoredVotes();
    for (const id of identifiers) {
      if (!id) continue;
      const key = `${complaintId}_${String(id).trim().toLowerCase()}`;
      if (stored[key]) {
        return stored[key];
      }
    }
  } catch (e) {}
  return null;
};

export default function CitizenVerificationPanel({ complaint, onVerified, onVerificationUpdate }) {
  const { user } = useContext(AuthContext);
  const langCtx = useContext(LanguageContext);
  const isHindi = langCtx?.isHindi || false;
  const [loading, setLoading] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [localComp, setLocalComp] = useState(complaint);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Keep local state in sync when parent feed updates
  useEffect(() => {
    if (complaint) {
      setLocalComp(complaint);
    }
  }, [complaint]);

  if (!localComp) return null;

  // Determine current state from backend fields
  const verifiedCount = localComp.verified_count ?? localComp.verificationsCount ?? (localComp.verifications?.length || 0);
  const rejectedCount = localComp.rejected_count ?? 0;
  const requiredCount = localComp.requiredVerifications || 3;
  const priorityWeight = localComp.priority_weight || 1;
  const verificationStatus = localComp.verification_status || 'NONE';
  const isCompleted = localComp.status === 'Completed' || localComp.status === 'Verified & Resolved' || verificationStatus === 'VERIFIED';
  const isFailed = verificationStatus === 'FAILED' || verificationStatus === 'EXPIRED';
  const isUnderVerification = localComp.status === 'Under Verification' || localComp.status === 'Pending Verification';

  // Check proof availability
  const proofImage = localComp.completion_proof || localComp.resolutionProof;
  const proofNotes = localComp.completion_notes || localComp.resolutionNotes;
  const completedBy = localComp.completed_by;

  if (!proofImage && !isUnderVerification && !isCompleted) return null;

  // Determine citizen identity using distinct client device ID for anonymous guests
  const clientDeviceId = getCitizenClientId();
  const citizenId = user?.citizenId || user?.email || user?.mobile || (user?.name && user.name !== 'Verified Citizen' ? user.name : clientDeviceId);
  const citizenName = user?.name || 'Verified Citizen';
  const citizenEmail = user?.email || '';

  const genericIdentifiers = ['guest', 'verified citizen', 'citizen', 'anonymous', 'citizen-anonymous', 'local resident', 'user'];

  // Only non-generic identifiers are tracked for duplicate prevention to avoid false locks
  const userIdentifiers = [
    citizenId,
    citizenEmail,
    user?.citizenId,
    user?.email,
    clientDeviceId
  ].filter((id) => id && !genericIdentifiers.includes(String(id).trim().toLowerCase()));

  // Check 7-day localStorage vote persistence
  const compId = localComp.complaintId || localComp._id;
  const storedVoteRecord = checkUserStoredVote(compId, userIdentifiers);
  const alreadyVotedLocally = !!storedVoteRecord;

  // Check if current user has already voted (from backend data or voters array)
  const hasVotedInBackend = localComp.hasVoted || false;
  const userVoteInBackend = localComp.userVote || null;

  // Check in voters list
  const votersList = localComp.voters || [];
  const inVoters = votersList.some((v) => {
    const vId = (v.citizenId || '').trim().toLowerCase();
    const vEmail = (v.citizenEmail || '').trim().toLowerCase();
    const vName = (v.citizenName || '').trim().toLowerCase();
    return userIdentifiers.some((myId) => {
      const norm = String(myId).trim().toLowerCase();
      if (!norm || genericIdentifiers.includes(norm)) return false;
      return norm === vId || (vEmail && norm === vEmail) || (vName && !genericIdentifiers.includes(vName) && norm === vName);
    });
  });

  // Also check legacy verifications array
  const legacyVoted = (localComp.verifications || []).some((v) => {
    const vId = (v.citizenId || '').trim().toLowerCase();
    const vEmail = (v.citizenEmail || '').trim().toLowerCase();
    const vName = (v.citizenName || '').trim().toLowerCase();
    return userIdentifiers.some((myId) => {
      const norm = String(myId).trim().toLowerCase();
      if (!norm || genericIdentifiers.includes(norm)) return false;
      return norm === vId || (vEmail && norm === vEmail) || (vName && !genericIdentifiers.includes(vName) && norm === vName);
    });
  });

  // Strict: 1 vote per citizen per problem in 7 days
  const hasVoted = hasVotedInBackend || inVoters || legacyVoted || alreadyVotedLocally;
  const userVote = userVoteInBackend || (storedVoteRecord ? storedVoteRecord.vote : null) || 'VERIFIED';
  const canVote = localComp.canVote !== undefined ? (localComp.canVote && !hasVoted) : !hasVoted;

  // Check if user is an officer or administrator
  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'admin';

  // Check if user is the completing officer
  const isCompletingOfficer = completedBy && (
    citizenId === (completedBy.id || completedBy.email || completedBy.name) ||
    (user?.email && user.email === completedBy.email) ||
    (user?.role === 'officer' && user?.name === completedBy.name)
  );

  const effectiveCanVote = !isOfficerOrAdmin && canVote && !hasVoted && !isCompletingOfficer && isUnderVerification && !isCompleted && !isFailed;

  // Time remaining
  const timeRemaining = localComp.timeRemainingHuman || '';

  // Voters list
  const voters = localComp.voters || localComp.verifications || [];

  // ─── Submit Vote ───
  const handleVote = async (voteType) => {
    if (!effectiveCanVote || loading) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axios.post(`/api/complaints/${localComp.complaintId}/verify`, {
        vote: voteType,
        citizenId,
        citizenName,
        citizenEmail,
        feedback: feedbackInput || (voteType === 'VERIFIED'
          ? 'Verified work completion at site.'
          : 'Work not completed — rejected.'),
        location: {}
      });

      if (res.data?.success) {
        const updated = res.data.data;
        storeUserVote(localComp.complaintId || localComp._id, userIdentifiers, voteType);
        
        const newVerifiedCount = updated.verified_count !== undefined
          ? updated.verified_count
          : (verifiedCount + (voteType === 'VERIFIED' ? 1 : 0));
        const newStatus = updated.status || (newVerifiedCount >= requiredCount ? 'Completed' : localComp.status);

        const updatedState = {
          ...localComp,
          ...updated,
          status: newStatus,
          verified_count: newVerifiedCount,
          hasVoted: true,
          userVote: voteType,
          canVote: false
        };

        setLocalComp(updatedState);
        setSuccessMsg(res.data.message || (isHindi ? 'सत्यापन सफलतापूर्वक दर्ज हुआ। 7-दिन की विंडो में आपका वोट सुरक्षित है।' : 'Verification recorded successfully. Your vote is recorded for this 7-day window.'));
        
        // Notify parent components
        onVerified?.(updatedState);
        onVerificationUpdate?.(updatedState);
      } else {
        setErrorMsg(res.data?.message || 'Verification failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Network error submitting verification.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setFeedbackInput('');
    }
  };

  // ─── Progress Bar ───
  const progressPercent = Math.min((verifiedCount / requiredCount) * 100, 100);

  return (
    <div className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border shadow-xs space-y-5 transition-all ${
      isCompleted
        ? 'border-emerald-300 dark:border-emerald-800'
        : isFailed
        ? 'border-rose-300 dark:border-rose-800'
        : 'border-indigo-200 dark:border-indigo-900'
    }`}>
      {/* ─── Header Bar ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{isHindi ? 'नागरिक सत्यापन प्रोटोकॉल' : 'CITIZEN VERIFICATION PROTOCOL'}</span>
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {localComp.complaintId}
            </span>
            <span className="line-clamp-1">{localComp.title}</span>
          </h3>
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Weight Badge */}
          {priorityWeight > 1 && (
            <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
              <AlertTriangle className="w-3 h-3" />
              <span>⚡ Priority ×{priorityWeight}</span>
            </span>
          )}

          {/* Verification Counter Badge */}
          <span className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-2xs ${
            isCompleted
              ? 'bg-emerald-600 text-white border-emerald-600'
              : isFailed
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
          }`}>
            {isCompleted ? (
              <>
                <Award className="w-4 h-4" />
                <span>{isHindi ? '✓ समुदाय द्वारा सत्यापित' : `✓ Community Verified (${verifiedCount}/${requiredCount})`}</span>
              </>
            ) : isFailed ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>{isHindi ? 'सत्यापन विफल' : 'Verification Failed'}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>{verifiedCount}/{requiredCount} {isHindi ? 'सत्यापित' : 'Verified'}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* ─── Officer Proof Section ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Proof Image */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isHindi ? 'अधिकारी कार्य पूर्ति फोटो प्रमाण' : 'Officer Completion Proof'}</span>
          </span>
          {proofImage && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-xs">
              <img
                src={proofImage}
                alt="Officer Resolution Proof"
                className="w-full h-44 object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>GPS Verified • Officer Upload</span>
              </div>
              {completedBy && (
                <div className="absolute top-2 right-2 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {completedBy.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details & Action Panel */}
        <div className="space-y-3 flex flex-col justify-between">
          {/* Work Report */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs flex-1">
            <span className="text-slate-900 dark:text-white font-bold block">{isHindi ? 'अधिकारी कार्य रिपोर्ट:' : 'Officer Work Report:'}</span>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {proofNotes || (isHindi ? 'कार्य पूर्ण किया गया।' : 'Work completed and verified by officer.')}
            </p>
            {localComp.completed_at && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3" />
                <span>{isHindi ? 'पूर्ण:' : 'Completed:'} {new Date(localComp.completed_at).toLocaleString()}</span>
              </span>
            )}
            {localComp.category && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                📁 {localComp.category} • {localComp.location || localComp.jurisdiction?.zoneName || 'Indore'}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span>{isHindi ? 'सत्यापन प्रगति' : 'Verification Progress'}</span>
              <span>{verifiedCount}/{requiredCount} {isHindi ? 'नागरिक' : 'Citizens'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isFailed
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {timeRemaining && !isCompleted && !isFailed && (
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{isHindi ? 'शेष समय:' : 'Time Remaining:'} {timeRemaining}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Error / Success Messages ─── */}
      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-800 dark:text-rose-300 font-semibold">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-emerald-800 dark:text-emerald-300 font-semibold">{successMsg}</p>
        </div>
      )}

      {/* ─── Voting Actions ─── */}
      {isUnderVerification && !isCompleted && !isFailed && (
        <div className="space-y-3">
          {/* Officer Audit Information Notice */}
          {isOfficerOrAdmin && (
            <div className="bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                {isHindi
                  ? 'अधिकारी दृश्य: नागरिक सत्यापन विकल्प केवल स्थानीय नागरिकों और निवासियों के लिए सक्रिय है।'
                  : 'Officer Audit Mode: Citizen verification voting is reserved for local residents and community auditors.'}
              </span>
            </div>
          )}

          {/* Officer self-verification warning */}
          {!isOfficerOrAdmin && isCompletingOfficer && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isHindi ? 'आप अपना काम स्वयं सत्यापित नहीं कर सकते।' : 'You cannot verify your own completed work.'}</span>
            </div>
          )}

          {/* Already voted indicator — 1 vote per citizen in 7-day window */}
          {hasVoted && (
            <div className={`rounded-xl p-3.5 text-xs font-bold flex flex-col gap-1.5 border shadow-2xs ${
              userVote === 'REJECTED'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                {userVote === 'REJECTED'
                  ? <XCircle className="w-4 h-4 text-rose-600" />
                  : <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                }
                <span className="font-extrabold">
                  {userVote === 'REJECTED'
                    ? (isHindi ? 'आपने इस समस्या को अस्वीकार किया ✘' : 'You rejected this work resolution ✘')
                    : (isHindi ? 'आपने इस कार्य को सत्यापित किया ✓' : 'You verified this problem resolution ✓')
                  }
                </span>
              </div>
              <p className="text-[11px] font-normal leading-relaxed opacity-90 pl-6 text-slate-700 dark:text-slate-300">
                {isHindi
                  ? '🔒 सत्यापन नियम: एक नागरिक 7-दिन की विंडो के दौरान किसी समस्या को केवल एक बार सत्यापित कर सकता है।'
                  : '🔒 7-Day Window Rule: Each citizen can only verify a particular problem once within the 7-day duration.'}
              </p>
            </div>
          )}

          {/* Vote Buttons */}
          {effectiveCanVote && (
            <>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder={isHindi ? 'वैकल्पिक: सत्यापन टिप्पणी जोड़ें...' : 'Optional: Add verification feedback...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleVote('VERIFIED')}
                  disabled={loading}
                  className="py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  <span>{isHindi ? '✔ कार्य पूर्ण' : '✔ Work Completed'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote('REJECTED')}
                  disabled={loading}
                  className="py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                  <span>{isHindi ? '✘ कार्य अपूर्ण' : '✘ Work Not Completed'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Completion Messages ─── */}
      {isCompleted && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-xs space-y-1">
          <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>{isHindi ? '✓ समुदाय द्वारा सत्यापित — शिकायत पूर्ण' : '✓ Verified by Community — Complaint Completed'}</span>
          </span>
          <p className="text-emerald-700 dark:text-emerald-400 font-medium">
            {isHindi ? `${verifiedCount} नागरिकों ने कार्य पूर्ति की पुष्टि की।` : `${verifiedCount} citizens confirmed work completion. Contractor payment approved.`}
          </p>
        </div>
      )}

      {isFailed && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-xs space-y-1">
          <span className="font-black text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{isHindi ? 'सत्यापन विफल — शिकायत पुनः आवंटित' : `Verification Failed — Returned to Queue (Priority ×${priorityWeight})`}</span>
          </span>
          <p className="text-rose-700 dark:text-rose-400 font-medium">
            {verificationStatus === 'EXPIRED'
              ? (isHindi ? 'सत्यापन विंडो समाप्त हो गई।' : 'Verification window expired without sufficient citizen verifications.')
              : (isHindi ? 'नागरिकों ने कार्य अस्वीकार किया।' : 'Citizens rejected the officer work completion. Complaint returned for reassignment.')}
          </p>
        </div>
      )}

      {/* ─── Citizen Verifiers Audit Log ─── */}
      {voters.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <span className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider block text-[11px]">
            {isHindi ? `सत्यापनकर्ता लॉग (${voters.length}):` : `Verification Audit Log (${voters.length}):`}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {voters.map((v, i) => (
              <div key={i} className={`p-2.5 rounded-xl border space-y-0.5 ${
                v.vote === 'REJECTED'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
              }`}>
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  {v.vote === 'REJECTED'
                    ? <XCircle className="w-3 h-3 text-rose-600" />
                    : <Sparkles className="w-3 h-3 text-emerald-600" />
                  }
                  <span className={v.vote === 'REJECTED' ? 'text-rose-900 dark:text-rose-300' : 'text-emerald-900 dark:text-emerald-300'}>
                    {v.citizenName}
                  </span>
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    v.vote === 'REJECTED'
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  }`}>
                    {v.vote === 'REJECTED' ? '✘' : '✔'}
                  </span>
                </span>
                {(v.feedback || v.comment) && (
                  <p className="text-[10px] italic opacity-80">
                    "{v.feedback || v.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
