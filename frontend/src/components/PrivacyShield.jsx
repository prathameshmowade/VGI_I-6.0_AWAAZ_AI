import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { ShieldCheck, Lock, Camera, CheckCircle2, Sparkles, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { redactPII, detectPII } from '../utils/piiShield';

export default function PrivacyShield() {
  const { t, isHindi } = useContext(LanguageContext);
  const [showInteractiveTester, setShowInteractiveTester] = useState(false);
  const [testInput, setTestInput] = useState('Resident Rahul Sharma (+91-9876543210, Aadhaar: 5432 8901 2345) reported road damage.');

  const piiAnalysis = detectPII(testInput);

  return (
    <div className="bg-white dark:bg-emerald-950/70 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100 dark:border-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>{t('privacy_badge')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-mono">LIVE SHIELD ACTIVE</span>
            </div>
            <h4 className="font-extrabold text-emerald-950 dark:text-white text-base">{t('privacy_title')}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInteractiveTester(!showInteractiveTester)}
            className="text-xs bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{showInteractiveTester ? (isHindi ? 'परीक्षक बंद करें' : 'Hide Tester') : (isHindi ? 'लाइव शील्ड टेस्ट करें' : 'Test Live Shield')}</span>
            {showInteractiveTester ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <span className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs">
            DPDP 2023 {isHindi ? 'अनुपालन ✓' : 'Compliant ✓'}
          </span>
        </div>
      </div>

      {/* Safety Specs Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-emerald-50/50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-1">
          <span className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('privacy_pii')}</span>
          </span>
          <span className="text-emerald-900 dark:text-emerald-200 text-[11px]">{t('privacy_pii_sub')}</span>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-1">
          <span className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('privacy_yolo')}</span>
          </span>
          <span className="text-emerald-900 dark:text-emerald-200 text-[11px]">{t('privacy_yolo_sub')}</span>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-1">
          <span className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('privacy_doxxing')}</span>
          </span>
          <span className="text-emerald-900 dark:text-emerald-200 text-[11px]">{t('privacy_doxxing_sub')}</span>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-1">
          <span className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('privacy_dpdp')}</span>
          </span>
          <span className="text-emerald-900 dark:text-emerald-200 text-[11px]">{t('privacy_dpdp_sub')}</span>
        </div>
      </div>

      {/* Interactive Real-Time DPDP PII Redaction Tester */}
      {showInteractiveTester && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/80 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-700 space-y-3 text-xs animate-in fade-in">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="font-bold text-emerald-950 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'लाइव DPDP PII मास्किंग सिम्युलेटर' : 'Live DPDP PII Masking Simulator'}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTestInput('Please call me at 9876543210 regarding my Aadhaar 1234 5678 9012.')}
                className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
              >
                Sample 1 (Phone + Aadhaar)
              </button>
              <button
                type="button"
                onClick={() => setTestInput('Contact +91-9822334455 or email resident@example.com for site inspection.')}
                className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
              >
                Sample 2 (+91 & Email)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
              {isHindi ? 'परीक्षण पाठ दर्ज करें:' : 'Type or edit test text to see real-time redaction:'}
            </label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sanitized Redacted Output:</span>
              </span>
              <span className="text-[10px] font-sans font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                {piiAnalysis.hasPII ? `${piiAnalysis.detectedTypes.join(', ')} Masked` : 'No PII Detected'}
              </span>
            </div>
            <div className="p-2 bg-emerald-50/50 dark:bg-slate-950 rounded-lg text-slate-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900">
              {piiAnalysis.redactedPreview || '(empty)'}
            </div>
          </div>
        </div>
      )}

      {/* YOLO Object Blur Explanation Banner */}
      <div className="bg-emerald-50/30 dark:bg-emerald-900/20 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
        <span className="font-bold flex items-center gap-1.5 text-emerald-950 dark:text-white">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isHindi ? '🤖 YOLOv8 स्वचालित कंप्यूटर विजन फोटो अनामीकरण' : '🤖 YOLOv8 Automatic Computer Vision Anonymization'}</span>
        </span>
        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
          {isHindi
            ? 'नागरिकों या अधिकारियों द्वारा अपलोड किए गए प्रत्येक साक्ष्य फोटो को YOLO ऑब्जेक्ट डिटेक्शन मॉडल द्वारा स्कैन किया जाता है। फोटो में दिखाई देने वाले मानव चेहरे और वाहन नंबर प्लेटों को सार्वजनिक प्रदर्शन से पहले स्वतः धुंधला कर दिया जाता है।'
            : 'Every evidence image uploaded by citizens or officers is scanned in real-time by a YOLO object detection model. All detected human faces and vehicle license plates are automatically covered with a pixelated privacy blur mask prior to public display.'}
        </p>
      </div>
    </div>
  );
}
