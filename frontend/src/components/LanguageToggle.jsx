import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LANG_OPTIONS = [
  { code: 'en', label: 'EN', flag: '🇬🇧', title: 'English' },
  { code: 'hi', label: 'हि', flag: '🇮🇳', title: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मर', flag: '🏛️', title: 'मराठी (Marathi)' },
  { code: 'ta', label: 'த', flag: '🎭', title: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తె', flag: '🌾', title: 'తెలుగు (Telugu)' },
];

export default function LanguageToggle() {
  const { language, setSpecificLanguage } = useContext(LanguageContext);

  return (
    <div className="flex items-center bg-emerald-50/90 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-700 p-0.5 rounded-xl shadow-xs shrink-0 flex-wrap gap-0.5">
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setSpecificLanguage(opt.code)}
          className={`text-[10px] px-1.5 py-1 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
            language === opt.code
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800'
          }`}
          title={opt.title}
        >
          <span className="text-[11px]">{opt.flag}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
