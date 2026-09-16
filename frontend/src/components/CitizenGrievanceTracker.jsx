import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Building2,
  HardHat,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  PlusCircle,
  RefreshCw,
  Eye,
  Camera,
  Layers,
  Award
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Road Damage': '🏛️',
  'Water Supply': '💧',
  'Sanitation': '🧹',
  'Electrical': '⚡',
  'Parks': '🌳',
  'Other': '🤖'
};

export default function CitizenGrievanceTracker({
  complaints = [],
  onSwitchToReport,
  onRefresh,
  isHindi = false,
  user
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RESOLVED'
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (id, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to determine stage index (0 to 4)
  const getStageIndex = (status = '', verificationStatus = '') => {
    const s = String(status).trim().toLowerCase();
    const v = String(verificationStatus).trim().toUpperCase();

    if (s === 'completed' || s === 'resolved' || s === 'verified & resolved' || v === 'VERIFIED') {
      return 4; // Step 5 (Resolved & Completed)
    }
    if (s === 'under verification' || s === 'pending verification') {
      return 3; // Step 4 (Under Verification)
    }
    if (s === 'in progress' || s === 'in-progress' || s === 'started') {
      return 2; // Step 3 (In Progress)
    }
    if (s === 'assigned') {
      return 1; // Step 2 (Assigned)
    }
    return 0; // Step 1 (Submitted / New)
  };

  // Summary Metrics
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => {
    const s = String(c.status).toLowerCase();
    return s === 'completed' || s === 'resolved' || s === 'verified & resolved' || c.verification_status === 'VERIFIED';
  }).length;
  const activeCount = totalCount - resolvedCount;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Filtered List
  const filteredComplaints = complaints.filter((c) => {
    const isDone = String(c.status).toLowerCase() === 'completed' ||
      String(c.status).toLowerCase() === 'resolved' ||
      String(c.status).toLowerCase() === 'verified & resolved' ||
      c.verification_status === 'VERIFIED';

    if (filter === 'ACTIVE') return !isDone;
    if (filter === 'RESOLVED') return isDone;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Citizen Header & Metric Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>{isHindi ? 'नागरिक शिकायत डैशबोर्ड' : 'CITIZEN GRIEVANCE DASHBOARD'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {isHindi ? 'मेरी दर्ज शिकायतें व लाइव प्रगति' : 'My Filed Grievances & Real-Time Progress'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isHindi
                ? `लॉगिन नागरिक: ${user?.name || 'नागरिक'} (${user?.email || user?.mobile || 'सत्यापित'})`
                : `Logged in as: ${user?.name || 'Citizen'} (${user?.email || user?.mobile || 'Verified Citizen'})`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-bold flex items-center gap-1.5"
              title="Refresh Complaints"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? 'ताज़ा करें' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToReport}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 font-bold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isHindi ? 'नई शिकायत दर्ज करें' : 'Report New Issue'}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Total Filed Till Date */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-blue-950 dark:text-white leading-none block">
                {totalCount}
              </span>
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 mt-1 block">
                {isHindi ? 'कुल दर्ज शिकायतें' : 'Total Filed to Date'}
              </span>
            </div>
          </div>

          {/* Active in Resolution */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-amber-950 dark:text-white leading-none block">
                {activeCount}
              </span>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mt-1 block">
                {isHindi ? 'कार्य प्रगति पर' : 'Active in Resolution'}
              </span>
            </div>
          </div>

          {/* Resolved & Completed */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-950 dark:text-white leading-none block">
                {resolvedCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mt-1 block">
                {isHindi ? 'सत्यापित व पूर्ण' : 'Resolved & Verified'}
              </span>
            </div>
          </div>

          {/* Citizen Resolution Rate */}
          <div className="bg-purple-50/70 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-purple-950 dark:text-white leading-none block">
                {resolutionRate}%
              </span>
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 mt-1 block">
                {isHindi ? 'समाधान दर' : 'Resolution Rate'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            {isHindi ? 'फ़िल्टर:' : 'Filter:'}
          </span>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isHindi ? `सभी (${totalCount})` : `All Grievances (${totalCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'ACTIVE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isHindi ? `सक्रिय / प्रगतिरत (${activeCount})` : `Active in Progress (${activeCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isHindi ? `समाधानित व पूर्ण (${resolvedCount})` : `Resolved & Completed (${resolvedCount})`}
          </button>
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isHindi ? 'कोई शिकायत नहीं मिली' : 'No Grievances Found in this View'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalCount === 0
                ? isHindi
                  ? 'आपने अभी तक कोई शिकायत दर्ज नहीं की है। अपने क्षेत्र की समस्या दर्ज करने के लिए नीचे क्लिक करें।'
                  : "You haven't submitted any complaints yet. Have a pothole, leak, or streetlight issue in your area?"
                : isHindi
                  ? 'इस फ़िल्टर में कोई शिकायत उपलब्ध नहीं है।'
                  : 'No complaints match the selected filter.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToReport}
            className="btn-primary text-xs py-2.5 px-6 mx-auto inline-flex items-center gap-2 font-bold shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHindi ? 'पहली शिकायत दर्ज करें' : 'Report a Civic Issue Now'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const compId = c.complaintId || c._id;
            const stageIdx = getStageIndex(c.status, c.verification_status);
            const isCompleted = stageIdx === 4;
            const isUnderVerification = stageIdx === 3;
            const categoryIcon = CATEGORY_ICONS[c.category] || '🏛️';

            const stages = [
              { label: isHindi ? 'दर्ज' : 'Submitted', sub: isHindi ? 'सिस्टम में दर्ज' : 'Received by AI' },
              { label: isHindi ? 'आवंटित' : 'Assigned', sub: c.responsibilityData?.officer?.name || c.assignedOfficer || (isHindi ? 'अधिकारी' : 'Officer') },
              { label: isHindi ? 'प्रगति पर' : 'In Progress', sub: c.responsibilityData?.contractor?.name || (isHindi ? 'फील्ड टीम' : 'Field Crew') },
              { label: isHindi ? 'सत्यापन' : 'Verification', sub: isHindi ? `${c.verified_count || 0}/3 वोट` : `${c.verified_count || 0}/3 Votes` },
              { label: isHindi ? 'पूर्ण' : 'Resolved', sub: isHindi ? 'प्रमाणित' : 'Closed' }
            ];

            return (
              <div
                key={compId}
                className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-5"
              >
                {/* Top Meta Row */}
                <div className="flex flex-wrap justify-between items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Complaint ID Pill with 1-Click Copy */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(compId, e)}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-black bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-xl hover:bg-blue-100 transition shadow-2xs"
                      title="Click to copy Tracking ID"
                    >
                      <span>{compId}</span>
                      <Copy className="w-3 h-3 text-blue-500" />
                      {copiedId === compId && (
                        <span className="text-[10px] text-emerald-600 font-sans font-bold">✓ Copied</span>
                      )}
                    </button>

                    {/* Category Pill */}
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <span>{categoryIcon}</span>
                      <span>{c.category || 'Road Damage'}</span>
                    </span>

                    {/* Urgency Pill */}
                    {c.urgency && (
                      <span className="text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl">
                        {c.urgency}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs inline-flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isUnderVerification
                            ? 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300'
                            : stageIdx === 2
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      <span>{c.status || 'New'}</span>
                    </span>
                  </div>
                </div>

                {/* Title, Description & Location */}
                <div className="space-y-1.5 text-left">
                  <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {c.title}
                  </h3>
                  {c.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{c.location || 'Vijay Nagar, Indore'}</span>
                    </span>
                    {c.department && (
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{c.department}</span>
                      </span>
                    )}
                    {c.createdAt && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Live 5-Stage Visual Stepper */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                  <div className="flex justify-between items-center relative">
                    {/* Background Progress Bar Line */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-700 z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(stageIdx / (stages.length - 1)) * 100}%` }}
                      />
                    </div>

                    {stages.map((stg, sIdx) => {
                      const isPast = sIdx < stageIdx;
                      const isCurrent = sIdx === stageIdx;
                      const isFuture = sIdx > stageIdx;

                      return (
                        <div key={sIdx} className="flex flex-col items-center relative z-10 text-center flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                              isPast
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 scale-110'
                                  : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isPast ? '✓' : sIdx + 1}
                          </div>
                          <span
                            className={`text-[11px] font-bold mt-2 truncate max-w-[80px] sm:max-w-none block ${
                              isCurrent
                                ? 'text-blue-700 dark:text-blue-400'
                                : isPast
                                  ? 'text-emerald-800 dark:text-emerald-300'
                                  : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {stg.label}
                          </span>
                          <span className="hidden sm:block text-[9.5px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[100px]">
                            {stg.sub}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completed / Resolved Callout (Shows Proof & Notes) */}
                {isCompleted && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'समाधान पूर्ण व सत्यापित ✓' : 'Grievance Resolved & Officially Verified ✓'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {c.resolutionProof && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                            {isHindi ? 'समाधान फोटो प्रमाण:' : 'Resolution Proof Photo:'}
                          </span>
                          <img
                            src={c.resolutionProof}
                            alt="Resolution Proof"
                            className="w-full h-24 object-cover rounded-xl border border-emerald-200 dark:border-emerald-700"
                          />
                        </div>
                      )}
                      <div className={`space-y-1 ${c.resolutionProof ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                          {isHindi ? 'अधिकारी समाधान टीप:' : 'Officer Completion Notes:'}
                        </span>
                        <p className="text-xs text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          {c.resolutionNotes || c.completion_notes || (isHindi ? 'सड़क मरम्मत व स्थल सफाई पूर्ण की गई।' : 'Field maintenance successfully performed and cleared.')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Under Verification Callout */}
                {isUnderVerification && (
                  <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-purple-950 dark:text-purple-200 block flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>{isHindi ? 'नागरिक सत्यापन चरण जारी' : 'Citizen Community Verification in Progress'}</span>
                      </span>
                      <p className="text-xs text-purple-800 dark:text-purple-300 leading-snug">
                        {isHindi
                          ? `ठेकेदार भुगतान से पहले 3 नागरिकों का सत्यापन आवश्यक है। वर्तमान स्थिति: ${c.verified_count || 0}/3 वोट प्राप्त।`
                          : `3 positive citizen verifications required for final contractor sign-off. Progress: ${c.verified_count || 0}/3 votes.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/digital-twin')}
                      className="btn-purple text-xs py-2 px-4 shrink-0 font-bold"
                    >
                      <span>{isHindi ? 'डिजिटल ट्विन पर देखें' : 'View on Digital Twin'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {c.slaHoursRemaining ? `SLA: ${c.slaHoursRemaining}h remaining` : 'Standard SLA: 24–48 hours'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/complaint/${compId}`)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'विस्तृत टाइमलाइन व ऑडिट देखें' : 'View Full Timeline & Audit'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
