import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import axios from 'axios';

const PRESET_SMS_MESSAGES = [
  { lang: 'EN', text: 'Huge pothole on Main Road near ABC School causing bike accidents daily' },
  { lang: 'EN', text: 'Water pipeline burst in Sector 7, dirty water flooding the street for 2 days' },
  { lang: 'HI', text: 'लक्ष्मी नगर वार्ड 5 में 3 दिनों से कूड़ा इकट्ठा है, बदबू आ रही है' },
  { lang: 'HI', text: 'धरमपेठ चौक पर स्ट्रीटलाइट 1 हफ्ते से बंद है, रात को अंधेरा रहता है' }
];

export default function SmsSimulator() {
  const { isHindi } = useContext(LanguageContext);
  const [messages, setMessages] = useState([
    {
      sender: 'system',
      text: isHindi
        ? '📱 आवाज़.ai SMS शिकायत सिम्युलेटर में आपका स्वागत है! नीचे अपनी शिकायत टाइप करें या प्रीसेट संदेश चुनें।'
        : '📱 Welcome to Awaaz.ai SMS Complaint Simulator! Type your complaint below or select a preset message.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber] = useState('+91 98765 43210');

  const handleSendSms = async (messageText) => {
    const text = messageText || input.trim();
    if (!text) return;

    // Add user message
    const userMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Add "processing" indicator
    setMessages(prev => [...prev, { sender: 'system', text: '⏳ Processing complaint via AI Triage Engine...', timestamp: new Date(), isProcessing: true }]);

    try {
      const res = await axios.post('/api/sms/simulate', {
        message: text,
        phoneNumber: phoneNumber.replace(/\s/g, '')
      });

      // Remove processing message and add response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isProcessing);
        return [
          ...filtered,
          {
            sender: 'system',
            text: res.data.confirmation || `✅ Complaint registered! ID: ${res.data.data?.complaintId}`,
            timestamp: new Date(),
            complaintData: res.data.data
          }
        ];
      });
    } catch (err) {
      // Fallback simulation
      const fakeId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isProcessing);
        return [
          ...filtered,
          {
            sender: 'system',
            text: `✅ Awaaz AI: Your complaint "${text.substring(0, 40)}..." has been registered as ${fakeId}. Category: Road Damage. SLA: 48 hours.`,
            timestamp: new Date()
          }
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Phone Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl p-4 flex items-center justify-between border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Awaaz AI Helpline</span>
            <span className="text-[10px] text-emerald-400 font-mono">{isHindi ? 'SMS शिकायत सेवा' : 'SMS Complaint Service'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-emerald-400 font-bold">{isHindi ? 'ऑनलाइन' : 'ONLINE'}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-72 overflow-y-auto space-y-3 p-4 bg-slate-950/80 border-x border-emerald-500/10 scroll-smooth" id="sms-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md shadow-lg shadow-emerald-600/20'
                    : m.isProcessing
                    ? 'bg-slate-800/80 text-amber-300 border border-amber-500/30 rounded-bl-md animate-pulse'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md'
                }`}
              >
                {m.text}
              </div>
              {/* Complaint details card */}
              {m.complaintData && (
                <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-3 text-[10px] space-y-1.5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="font-bold text-emerald-300">{isHindi ? 'शिकायत विवरण' : 'Complaint Details'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                    <span>📋 ID: <span className="font-mono font-bold text-emerald-300">{m.complaintData.complaintId}</span></span>
                    <span>📁 {m.complaintData.category}</span>
                    <span>🏢 {m.complaintData.department}</span>
                    <span>🎯 {m.complaintData.confidenceScore}% {isHindi ? 'सटीकता' : 'confidence'}</span>
                  </div>
                </div>
              )}
              <span className="text-[9px] text-slate-500 px-1 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(m.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Preset Messages */}
      <div className="px-4 pb-2 border-x border-emerald-500/10 bg-slate-950/40">
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
          {isHindi ? '📋 प्रीसेट शिकायत संदेश:' : '📋 Preset Complaint Messages:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SMS_MESSAGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSendSms(preset.text)}
              className="text-[10px] bg-slate-800/60 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-600/40 transition-all flex items-center gap-1 disabled:opacity-50"
            >
              <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
              <span>{preset.lang}: "{preset.text.substring(0, 30)}..."</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendSms(); }}
        className="flex gap-2 p-4 bg-slate-900 rounded-b-3xl border border-emerald-500/20 border-t-0"
      >
        <input
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder-slate-400 font-medium"
          placeholder={isHindi ? 'शिकायत टाइप करें जैसे: सड़क में गड्ढा, पानी लीक...' : 'Type complaint e.g. Road pothole, Water leak...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isHindi ? 'भेजें' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
}
