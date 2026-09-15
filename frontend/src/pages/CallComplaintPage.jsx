import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import CallSimulator from '../components/CallSimulator';
import {
  Phone,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  Mic,
  ArrowRight,
  Sparkles,
  Globe,
  FileText,
  Radio,
  Headphones
} from 'lucide-react';
import axios from 'axios';

export default function CallComplaintPage() {
  const { t, isHindi } = useContext(LanguageContext);
  const [callComplaints, setCallComplaints] = useState([]);

  useEffect(() => {
    const fetchCallComplaints = async () => {
      try {
        const res = await axios.get('/api/call/complaints');
        if (res.data?.data) setCallComplaints(res.data.data);
      } catch (err) {
        try {
          const saved = localStorage.getItem('civic_officer_complaints');
          if (saved) {
            const all = JSON.parse(saved);
            setCallComplaints(all.filter(c => c.source === 'call'));
          }
        } catch (e) {}
      }
    };
    fetchCallComplaints();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'कॉल शिकायत चैनल' : 'CALL COMPLAINT CHANNEL'}</span>
          <span className="text-emerald-300">•</span>
          <span>{isHindi ? 'वॉयस IVR प्रणाली' : 'VOICE IVR SYSTEM'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 dark:text-white flex items-center gap-2.5">
          <Phone className="w-7 h-7 text-emerald-600" />
          <span>{isHindi ? '📞 कॉल करके शिकायत दर्ज करें' : '📞 File Complaint via Phone Call'}</span>
        </h1>
        <p className="text-emerald-800 dark:text-emerald-300 text-xs md:text-sm max-w-2xl leading-relaxed">
          {isHindi
            ? 'सिर्फ एक फोन कॉल करें और अपनी शिकायत बोलें। IVR सिस्टम आपकी आवाज़ रिकॉर्ड करेगा, AI ट्रांसक्राइब और वर्गीकृत करेगा, और SMS पुष्टि भेजेगा।'
            : 'Just make a phone call and speak your complaint. The IVR system records your voice, AI transcribes & classifies it, and sends SMS confirmation with tracking ID.'}
        </p>
      </div>

      {/* How It Works - 5 Step Flow */}
      <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-5">
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          {isHindi ? 'कैसे काम करता है?' : 'How Call Complaint Works'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              step: '1',
              icon: <Phone className="w-5 h-5 text-emerald-500" />,
              title: isHindi ? 'कॉल करें' : 'Make a Call',
              desc: isHindi ? 'हेल्पलाइन नंबर पर कॉल करें' : 'Dial the helpline number'
            },
            {
              step: '2',
              icon: <Headphones className="w-5 h-5 text-teal-500" />,
              title: isHindi ? 'IVR सुनें' : 'IVR Greeting',
              desc: isHindi ? 'स्वचालित अभिवादन सुनें' : 'Listen to automated greeting'
            },
            {
              step: '3',
              icon: <Mic className="w-5 h-5 text-red-500" />,
              title: isHindi ? 'शिकायत बोलें' : 'Speak Complaint',
              desc: isHindi ? 'बीप के बाद अपनी शिकायत बोलें' : 'Describe your issue after the beep'
            },
            {
              step: '4',
              icon: <Sparkles className="w-5 h-5 text-blue-500" />,
              title: isHindi ? 'AI प्रोसेसिंग' : 'AI Processing',
              desc: isHindi ? 'वॉयस → टेक्स्ट → AI वर्गीकरण' : 'Voice → Text → AI Classification'
            },
            {
              step: '5',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              title: isHindi ? 'SMS पुष्टि' : 'SMS Confirmation',
              desc: isHindi ? 'ट्रैकिंग ID SMS से आएगा' : 'Tracking ID sent via SMS'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-900/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.step}
                </span>
                {item.icon}
              </div>
              <h3 className="text-xs font-bold text-emerald-950 dark:text-white">{item.title}</h3>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{item.desc}</p>
              {idx < 4 && (
                <ArrowRight className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-wrap gap-4 text-white text-xs">
          {[
            { icon: <Globe className="w-4 h-4" />, text: isHindi ? '3 भाषाएं (EN/HI/MR)' : '3 Languages (EN/HI/MR)' },
            { icon: <Radio className="w-4 h-4" />, text: isHindi ? 'वॉयस ट्रांसक्रिप्शन' : 'Voice Transcription' },
            { icon: <Sparkles className="w-4 h-4" />, text: isHindi ? 'AI ऑटो-वर्गीकरण' : 'AI Auto-Classification' },
            { icon: <ShieldCheck className="w-4 h-4" />, text: isHindi ? 'SHA-256 ऑडिट' : 'SHA-256 Audit Trail' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg font-bold">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Call Simulator */}
      <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600" />
            {isHindi ? 'कॉल सिम्युलेटर (लाइव डेमो)' : 'Call Simulator (Live Demo)'}
          </h2>
          <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            {isHindi ? 'IVR इंटरैक्टिव डेमो' : 'IVR Interactive Demo'}
          </span>
        </div>

        <div className="max-w-md mx-auto">
          <CallSimulator />
        </div>
      </div>

      {/* Recent Call Complaints Log */}
      {callComplaints.length > 0 && (
        <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isHindi ? `कॉल शिकायत लॉग (${callComplaints.length})` : `Call Complaint Log (${callComplaints.length})`}
          </h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {callComplaints.slice(0, 10).map((complaint, idx) => (
              <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">
                    {complaint.complaintId}
                  </span>
                  <span className="text-emerald-950 dark:text-white font-medium truncate max-w-[200px]">
                    {complaint.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    📞 Call
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px]">
                    {complaint.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
