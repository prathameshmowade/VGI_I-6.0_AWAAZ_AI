import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import SmsSimulator from '../components/SmsSimulator';
import {
  MessageSquare,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  Sparkles,
  Globe,
  FileText
} from 'lucide-react';
import axios from 'axios';

export default function SmsComplaintPage() {
  const { t, isHindi } = useContext(LanguageContext);
  const [smsComplaints, setSmsComplaints] = useState([]);

  useEffect(() => {
    const fetchSmsComplaints = async () => {
      try {
        const res = await axios.get('/api/sms/complaints');
        if (res.data?.data) setSmsComplaints(res.data.data);
      } catch (err) {
        // Fallback: check localStorage
        try {
          const saved = localStorage.getItem('civic_officer_complaints');
          if (saved) {
            const all = JSON.parse(saved);
            setSmsComplaints(all.filter(c => c.source === 'sms'));
          }
        } catch (e) {}
      }
    };
    fetchSmsComplaints();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'SMS शिकायत चैनल' : 'SMS COMPLAINT CHANNEL'}</span>
          <span className="text-emerald-300">•</span>
          <span>{isHindi ? 'शून्य-ऐप प्रवेश' : 'ZERO-APP ACCESS'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 dark:text-white flex items-center gap-2.5">
          <MessageSquare className="w-7 h-7 text-emerald-600" />
          <span>{isHindi ? '📱 SMS से शिकायत दर्ज करें' : '📱 File Complaint via Text SMS'}</span>
        </h1>
        <p className="text-emerald-800 dark:text-emerald-300 text-xs md:text-sm max-w-2xl leading-relaxed">
          {isHindi
            ? 'बिना ऐप, बिना इंटरनेट — सिर्फ एक SMS भेजकर अपनी नगरपालिका शिकायत दर्ज करें। AI स्वचालित रूप से आपकी शिकायत को वर्गीकृत करेगा और ट्रैकिंग ID भेजेगा।'
            : 'No app, no internet needed — simply send a text message to register your municipal complaint. AI automatically classifies your grievance and sends you a tracking ID via SMS.'}
        </p>
      </div>

      {/* How It Works - 4 Step Flow */}
      <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-5">
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          {isHindi ? 'कैसे काम करता है?' : 'How SMS Complaint Works'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '1',
              icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
              title: isHindi ? 'SMS भेजें' : 'Send SMS',
              desc: isHindi ? 'अपनी शिकायत हेल्पलाइन नंबर पर SMS करें' : 'Text your complaint to the helpline number'
            },
            {
              step: '2',
              icon: <Sparkles className="w-6 h-6 text-teal-500" />,
              title: isHindi ? 'AI वर्गीकरण' : 'AI Classification',
              desc: isHindi ? 'AI स्वतः श्रेणी, विभाग और प्राथमिकता निर्धारित करता है' : 'AI auto-detects category, department & priority'
            },
            {
              step: '3',
              icon: <FileText className="w-6 h-6 text-blue-500" />,
              title: isHindi ? 'टिकट बनाया गया' : 'Ticket Created',
              desc: isHindi ? 'SHA-256 ऑडिट हैश के साथ शिकायत टिकट बनता है' : 'Complaint ticket created with SHA-256 audit hash'
            },
            {
              step: '4',
              icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
              title: isHindi ? 'SMS पुष्टि' : 'SMS Confirmation',
              desc: isHindi ? 'ट्रैकिंग ID के साथ पुष्टि SMS आता है' : 'Confirmation SMS with tracking ID sent back'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-white">{item.title}</h3>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{item.desc}</p>
              {idx < 3 && (
                <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Features Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-wrap gap-4 text-white text-xs">
          {[
            { icon: <Globe className="w-4 h-4" />, text: isHindi ? 'हिंदी, अंग्रेज़ी, मराठी' : 'Hindi, English, Marathi' },
            { icon: <Sparkles className="w-4 h-4" />, text: isHindi ? '96% AI सटीकता' : '96% AI Accuracy' },
            { icon: <Clock className="w-4 h-4" />, text: isHindi ? '48 घंटे SLA' : '48hr SLA Guarantee' },
            { icon: <ShieldCheck className="w-4 h-4" />, text: isHindi ? 'PII डेटा सुरक्षा' : 'DPDP Act Privacy' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg font-bold">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Simulator */}
      <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            {isHindi ? 'SMS सिम्युलेटर (लाइव डेमो)' : 'SMS Simulator (Live Demo)'}
          </h2>
          <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            {isHindi ? 'इंटरैक्टिव डेमो' : 'Interactive Demo'}
          </span>
        </div>

        <SmsSimulator />
      </div>

      {/* Recent SMS Complaints Log */}
      {smsComplaints.length > 0 && (
        <div className="bg-white dark:bg-emerald-950/70 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isHindi ? `SMS शिकायत लॉग (${smsComplaints.length})` : `SMS Complaint Log (${smsComplaints.length})`}
          </h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {smsComplaints.slice(0, 10).map((complaint, idx) => (
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
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    📱 SMS
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
