import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { Building2, Activity, ShieldCheck, Camera, CheckCircle2, AlertCircle, Sparkles, UserCheck, HardHat, AlertTriangle, Award, XCircle, Clock } from 'lucide-react';
import DigitalTwinMap from '../components/DigitalTwinMap';
import CitizenVerificationPanel from '../components/CitizenVerificationPanel';

const CITY_ZONES = [
  { id: 12, name: 'Vijay Nagar Zone', nameHi: 'विजय नगर जोन', healthScore: 91, riskLevel: 'Low Risk', riskLevelHi: 'कम जोखिम', activeComplaints: 14, riskColor: 'border-emerald-300 text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300', officer: 'Er. Rajesh Sharma', contractor: 'Apex Infrastructure Pvt Ltd', activeContracts: 5 },
  { id: 5, name: 'Chhappan Dukan Zone', nameHi: 'छप्पन दुकान जोन', healthScore: 62, riskLevel: 'High Risk (Sewer Overflow)', riskLevelHi: 'उच्च जोखिम (सीवर ओवरफ्लो)', activeComplaints: 42, riskColor: 'border-rose-300 text-rose-800 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300', officer: 'Er. Anil Deshpande', contractor: 'Malwa Roads & Bridges Corp', activeContracts: 2 },
  { id: 7, name: 'Palasia Zone', nameHi: 'पलासिया जोन', healthScore: 74, riskLevel: 'Medium Risk (Streetlights)', riskLevelHi: 'मध्यम जोखिम (स्ट्रीटलाइट)', activeComplaints: 28, riskColor: 'border-amber-300 text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300', officer: 'Er. Manoj Thakur', contractor: 'BrightGrid Electrical Solutions', activeContracts: 2 },
  { id: 1, name: 'Rajwada Zone', nameHi: 'राजवाड़ा जोन', healthScore: 85, riskLevel: 'Low Risk', riskLevelHi: 'कम जोखिम', activeComplaints: 18, riskColor: 'border-teal-300 text-teal-800 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300', officer: 'Mr. Ramesh Borkar', contractor: 'CleanCity Waste Solutions', activeContracts: 1 }
];

