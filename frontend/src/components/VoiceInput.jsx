import React, { useState, useEffect, useRef, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Mic, MicOff, Sparkles, CheckCircle2, RotateCcw, Volume2, Globe2, Edit3 } from 'lucide-react';
import { enhanceSpeechTranscript, synthesizeCivicGrievance } from '../utils/speechEnhancer';

const LANGUAGE_OPTIONS = [
  { code: 'hi-IN', label: 'हिन्दी / Hinglish', flag: '🇮🇳' },
  { code: 'en-IN', label: 'English (India)', flag: '🌐' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', flag: '🏛️' }
];

const PRESET_TRANSCRIPTS = [
  { lang: 'EN', code: 'en-IN', text: "Severe road pothole near ABC School in Laxmi Nagar causing traffic accidents." },
  { lang: 'HI', code: 'hi-IN', text: "वार्ड 5 में मार्केट रोड के पास सीवेज पाइपलाइन लीक हो रही है और पानी भर गया है।" },
  { lang: 'MR', code: 'mr-IN', text: "वार्ड 7 मधील सार्वजनिक उद्यानाजवळ कचरा साचला आहे आणि पथदिवे बंद आहेत." }
];

export default function VoiceInput({ onTranscript }) {
  const { t, isHindi } = useContext(LanguageContext);
  const [listening, setListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(isHindi ? 'hi-IN' : 'en-IN');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [enhancedCount, setEnhancedCount] = useState(0);

  const recognitionRef = useRef(null);
  const fullTranscriptRef = useRef('');

  // Sync default language with context toggle if user hasn't explicitly customized it
  useEffect(() => {
    if (!listening) {
      setSelectedLang(isHindi ? 'hi-IN' : 'en-IN');
    }
  }, [isHindi]);

  // Clean up recognition instance on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(isHindi 
        ? 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया Chrome, Edge या नीचे दिए गए डेमो बटन आज़माएं!' 
        : 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or try the demo buttons below!'
      );
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = selectedLang;
    recognition.continuous = true;        // Keep listening across pauses and sentences
    recognition.interimResults = true;    // Stream intermediate acoustic hypotheses
    recognition.maxAlternatives = 3;      // Check top acoustic alternatives

    recognition.onstart = () => {
      setListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let accumulatedFinal = '';
      let currentInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          accumulatedFinal += result[0].transcript + ' ';
        } else {
          currentInterim += result[0].transcript;
        }
      }

      setInterimTranscript(currentInterim);

      if (accumulatedFinal) {
        // Run civic phonetic & grammar enhancement on finalized text
        const cleaned = enhanceSpeechTranscript(accumulatedFinal, selectedLang);
        setFinalTranscript(cleaned);
        fullTranscriptRef.current = cleaned;
        onTranscript?.(cleaned);
      } else if (currentInterim) {
        onTranscript?.(fullTranscriptRef.current ? `${fullTranscriptRef.current} ${currentInterim}` : currentInterim);
      }
    };

    recognition.onerror = (event) => {
      console.warn('[VoiceInput] Speech recognition notice:', event.error);
      if (event.error === 'not-allowed') {
        alert(isHindi ? 'कृपया माइक्रोफ़ोन की अनुमति दें।' : 'Microphone permission denied. Please allow microphone access in your browser.');
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript('');
      // Final polish pass on end
      if (fullTranscriptRef.current) {
        const polished = enhanceSpeechTranscript(fullTranscriptRef.current, selectedLang);
        setFinalTranscript(polished);
        onTranscript?.(polished);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('[VoiceInput] Start error:', err);
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setListening(false);
  };

  const handleApplyAiEnhancement = () => {
    const current = finalTranscript || interimTranscript;
    if (!current) return;
    const polished = enhanceSpeechTranscript(current, selectedLang);
    setFinalTranscript(polished);
    fullTranscriptRef.current = polished;
    setEnhancedCount((c) => c + 1);
    onTranscript?.(polished);
  };

  const handleReset = () => {
    if (listening) stopListening();
    setFinalTranscript('');
    setInterimTranscript('');
    fullTranscriptRef.current = '';
    onTranscript?.('');
  };

  const handleSimulate = (preset) => {
    if (listening) stopListening();
    setSelectedLang(preset.code);
    const cleaned = enhanceSpeechTranscript(preset.text, preset.code);
    setFinalTranscript(cleaned);
    fullTranscriptRef.current = cleaned;
    onTranscript?.(cleaned);
  };

  const handleManualEditChange = (e) => {
    const newText = e.target.value;
    setFinalTranscript(newText);
    fullTranscriptRef.current = newText;
    onTranscript?.(newText);
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm transition-colors">
      
      {/* 1. Language Model Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isHindi ? 'ध्वनि भाषा मॉडल चुनें:' : 'Speech Recognition Language Model:'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                if (listening) stopListening();
                setSelectedLang(opt.code);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                selectedLang === opt.code
                  ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Recording Controls & Live Sound Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!listening ? (
            <button
              type="button"
              onClick={startListening}
              className="btn-primary text-xs py-3 px-6 rounded-2xl font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>{isHindi ? 'बोलकर शिकायत दर्ज करें' : 'Start Voice Intake'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="bg-red-600 hover:bg-red-700 text-white text-xs py-3 px-6 rounded-2xl font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center gap-2 animate-pulse"
            >
              <MicOff className="w-4 h-4 text-white" />
              <span>{isHindi ? 'रिकॉर्डिंग रोकें' : 'Stop Listening'}</span>
            </button>
          )}

          {(finalTranscript || interimTranscript) && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs py-3 px-4 rounded-2xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              title="Clear transcript"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHindi ? 'रीसेट' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Live Audio Status Indicator */}
        {listening && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-2xl animate-in fade-in">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse delay-75"></span>
              <span className="w-1 h-2 bg-red-500 rounded-full animate-pulse delay-150"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-100"></span>
            </div>
            <span className="text-xs font-bold text-red-700 dark:text-red-400 ml-1">
              {isHindi ? 'आवाज़ पहचान चालू है... स्पष्ट बोलें' : 'Continuous AI speech stream active...'}
            </span>
          </div>
        )}
      </div>

      {/* 3. Live Recognized Transcript Box */}
      {(finalTranscript || interimTranscript) && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-black tracking-wider uppercase text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isHindi ? 'पहचाना गया वॉयस टेक्स्ट (स्वतः फॉर्म में सिंक):' : 'Accurate Speech Transcript (Auto-Populating Form):'}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyAiEnhancement}
                className="text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition flex items-center gap-1"
                title="Automatically fix civic phonetic errors and punctuation"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{isHindi ? 'AI सुधार लागू करें' : 'AI Grammar Polish'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? (isHindi ? 'सम्पन्न' : 'Done') : (isHindi ? 'संपादित करें' : 'Edit')}</span>
              </button>
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={finalTranscript}
              onChange={handleManualEditChange}
              rows={3}
              className="w-full bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none font-medium leading-relaxed"
              placeholder="Edit voice transcript..."
            />
          ) : (
            <div className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/70">
              <span className="font-semibold">{finalTranscript}</span>
              {interimTranscript && (
                <span className="text-blue-600 dark:text-blue-400 italic ml-1 opacity-80">
                  {interimTranscript}...
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {isHindi ? '✓ नगर निगम की शब्दावली और ध्वन्यात्मक सुधार सक्रिय' : '✓ Municipal phonetics & continuous multi-chunk streaming active'}
            </span>
            {enhancedCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ AI Polished
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Instant Preset Simulations for Testing */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          {t('voice_presets')}
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_TRANSCRIPTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSimulate(preset)}
              className="text-[11px] bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95"
            >
              <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{preset.lang}: "{preset.text.substring(0, 26)}..."</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
