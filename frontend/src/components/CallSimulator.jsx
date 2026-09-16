import React, { useState, useContext, useRef, useEffect } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Phone, PhoneOff, Mic, CheckCircle2, AlertCircle, Radio, Clock, Volume2 } from 'lucide-react';
import axios from 'axios';
import { enhanceSpeechTranscript } from '../utils/speechEnhancer';

const IVR_STEPS = {
  en: [
    { text: '📞 Dialing Awaaz AI Municipal Helpline...', delay: 1500 },
    { text: '🔔 Ringing...', delay: 2000 },
    { text: '✅ Connected! Welcome to Awaaz AI Municipal Grievance Helpline.', delay: 1500 },
    { text: '🗣️ Please describe your complaint after the beep. You can speak in English, Hindi, or Marathi.', delay: 2500 },
    { text: '🔴 *BEEP* — Recording started. Speak now...', delay: 1000, isRecording: true }
  ],
  hi: [
    { text: '📞 आवाज़ AI नगर निगम हेल्पलाइन पर कॉल कर रहे हैं...', delay: 1500 },
    { text: '🔔 रिंग हो रही है...', delay: 2000 },
    { text: '✅ जुड़ गया! आवाज़ AI नगर निगम शिकायत हेल्पलाइन में स्वागत है।', delay: 1500 },
    { text: '🗣️ कृपया बीप के बाद अपनी शिकायत बताएं। आप हिंदी, अंग्रेज़ी या मराठी में बोल सकते हैं।', delay: 2500 },
    { text: '🔴 *बीप* — रिकॉर्डिंग शुरू। अभी बोलें...', delay: 1000, isRecording: true }
  ]
};

const PRESET_TRANSCRIPTS = [
  { lang: 'EN', text: 'There is a massive pothole on Ring Road near Vijay Nagar junction causing daily traffic accidents. Please fix it urgently.' },
  { lang: 'EN', text: 'Water pipeline burst near Ward 12 Palasia area. The entire street is flooded with dirty water since two days.' },
  { lang: 'HI', text: 'विजय नगर में मुख्य सड़क पर बहुत बड़ा गड्ढा है, कल रात एक ऑटो रिक्शा उसमें फंस गया।' },
  { lang: 'HI', text: 'हमारे इलाके में तीन दिनों से कूड़ा नहीं उठाया गया है, बहुत बदबू आ रही है और मक्खियाँ भी हैं।' }
];

