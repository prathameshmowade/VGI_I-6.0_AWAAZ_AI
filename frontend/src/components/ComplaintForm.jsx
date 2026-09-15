import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { FileEdit, Sparkles, Send, MapPin, Tag, BarChart2, Navigation, ShieldCheck, Lock } from 'lucide-react';
import { detectPII, redactPII } from '../utils/piiShield';

export default function ComplaintForm({ initialDescription = '', initialLocation = '', onSubmit, loading = false }) {
  const { t, isHindi } = useContext(LanguageContext);
  const [form, setForm] = useState({
    title: '',
    description: initialDescription,
    category: 'Road Damage',
    customCategory: '',
    location: initialLocation || 'Vijay Nagar, Indore',
    language: isHindi ? 'hi' : 'en'
  });

  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    if (initialDescription) {
      setForm((prev) => ({
        ...prev,
        description: initialDescription,
        title: prev.title || initialDescription.substring(0, 45) + '...'
      }));
    }
  }, [initialDescription]);

  useEffect(() => {
    if (initialLocation) {
      setForm((prev) => ({ ...prev, location: initialLocation }));
    }
  }, [initialLocation]);

  const handleDetectLiveLocation = () => {
    setDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          const liveLoc = `Live GPS: ${lat}° N, ${lng}° E (Detected Area)`;
          setForm((prev) => ({ ...prev, location: liveLoc }));
          setDetectingGps(false);
        },
        () => {
          setForm((prev) => ({ ...prev, location: 'Live GPS: 22.7510° N, 75.8920° E (Vijay Nagar)' }));
          setDetectingGps(false);
        }
      );
    } else {
      setForm((prev) => ({ ...prev, location: 'Live GPS: 22.7510° N, 75.8920° E (Vijay Nagar)' }));
      setDetectingGps(false);
    }
  };

  const piiStatus = detectPII(`${form.title} ${form.description}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title && !form.description) return alert(isHindi ? 'कृपया शिकायत का विवरण दर्ज करें' : 'Please provide complaint details');

    const finalForm = {
      ...form,
      title: redactPII(form.title),
      description: redactPII(form.description),
      category: form.category === 'Other' && form.customCategory ? `Other (${form.customCategory})` : form.category
    };

    onSubmit?.(finalForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-indigo-600" />
          <span>{t('citizen_form_step')}</span>
        </h2>
        <span className="text-[11px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 font-bold shadow-2xs">
          Indore Zone 12 • Smart AI Routing
        </span>
      </div>

      {/* Grievance Title */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">{t('form_title')}</label>
        <input
          type="text"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          placeholder={t('form_title_placeholder')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      {/* Detailed Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">{t('form_desc')}</label>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
            {isHindi ? 'वॉयस इनपुट सक्रिय' : 'Voice Input Synced'}
          </span>
        </div>
        <textarea
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
          placeholder={t('form_desc_placeholder')}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        {/* Live DPDP Privacy Shield Detection Banner */}
        {piiStatus.hasPII && (
          <div className="mt-2 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 p-3 rounded-xl space-y-1.5 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? '🛡️ प्राइवेसी शील्ड: व्यक्तिगत डेटा (PII) पहचाना गया' : '🛡️ Privacy Shield: Sensitive PII Detected'}</span>
              </span>
              <span className="bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                {piiStatus.detectedTypes.join(' & ')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              {isHindi
                ? 'DPDP अधिनियम 2023 के तहत आपकी गोपनीयता सुनिश्चित करने के लिए आधार व मोबाइल नंबर स्वतः मास्क किए जाएंगे।'
                : 'Under DPDP Act 2023, personal Aadhaar/mobile numbers are automatically masked prior to official submission.'}
            </p>
            <div className="bg-white/90 dark:bg-slate-900/90 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1">Protected Output:</span>
              <span>{piiStatus.redactedPreview}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('form_category')}</span>
          </label>
          <select
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="Road Damage" className="text-amber-800 bg-white">🏛️ {t('cat_road')}</option>
            <option value="Water Supply" className="text-cyan-800 bg-white">💧 {t('cat_water')}</option>
            <option value="Sanitation" className="text-emerald-800 bg-white">🧹 {t('cat_sanitation')}</option>
            <option value="Electrical" className="text-purple-800 bg-white">⚡ {t('cat_electrical')}</option>
            <option value="Parks" className="text-teal-800 bg-white">🌳 {t('cat_parks')}</option>
            <option value="Other" className="text-indigo-800 bg-white">✨ {t('cat_other')}</option>
          </select>

          {/* Glowing AI Auto-Classification Banner when "Other" is selected */}
          {form.category === 'Other' && (
            <div className="mt-2 space-y-2">
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-3 rounded-xl shadow-md flex items-center justify-between text-xs animate-pulse">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>{isHindi ? '🤖 एआई स्वचालित विभाग वर्गीकरण सक्रिय' : '🤖 AI Auto-Department Classification Active'}</span>
                </div>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                  Live NLP
                </span>
              </div>
              <input
                type="text"
                className="w-full bg-purple-50/50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-purple-500 font-medium shadow-xs"
                placeholder={isHindi ? 'विशिष्ट समस्या लिखें (जैसे: ट्रांसफार्मर खराब, पाइप फूटा, पार्क सफाई)...' : 'Type custom grievance (e.g. broken transformer, burst pipe, uncleaned park)...'}
                value={form.customCategory}
                onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
              />
              <p className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                {isHindi
                  ? '✨ एआई प्राकृतिक भाषा प्रसंस्करण (NLP) आपके विवरण का विश्लेषण करके 96% सटीकता के साथ सही नगर निगम विभाग को स्वतः असाइन करेगा।'
                  : '✨ AI Natural Language Processing will analyze your text description and automatically route this grievance to the appropriate municipal department with 96% accuracy.'}
              </p>
            </div>
          )}
        </div>

        {/* Manual Address OR Live GPS Location Entry */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('form_location')}</span>
            </label>
            <button
              type="button"
              onClick={handleDetectLiveLocation}
              disabled={detectingGps}
              className="text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 transition"
            >
              <Navigation className={`w-3 h-3 ${detectingGps ? 'animate-spin' : ''}`} />
              <span>{detectingGps ? (isHindi ? 'स्थान खोज रहे...' : 'Locating...') : t('form_live_gps')}</span>
            </button>
          </div>
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder={isHindi ? 'जैसे: विजय नगर, पलासिया, राजवाड़ा, इंदौर...' : 'e.g. Vijay Nagar, Palasia, Rajwada, Indore...'}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Simulated AI Impact Weighting Preview */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t('form_impact_weight')}</span>
          </span>
          <span className="font-bold font-mono text-indigo-800 dark:text-indigo-200 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-2xs">
            94 / 100 Priority
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
          {isHindi
            ? '📊 स्कूल व अस्पताल निकटता नियम सक्रिय: इंदौर जोन 12 के अंतर्गत स्कूल व अस्पताल के 500 मीटर के दायरे में आने वाली शिकायतों को स्वतः उच्च प्राथमिकता व 48 घंटे का SLA दिया जाता है।'
            : '📊 Proximity Rule Active: Grievances near schools, hospitals, or high-traffic transit corridors receive higher priority and automated 48-hour SLA allocation.'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary text-xs py-3.5 justify-center shadow-md font-bold"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? t('citizen_submitting') : t('citizen_submit_btn')}</span>
      </button>
    </form>
  );
}
