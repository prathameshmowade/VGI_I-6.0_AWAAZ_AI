import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Mic, Volume2, CheckCircle2 } from 'lucide-react';

const PRESET_TRANSCRIPTS = [
  { lang: 'EN', text: "Severe road pothole near ABC School in Laxmi Nagar causing traffic accidents." },
  { lang: 'HI', text: "वार्ड 5 में मार्केट रोड के पास पानी की पाइपलाइन लीक हो रही है।" },
  { lang: 'MR', text: "वार्ड 7 मधील सार्वजनिक उद्यानाजवळ कचरा साचला आहे." }
];

export default function VoiceInput({ onTranscript }) {
  const { t, isHindi } = useContext(LanguageContext);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(isHindi ? 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। नीचे दिए गए डेमो बटन आज़माएं!' : 'Speech recognition not supported in this browser. Try the simulation buttons below!');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const current = event.results[0][0].transcript;
      setTranscript(current);
      onTranscript?.(current);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  };

  const handleSimulate = (text) => {
    setTranscript(text);
    onTranscript?.(text);
  };

  return (
    <div className="bg-white dark:bg-emerald-950/70 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 space-y-4 shadow-xs">
      {/* Record Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={startListening}
          className={`btn-emerald text-xs py-2.5 px-5 ${
            listening ? 'bg-red-600 animate-pulse' : ''
          }`}
        >
          <Mic className={`w-4 h-4 ${listening ? 'animate-bounce' : ''}`} />
          <span>{listening ? (isHindi ? 'सुन रहे हैं... बोलिए' : 'Listening...') : t('voice_start')}</span>
        </button>
        {listening && (
          <span className="flex gap-2 items-center">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-xs text-red-600 dark:text-red-400 font-bold">
              {isHindi ? 'आवाज़ रिकॉर्ड हो रही है...' : 'Recording audio...'}
            </span>
          </span>
        )}
      </div>

      {/* Preset Simulation Buttons */}
      <div className="space-y-2 pt-2 border-t border-emerald-100 dark:border-emerald-900">
        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
          {t('voice_presets')}
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_TRANSCRIPTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSimulate(preset.text)}
              className="text-[11px] bg-emerald-50 dark:bg-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-950 dark:text-emerald-100 font-medium px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5"
            >
              <Volume2 className="w-3 h-3 text-emerald-600" />
              <span>{preset.lang}: "{preset.text.substring(0, 24)}..."</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recognized Text Display */}
      {transcript && (
        <div className="bg-emerald-50/70 dark:bg-emerald-900/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{isHindi ? 'पहचाना गया वॉयस टेक्स्ट (स्वतः फॉर्म में भरा गया):' : 'Speech Transcript Captured (Auto-populated into form):'}</span>
          </span>
          <p className="text-xs text-emerald-950 dark:text-white font-medium leading-relaxed">
            "{transcript}"
          </p>
        </div>
      )}
    </div>
  );
}
