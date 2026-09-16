import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, Camera, CheckCircle2 } from 'lucide-react';

export default function PrivacyShield() {
  const { t, isHindi } = useContext(LanguageContext);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-3.5 transition-all text-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span>{isHindi ? 'आपकी गोपनीयता सुरक्षित है' : 'Your Privacy is Protected'}</span>
              <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {isHindi ? 'सुरक्षित ✓' : 'Secured ✓'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              {isHindi
                ? 'मोबाइल नंबर, व्यक्तिगत पहचान और फोटो में दिखने वाले चेहरे स्वतः सुरक्षित किए जाते हैं।'
                : 'Phone numbers, personal IDs, and faces in photos are automatically kept confidential.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold hover:text-emerald-950 dark:hover:text-emerald-100 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition"
        >
          <span>{expanded ? (isHindi ? 'कम देखें' : 'Hide details') : (isHindi ? 'विवरण देखें' : 'Learn more')}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-emerald-200/70 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in">
          <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <Lock className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                {isHindi ? 'व्यक्तिगत डेटा सुरक्षा' : 'Personal Data Masking'}
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-[10.5px]">
                {isHindi
                  ? 'शिकायत के विवरण में मोबाइल नंबर या आधार नंबर स्वतः मास्क कर दिया जाता है।'
                  : 'Aadhaar, phone numbers, and emails are automatically masked before official review.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <Camera className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                {isHindi ? 'फोटो में चेहरे व नंबर प्लेट ब्लर' : 'Face & License Plate Blur'}
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-[10.5px]">
                {isHindi
                  ? 'अपलोड किए गए फोटो में लोगों के चेहरे और गाड़ियों की नंबर प्लेट स्वतः धुंधली की जाती हैं।'
                  : 'Human faces and vehicle license plates in photos are automatically blurred.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