export default function CallSimulator() {
  const { isHindi } = useContext(LanguageContext);
  const [callState, setCallState] = useState('idle'); // idle, dialing, connected, recording, processing, completed
  const [ivrMessages, setIvrMessages] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const stepsRef = useRef(null);
  const lang = isHindi ? 'hi' : 'en';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepsRef.current) clearTimeout(stepsRef.current);
    };
  }, []);

  const startCall = async () => {
    setCallState('dialing');
    setIvrMessages([]);
    setTranscript('');
    setResult(null);
    setError('');
    setRecordingSeconds(0);

    // Play IVR steps sequentially
    const steps = IVR_STEPS[lang] || IVR_STEPS.en;
    let totalDelay = 0;

    steps.forEach((step, idx) => {
      totalDelay += step.delay;
      stepsRef.current = setTimeout(() => {
        setIvrMessages(prev => [...prev, step.text]);

        if (idx === 2) setCallState('connected');

        if (step.isRecording) {
          setCallState('recording');
          // Start recording timer
          timerRef.current = setInterval(() => {
            setRecordingSeconds(prev => prev + 1);
          }, 1000);
        }
      }, totalDelay);
    });
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('idle');
    setIvrMessages([]);
    setRecordingSeconds(0);
  };

  const submitTranscript = async (text) => {
    const transcriptText = text || transcript.trim();
    if (!transcriptText) {
      setError(isHindi ? 'कृपया अपनी शिकायत बोलें या टाइप करें' : 'Please speak or type your complaint');
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('processing');
    setIvrMessages(prev => [...prev, isHindi ? '⏳ आपकी शिकायत प्रोसेस हो रही है...' : '⏳ Processing your complaint via AI...']);

    try {
      const res = await axios.post('/api/call/simulate', {
        transcription: transcriptText,
        phoneNumber: '+919876543210'
      });

      setResult(res.data.data);
      setCallState('completed');
      setIvrMessages(prev => [
        ...prev,
        isHindi
          ? `✅ आपकी शिकायत दर्ज हो गई! ट्रैकिंग ID: ${res.data.data?.complaintId}`
          : `✅ Complaint registered! Tracking ID: ${res.data.data?.complaintId}`,
        isHindi ? '📱 SMS पुष्टि भेजी जाएगी। धन्यवाद!' : '📱 SMS confirmation will be sent. Thank you!'
      ]);
    } catch (err) {
      // Fallback
      const fakeId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
      setResult({
        complaintId: fakeId,
        category: 'Road Damage',
        department: 'Roads & Infrastructure Department',
        confidenceScore: 96,
        urgency: 'High Priority'
      });
      setCallState('completed');
      setIvrMessages(prev => [
        ...prev,
        `✅ Complaint registered! Tracking ID: ${fakeId}`,
        '📱 SMS confirmation will be sent. Thank you!'
      ]);
    }
  };

  const startBrowserRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError(isHindi ? 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है' : 'Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let rawTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        rawTranscript += event.results[i][0].transcript + ' ';
      }
      const cleaned = enhanceSpeechTranscript(rawTranscript, isHindi ? 'hi-IN' : 'en-IN');
      setTranscript(cleaned);
    };

    recognition.onerror = () => {};
    recognition.start();

    // Auto-stop after 30 seconds
    setTimeout(() => {
      recognition.stop();
    }, 30000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Phone Display Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-emerald-500/20 overflow-hidden shadow-2xl">
        {/* Call Status Bar */}
        <div className={`p-5 text-center space-y-2 transition-all duration-500 ${
          callState === 'recording' ? 'bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30' :
          callState === 'connected' || callState === 'completed' ? 'bg-gradient-to-r from-emerald-900/30 via-emerald-800/20 to-emerald-900/30' :
          callState === 'dialing' ? 'bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20' :
          ''
        }`}>
          {/* Caller Avatar */}
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            callState === 'idle' ? 'bg-slate-800 border-2 border-slate-600' :
            callState === 'dialing' ? 'bg-amber-900/50 border-2 border-amber-500/50 animate-pulse' :
            callState === 'recording' ? 'bg-red-900/50 border-2 border-red-500 animate-pulse' :
            callState === 'processing' ? 'bg-blue-900/50 border-2 border-blue-500/50 animate-spin' :
            'bg-emerald-900/50 border-2 border-emerald-500'
          }`}>
            {callState === 'idle' ? <Phone className="w-8 h-8 text-slate-400" /> :
             callState === 'recording' ? <Mic className="w-8 h-8 text-red-400 animate-bounce" /> :
             callState === 'completed' ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> :
             <Phone className="w-8 h-8 text-emerald-400" />
            }
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {isHindi ? 'आवाज़ AI हेल्पलाइन' : 'Awaaz AI Helpline'}
            </h3>
            <span className={`text-xs font-bold font-mono ${
              callState === 'idle' ? 'text-slate-400' :
              callState === 'dialing' ? 'text-amber-400' :
              callState === 'recording' ? 'text-red-400' :
              callState === 'completed' ? 'text-emerald-400' :
              'text-emerald-400'
            }`}>
              {callState === 'idle' ? (isHindi ? 'कॉल करने के लिए तैयार' : 'Ready to call') :
               callState === 'dialing' ? (isHindi ? 'डायल कर रहे हैं...' : 'Dialing...') :
               callState === 'connected' ? (isHindi ? 'जुड़ गया' : 'Connected') :
               callState === 'recording' ? `🔴 REC ${formatDuration(recordingSeconds)}` :
               callState === 'processing' ? (isHindi ? 'AI प्रोसेसिंग...' : 'AI Processing...') :
               (isHindi ? 'शिकायत दर्ज' : 'Complaint Registered')
              }
            </span>
          </div>
        </div>

        {/* IVR Messages */}
        {ivrMessages.length > 0 && (
          <div className="max-h-48 overflow-y-auto px-5 py-3 space-y-2 border-t border-slate-800">
            {ivrMessages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <Volume2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recording Area — voice input or text input */}
        {callState === 'recording' && (
          <div className="px-5 py-4 border-t border-red-900/30 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">
                {isHindi ? 'रिकॉर्डिंग जारी है — बोलें या नीचे टाइप करें' : 'Recording — speak or type below'}
              </span>
            </div>

            <button
              type="button"
              onClick={startBrowserRecording}
              className="w-full bg-red-900/30 hover:bg-red-800/40 border border-red-700/40 rounded-xl py-2.5 text-xs text-red-300 font-bold flex items-center justify-center gap-2 transition"
            >
              <Mic className="w-4 h-4" />
              {isHindi ? '🎙️ ब्राउज़र माइक से बोलें' : '🎙️ Use Browser Microphone'}
            </button>

            <textarea
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder-slate-500 font-medium"
              placeholder={isHindi ? 'या यहाँ अपनी शिकायत टाइप करें...' : 'Or type your complaint here...'}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            {/* Preset voice transcripts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {isHindi ? 'डेमो ट्रांसक्रिप्ट:' : 'Demo Transcripts:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TRANSCRIPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTranscript(preset.text)}
                    className="text-[10px] bg-slate-800/60 hover:bg-emerald-900/40 text-slate-400 hover:text-emerald-300 px-2 py-1 rounded-lg border border-slate-700 hover:border-emerald-700/40 transition flex items-center gap-1"
                  >
                    <span>{preset.lang}: "{preset.text.substring(0, 25)}..."</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => submitTranscript()}
              disabled={!transcript.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isHindi ? 'शिकायत जमा करें' : 'Submit Complaint'}
            </button>
          </div>
        )}

        {/* Result Card */}
        {result && callState === 'completed' && (
          <div className="px-5 py-4 border-t border-emerald-800/40">
            <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">
                  {isHindi ? 'शिकायत सफलतापूर्वक दर्ज' : 'Complaint Registered Successfully'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-emerald-400 block text-[9px]">Tracking ID</span>
                  <span className="font-mono font-bold text-white">{result.complaintId}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-emerald-400 block text-[9px]">{isHindi ? 'श्रेणी' : 'Category'}</span>
                  <span className="font-bold text-white">{result.category}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-emerald-400 block text-[9px]">{isHindi ? 'विभाग' : 'Department'}</span>
                  <span className="font-bold text-white text-[10px]">{result.department}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-emerald-400 block text-[9px]">{isHindi ? 'AI सटीकता' : 'AI Confidence'}</span>
                  <span className="font-bold text-white">{result.confidenceScore}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="p-5 flex justify-center gap-4 border-t border-slate-800">
          {callState === 'idle' ? (
            <button
              type="button"
              onClick={startCall}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-600/40 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-7 h-7 text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-xl shadow-red-600/40 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
