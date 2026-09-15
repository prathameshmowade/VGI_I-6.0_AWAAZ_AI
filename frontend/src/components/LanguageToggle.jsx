import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setSpecificLanguage } = useContext(LanguageContext);
  const isHindi = language === 'hi';

  return (
    <div className="flex items-center bg-emerald-50/90 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-700 p-0.5 rounded-xl shadow-xs shrink-0">
      <button
        type="button"
        onClick={() => setSpecificLanguage('en')}
        className={`text-[11px] px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
          !isHindi
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-emerald-800 hover:text-emerald-950 dark:text-emerald-300'
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setSpecificLanguage('hi')}
        className={`text-[11px] px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
          isHindi
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-emerald-800 hover:text-emerald-950 dark:text-emerald-300'
        }`}
        title="हिन्दी में बदलें (Switch to Hindi)"
      >
        <span>🇮🇳</span>
        <span>हि</span>
      </button>
    </div>
  );
}
