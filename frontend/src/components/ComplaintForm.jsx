import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { FileEdit, Sparkles, Send, MapPin, Tag, BarChart2, Navigation, ShieldCheck, Lock } from 'lucide-react';
import { detectPII, redactPII } from '../utils/piiShield';

export default function ComplaintForm({ initialDescription = '', initialLocation = '', onSubmit, loading = false }) {
  const { t, isHindi, language } = useContext(LanguageContext);
  const [form, setForm] = useState({
    title: '',
    description: initialDescription,
    category: 'Road Damage',
    customCategory: '',
    location: initialLocation || 'Vijay Nagar, Indore',
    language: language || 'en'
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
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-indigo-600" />
          <span>{t('citizen_form_step')}</span>
        </h2>
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
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">{t('form_desc')}</label>
        <textarea
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
          placeholder={t('form_desc_placeholder')}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        {/* DPDP Privacy Masking Notice */}
        {piiStatus.hasPII && (
          <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isHindi
                  ? 'गोपनीयता सुरक्षा: पहचान व संपर्क नंबर स्वतः सुरक्षित किए जाएंगे।'
                  : 'Privacy Protected: Phone numbers and IDs will be masked automatically.'}
              </span>
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">
              {piiStatus.detectedTypes.join(', ')}
            </span>
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

          {/* Clean input when "Other" is selected */}
          {form.category === 'Other' && (
            <div className="mt-2">
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs"
                placeholder={isHindi ? 'कृपया समस्या का प्रकार लिखें (जैसे: ट्रांसफार्मर खराब, पाइप लीकेज)...' : 'Specify the issue type (e.g. broken transformer, pipeline leak)...'}
                value={form.customCategory}
                onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
              />
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

      {/* Reassuring SLA Resolution Note */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-base">⏱️</span>
          <div>
            <span className="font-bold block">
              {isHindi ? 'अनुमानित समाधान समय' : 'Estimated Resolution Time'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isHindi ? 'शिकायत 24 से 48 घंटे के भीतर संबंधित विभाग व अधिकारी को सौंपी जाएगी।' : 'Reviewed and assigned to the municipal team within 24–48 hours.'}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
          24–48h SLA
        </span>
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