export default function DigitalTwinPage() {
  const { isHindi } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const [selectedZone, setSelectedZone] = useState(CITY_ZONES[1]);
  const [pendingVerificationComplaints, setPendingVerificationComplaints] = useState([]);
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, verified: 0, rejected: 0, completed: 0 });

  const loadVerificationFeed = async () => {
    try {
      // Fetch from real backend API with client device ID support
      const clientDeviceId = typeof localStorage !== 'undefined' ? localStorage.getItem('awaaz_citizen_client_id') : '';
      const citizenId = user?.citizenId || user?.email || user?.mobile || (user?.name && user.name !== 'Verified Citizen' ? user.name : clientDeviceId) || '';
      const citizenEmail = user?.email || '';
      const citizenName = user?.name || '';
      const res = await axios.get('/api/twin-city/verifications', {
        params: { citizenId, citizenEmail, citizenName }
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const feedData = res.data.data;
        setPendingVerificationComplaints(feedData);

        // Calculate stats
        const activeAwaiting = feedData.filter((c) => c.status === 'Under Verification' || c.status === 'Pending Verification').length;
        const totalCompleted = feedData.filter((c) => c.status === 'Completed' || c.status === 'Verified & Resolved' || c.verification_status === 'VERIFIED').length;
        const totalVerified = feedData.reduce((sum, c) => sum + (c.verified_count || 0), 0);
        const totalRejected = feedData.reduce((sum, c) => sum + (c.rejected_count || 0), 0);
        setStats({ total: activeAwaiting, verified: totalVerified, rejected: totalRejected, completed: totalCompleted });
        return;
      }
    } catch (err) {
      // Fall through to fallback
    }

    // Fallback: try /api/complaints
    try {
      const res = await axios.get('/api/complaints');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const pendingList = res.data.data.filter(
          (c) => c.status === 'Under Verification' || c.status === 'Pending Verification' || c.status === 'Completed'
        );
        setPendingVerificationComplaints(pendingList);
        setStats({ total: pendingList.length, verified: 0, rejected: 0, completed: 0 });
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadVerificationFeed();
    const interval = setInterval(loadVerificationFeed, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const displayedComplaints = (pendingVerificationComplaints || []).filter((c) => {
    if (streamFilter === 'PENDING') {
      return c.status === 'Under Verification' || c.status === 'Pending Verification';
    }
    if (streamFilter === 'COMPLETED') {
      return (
        c.status === 'Completed' ||
        c.status === 'Verified & Resolved' ||
        c.status === 'Resolved' ||
        c.verification_status === 'VERIFIED'
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Container with Vibrant Cyber Violet Theme */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>{isHindi ? 'नगर पालिका डिजिटल ट्विन सिमुलेशन' : 'MUNICIPAL DIGITAL TWIN SIMULATION'}</span>
          <span className="text-slate-300">•</span>
          <span>{isHindi ? 'लाइव स्थानिक टेलीमेट्री' : 'LIVE SPATIAL TELEMETRY'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <span>{isHindi ? 'इंदौर स्मार्ट सिटी एआई डिजिटल ट्विन व नागरिक सत्यापन' : 'Indore Smart City AI Digital Twin & Citizen Verification Stream'}</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
          {isHindi
            ? 'शहरी बुनियादी ढांचा स्वास्थ्य स्कोर, गड्ढों का पूर्वानुमान और 3-नागरिक सामुदायिक फोटो सत्यापन कार्यप्रवाह।'
            : 'Predictive infrastructure failure models, municipal structural health indices, and live 3-citizen photographic resolution verification workflows.'}
        </p>
      </div>

      {/* Verification Telemetry Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">{isHindi ? 'सत्यापन हेतु लंबित' : 'Awaiting Verification'}</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">{isHindi ? 'सत्यापन वोट' : 'Verification Votes'}</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.verified} ✓</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">{isHindi ? 'अस्वीकृत' : 'Rejections'}</span>
            <span className="text-xl font-black text-rose-700 dark:text-rose-300">{stats.rejected} ✘</span>
          </div>
        </div>
      </div>

      {/* Ward Health Index Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CITY_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => setSelectedZone(zone)}
            className={`p-5 rounded-3xl border text-left transition-all duration-200 ${
              selectedZone.id === zone.id
                ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 shadow-md ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2.5">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {isHindi ? zone.nameHi : zone.name}
              </span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${zone.riskColor}`}>
                {isHindi ? zone.riskLevelHi : zone.riskLevel}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {isHindi ? 'स्वास्थ्य सूचकांक:' : 'Health Index:'}
                </span>
                <span className="font-black font-mono text-purple-700 dark:text-purple-300">{zone.healthScore}/100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${zone.healthScore < 70 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                  style={{ width: `${zone.healthScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-1 font-semibold">
                {zone.activeComplaints} {isHindi ? 'सक्रिय शिकायतें' : 'Active Grievances'}
              </span>
              {/* Accountability Data */}
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                  <UserCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  {zone.officer}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                  <HardHat className="w-3 h-3 text-amber-500 shrink-0" />
                  {zone.contractor}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">
                  📋 {zone.activeContracts} {isHindi ? 'सक्रिय अनुबंध' : 'Active Contracts'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Digital Twin 3D / Spatial Map */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>
              {isHindi ? 'लाइव स्थानिक टेलीमेट्री ग्रिड — ' : 'Live Spatial Telemetry Grid — '}
              {isHindi ? selectedZone.nameHi : selectedZone.name}
            </span>
          </h3>
          <span className="text-xs bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3.5 py-1 rounded-full font-black shadow-2xs">
            {isHindi ? 'सिमुलेशन सक्रिय ✓' : 'Real-Time Simulation Active ✓'}
          </span>
        </div>
        <DigitalTwinMap />
      </div>

      {/* 3-Citizen Verification Stream */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>{isHindi ? 'नागरिक सत्यापन स्ट्रीम' : 'CITIZEN VERIFICATION STREAM'}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">{isHindi ? 'लाइव' : 'LIVE'}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isHindi ? '3-नागरिक फोटो सत्यापन व कार्य स्वीकृति' : '3-Citizen Photo Audit & Contractor Payment Release'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHindi
              ? 'नगर निगम ठेकेदारों द्वारा अपलोड की गई मरम्मत की तस्वीरों का 3 स्थानीय नागरिकों द्वारा सत्यापन आवश्यक है। प्रत्येक सत्यापन बैकएंड डेटाबेस में दर्ज किया जाता है।'
              : 'Before public funds and contractor invoices are approved, 3 independent local citizens must inspect and authenticate repair photographic evidence. Every vote is recorded in the backend database.'}
          </p>
        </div>

        {/* Stream Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStreamFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                streamFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {isHindi ? 'सभी स्ट्रीम' : 'All Stream'} ({pendingVerificationComplaints.length})
            </button>
            <button
              type="button"
              onClick={() => setStreamFilter('PENDING')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                streamFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {isHindi ? 'सत्यापन हेतु लंबित' : 'Awaiting Citizen Verification'} ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStreamFilter('COMPLETED')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                streamFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {isHindi ? 'सत्यापित व पूर्ण' : 'Completed & Community Verified'} ({stats.completed})
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isHindi ? '3 सकारात्मक वोट = स्वतः पूर्ण' : 'Rule: 3 Positive Votes or 3 Days = Auto-Complete'}
          </span>
        </div>

        {/* Empty State */}
        {displayedComplaints.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isHindi ? 'इस श्रेणी में कोई शिकायत नहीं है।' : 'No complaints found for this filter.'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHindi ? 'जब कोई अधिकारी कार्य पूर्ण करेगा, तो शिकायतें यहाँ दिखाई देंगी।' : 'When an officer marks work as completed and uploads proof, complaints will appear here for community audit.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedComplaints.map((comp) => (
            <CitizenVerificationPanel
              key={comp.complaintId || comp._id}
              complaint={comp}
              onVerified={(updatedComp) => {
                setPendingVerificationComplaints((prev) =>
                  prev.map((c) => (c.complaintId === updatedComp.complaintId ? { ...c, ...updatedComp } : c))
                );
                // Trigger a refresh from the backend
                setTimeout(loadVerificationFeed, 500);
              }}
              onVerificationUpdate={(updatedComp) => {
                setPendingVerificationComplaints((prev) =>
                  prev.map((c) => (c.complaintId === updatedComp.complaintId ? { ...c, ...updatedComp } : c))
                );
                setTimeout(loadVerificationFeed, 500);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
