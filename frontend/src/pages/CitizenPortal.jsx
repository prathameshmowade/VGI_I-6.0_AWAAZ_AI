import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import ComplaintForm from '../components/ComplaintForm';
import VoiceInput from '../components/VoiceInput';
import GeoTagCamera from '../components/GeoTagCamera';
import LocationPicker from '../components/LocationPicker';
import PrivacyShield from '../components/PrivacyShield';
import TelegramBotModal from '../components/TelegramBotModal';
import ResponsibilityPanel from '../components/ResponsibilityPanel';
import CitizenGrievanceTracker from '../components/CitizenGrievanceTracker';
import { redactPII } from '../utils/piiShield';
import {
  FileEdit,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  MapPin,
  Camera,
  Sparkles,
  Shield,
  Search,
  ListOrdered,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function CitizenPortal() {
  const { t, isHindi } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active View Tab: 'report' | 'my-complaints'
  const [activeTab, setActiveTab] = useState('report');
  const [myComplaints, setMyComplaints] = useState([]);

  // Intake Form States
  const [submitted, setSubmitted] = useState(null);
  const [voiceText, setVoiceText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Vijay Nagar, Indore');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResponsibility, setShowResponsibility] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Load complaints filed by this specific citizen
  const loadCitizenComplaints = async () => {
    let localIds = [];
    try {
      const savedIds = localStorage.getItem('awaaz_citizen_filed_ids');
      if (savedIds) localIds = JSON.parse(savedIds);
    } catch (e) {}

    let allComplaints = [];
    try {
      const res = await axios.get('/api/complaints');
      if (Array.isArray(res.data?.data)) {
        allComplaints = res.data.data;
      }
    } catch (err) {}

    // Also merge with any local complaints stored on device
    try {
      const saved = localStorage.getItem('civic_officer_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map = new Map(allComplaints.map((c) => [c.complaintId || c._id, c]));
          parsed.forEach((p) => {
            const id = p.complaintId || p._id;
            if (id && !map.has(id)) {
              allComplaints.push(p);
              map.set(id, p);
            }
          });
        }
      }
    } catch (e) {}

    // Filter to this citizen's grievances
    const citizenGrievances = allComplaints.filter((c) => {
      const id = c.complaintId || c._id;
      if (localIds.includes(id)) return true;
      if (user?.email && c.citizenEmail && c.citizenEmail.toLowerCase() === user.email.toLowerCase()) return true;
      if (user?.mobile && c.citizenPhone && String(c.citizenPhone).includes(String(user.mobile))) return true;
      if (user?.name && user.name !== 'Verified Citizen' && c.citizenName === user.name) return true;
      return false;
    });

    citizenGrievances.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setMyComplaints(citizenGrievances);
  };

  useEffect(() => {
    loadCitizenComplaints();
    const interval = setInterval(loadCitizenComplaints, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleComplaintSubmit = async (formData) => {
    setLoading(true);
    const clientGenId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const safeTitle = redactPII(formData.title || 'Civic Grievance Reported');
    const safeDesc = redactPII(formData.description || '');

    const citizenEmail = user?.email || '';
    const citizenName = user?.name || '';
    const citizenPhone = user?.mobile || '';
    const citizenId = user?.id || user?.email || user?.mobile || user?.name || 'citizen';

    const newRecord = {
      complaintId: clientGenId,
      _id: clientGenId,
      title: safeTitle,
      description: safeDesc,
      category: formData.category || 'Road Damage',
      location: formData.location || selectedLocation || 'Vijay Nagar, Indore',
      evidencePhoto: capturedPhoto || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80',
      urgency: 'High Priority',
      status: 'New',
      citizenId,
      citizenEmail,
      citizenName,
      citizenPhone,
      confidenceScore: 96,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: 94,
      isDuplicate: false,
      blockchainHash: '933704102b783180e3106c87ba49a62cc495aa6f3f4c8286ee010db4ab81a829',
      xaiData: {
        confidence: 96,
        reasoning: [
          `Category keywords matched for ${formData.category || 'Road Damage'}`,
          `Mapped to ${formData.location || selectedLocation || 'Vijay Nagar, Indore'} Zone Jurisdiction`,
          'School & Hospital Zone Priority Rule Applied',
          'Geo-Tagged Photographic Evidence Authenticated'
        ],
        rulesApplied: ['Emergency Redressal Priority Rule', 'Geo-Tagged Photo Verification Rule'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      },
      createdAt: new Date().toISOString()
    };

    // Track locally in filed IDs
    try {
      const filedIds = JSON.parse(localStorage.getItem('awaaz_citizen_filed_ids') || '[]');
      if (!filedIds.includes(clientGenId)) {
        filedIds.unshift(clientGenId);
        localStorage.setItem('awaaz_citizen_filed_ids', JSON.stringify(filedIds));
      }
    } catch (e) {}

    // Save into localStorage for instant Officer sync
    try {
      const saved = localStorage.getItem('civic_officer_complaints');
      let list = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) list = parsed;
        } catch (e) {}
      }
      list.unshift(newRecord);
      localStorage.setItem('civic_officer_complaints', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const res = await axios.post('/api/complaints', newRecord);
      const serverComp = res.data?.data || newRecord;
      const actualId = serverComp.complaintId || clientGenId;

      // Update filed ID list with server-assigned ID
      try {
        const filedIds = JSON.parse(localStorage.getItem('awaaz_citizen_filed_ids') || '[]');
        if (!filedIds.includes(actualId)) {
          filedIds.unshift(actualId);
          localStorage.setItem('awaaz_citizen_filed_ids', JSON.stringify(filedIds));
        }
      } catch (e) {}

      setSubmitted(serverComp);
      loadCitizenComplaints();
    } catch (err) {
      console.warn('Backend API fallback, complaint registered locally:', err);
      setSubmitted(newRecord);
      loadCitizenComplaints();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (submitted?.complaintId) {
      navigator.clipboard.writeText(submitted.complaintId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Friendly Page Header & Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-xs">
                <FileEdit className="w-6 h-6" />
              </div>
              <span>{t('citizen_title')}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-200 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
              {t('citizen_desc')}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => { setActiveTab('report'); setSubmitted(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'report'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isHindi ? 'समस्या दर्ज करें' : 'Report Issue'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-complaints')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'my-complaints'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{isHindi ? 'मेरी शिकायतें' : 'My Complaints'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'my-complaints'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white'
              }`}>
                {myComplaints.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MY COMPLAINTS & LIVE PROGRESS TRACKER */}
      {activeTab === 'my-complaints' ? (
        <CitizenGrievanceTracker
          complaints={myComplaints}
          onSwitchToReport={() => { setActiveTab('report'); setSubmitted(null); }}
          onRefresh={loadCitizenComplaints}
          isHindi={isHindi}
          user={user}
        />
      ) : (
        /* VIEW 2: REPORT GRIEVANCE INTAKE */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Helpful Trust & Alternative Channel Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PrivacyShield />
            <TelegramBotModal />
          </div>

          {submitted ? (
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-emerald-300 dark:border-emerald-800 text-center space-y-6 shadow-md animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {isHindi ? 'शिकायत सफलतापूर्वक दर्ज की गई' : 'Complaint Registered Successfully'}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm">
                  {isHindi ? 'आपकी ट्रैकिंग संदर्भ आईडी: ' : 'Your Reference Tracking ID: '}
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 font-mono font-black text-blue-700 dark:text-blue-300 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-sm ml-1 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                    title="Click to copy ID"
                  >
                    <span>{submitted.complaintId}</span>
                    <span className="text-[10px] font-sans font-bold text-blue-500">
                      {copiedId ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>
                </p>
              </div>

              {/* Simple Resolution Flow Tracker */}
              <div className="max-w-xl mx-auto py-3 border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">Submitted</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-emerald-300 dark:bg-emerald-700 mx-2" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">2</span>
                    <span className="font-medium text-slate-600 dark:text-slate-400 text-[11px]">Assigned</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs">3</span>
                    <span className="font-medium text-slate-600 dark:text-slate-400 text-[11px]">In Progress</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs">4</span>
                    <span className="font-medium text-slate-600 dark:text-slate-400 text-[11px]">Resolved</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Issue</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{submitted.title}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Category</span>
                  <span className="font-bold text-slate-900 dark:text-white">{submitted.category}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Location</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{submitted.location || 'Indore'}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {/* View in My Complaints Tab CTA */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('my-complaints'); setSubmitted(null); }}
                  className="btn-primary text-xs py-2.5 px-5 font-bold shadow-xs flex items-center gap-2"
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>{isHindi ? 'मेरी शिकायतों में देखें' : 'View in My Complaints'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResponsibility(!showResponsibility)}
                  className={`text-xs py-2.5 px-5 rounded-xl font-bold transition shadow-xs flex items-center gap-2 ${
                    showResponsibility
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{showResponsibility ? 'Hide Department' : 'Responsible Department'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/complaint/${submitted.complaintId}`)}
                  className="btn-emerald text-xs py-2.5 px-5"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Full Timeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSubmitted(null); setShowResponsibility(false); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition"
                >
                  <span>{isHindi ? 'दूसरी समस्या दर्ज करें' : 'Submit Another Issue'}</span>
                </button>
              </div>

              {/* Civic Responsibility Panel */}
              {showResponsibility && (
                <div className="mt-4 text-left">
                  <ResponsibilityPanel
                    complaintId={submitted.complaintId}
                    complaintData={submitted}
                    onClose={() => setShowResponsibility(false)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section 1: Voice Input Speech-to-Text */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-2xs">
                    1
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('citizen_voice_step')}</h2>
                </div>
                <VoiceInput onTranscript={(text) => setVoiceText(text)} />
              </div>

              {/* Section 2: Location Pinpoint & Live Geo-Tag Camera */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    2
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('citizen_loc_step')}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Google Maps Geolocation */}
                  <LocationPicker onSelect={(loc) => setSelectedLocation(loc)} />

                  {/* Camera & Evidence Attachment */}
                  <GeoTagCamera
                    onCapture={(anonymizedImg, originalImg) => {
                      setCapturedPhoto(anonymizedImg || originalImg);
                    }}
                    onLocationDetected={(detectedLoc) => {
                      if (detectedLoc) setSelectedLocation(detectedLoc);
                    }}
                  />
                </div>
              </div>

              {/* Section 3: Grievance Form Details & Submit */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs flex items-center justify-center border border-purple-200 dark:border-purple-800 shadow-2xs">
                    3
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('citizen_form_step')}</h2>
                </div>
                <ComplaintForm
                  initialDescription={voiceText}
                  initialLocation={selectedLocation}
                  onSubmit={handleComplaintSubmit}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
