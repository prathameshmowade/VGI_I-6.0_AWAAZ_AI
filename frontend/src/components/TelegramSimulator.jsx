import React, { useState, useRef, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import {
  Send,
  Sparkles,
  Check,
  CheckCheck,
  Bot,
  ExternalLink,
  HelpCircle,
  Clock,
  ShieldCheck,
  Paperclip,
  Smile,
  MapPin,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const QUICK_PRESETS = [
  {
    label: '🕳️ Road Pothole (Ward 12)',
    text: 'Deep crater pothole in front of Laxmi Nagar hospital. High risk of 2-wheeler accidents.'
  },
  {
    label: '💧 Pipeline Leak (Dharampeth)',
    text: 'Main drinking water pipeline ruptured and flooding road near market square.'
  },
  {
    label: '🗑️ Garbage Dump Overflow',
    text: 'Municipal solid waste bin overflowing for 3 days near public park gate.'
  },
  {
    label: '💡 Streetlight Blackout',
    text: 'Streetlights not working on entire 4th cross road, complete darkness at night.'
  },
  {
    label: '📋 Check Status',
    text: '/status CMP-2026-001'
  }
];

export default function TelegramSimulator({ onComplaintCreated }) {
  const { t, isHindi } = useContext(LanguageContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      time: '12:00 PM',
      text: `🏛️ *Welcome to Awaaz AI Civic Bot!*
_Every Voice Heard • Official Municipal Grievance Desk_

You can file any civic issue in your ward directly from Telegram.

👉 *How it works:*
1. Type your problem in natural language (English or Hindi).
2. AI automatically classifies department, priority, and assigns SLA.
3. You get an instant tracking ID with live blockchain verification.

_Try typing an issue or click one of the quick presets below!_ 👇`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('@nagpur_citizen');
  const [loading, setLoading] = useState(false);
  const [lastComplaintId, setLastComplaintId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || loading) return;

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      time: getCurrentTime(),
      text: textToSend,
      status: 'sent'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setLoading(true);

    try {
      // Simulate typing delay for realistic bot feel
      const res = await axios.post('/api/telegram/simulate', {
        text: textToSend,
        username: username,
        chatId: '87654321'
      });

      const data = res.data;
      const botMsgId = Date.now() + 1;

      // Update user message status to delivered
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'read' } : m))
      );

      const botReply = {
        id: botMsgId,
        sender: 'bot',
        time: getCurrentTime(),
        text: data.reply || '✅ Complaint registered successfully.',
        complaintId: data.complaintId || null,
        complaint: data.complaint || null
      };

      setMessages((prev) => [...prev, botReply]);

      if (data.complaintId) {
        setLastComplaintId(data.complaintId);
        onComplaintCreated?.(data.complaint);
      }
    } catch (err) {
      console.error('[Telegram Simulator Error]:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        time: getCurrentTime(),
        text: '❌ *Awaaz AI:* Server error processing your request. Please check backend connection.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        time: getCurrentTime(),
        text: `🏛️ *Welcome to Awaaz AI Civic Bot!*
_Chat reset. Type an issue below or pick a preset to register a complaint._`
      }
    ]);
    setLastComplaintId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-100 dark:border-sky-950 shadow-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
      {/* ═══ Telegram App Header Bar ═══ */}
      <div className="bg-[#2AABEE] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner border border-white/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2AABEE] rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm leading-tight">Awaaz AI Municipal Bot</span>
              <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                bot
              </span>
            </div>
            <span className="text-[11px] text-sky-100 block leading-tight">
              @AwaazCivic_bot • official helpline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetChat}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 font-semibold"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Username Switcher Bar */}
      <div className="bg-sky-50 dark:bg-sky-950/40 px-4 py-1.5 border-b border-sky-100 dark:border-sky-900 flex items-center justify-between text-xs text-sky-900 dark:text-sky-200">
        <span className="flex items-center gap-1 font-mono text-[11px]">
          <span className="text-sky-500 font-bold">Sender:</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent border-b border-sky-300 dark:border-sky-700 px-1 font-bold text-sky-800 dark:text-sky-200 focus:outline-hidden"
          />
        </span>
        <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">
          ⚡ Direct Telegram Webhook Engine
        </span>
      </div>

      {/* ═══ Telegram Chat Message Canvas ═══ */}
      <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-[#E4EAF0] dark:bg-slate-950/90 bg-opacity-70">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 shadow-xs text-xs sm:text-[13px] leading-relaxed relative ${
                  isUser
                    ? 'bg-[#EEFFDE] dark:bg-emerald-950/80 text-slate-900 dark:text-emerald-100 rounded-tr-none border border-emerald-200/60 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Message Text with simple Markdown formatting */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split('\n').map((line, lIdx) => {
                    // Bold headers
                    if (line.startsWith('*') && line.endsWith('*')) {
                      return <div key={lIdx} className="font-bold text-sm text-sky-950 dark:text-sky-200 py-0.5">{line.replace(/\*/g, '')}</div>;
                    }
                    return (
                      <div key={lIdx}>
                        {line.replace(/\*([^*]+)\*/g, '$1')}
                      </div>
                    );
                  })}
                </div>

                {/* Complaint Action Card inside Bot Message */}
                {msg.complaintId && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/70 px-2 py-0.5 rounded-md">
                      #{msg.complaintId}
                    </span>
                    <Link
                      to={`/complaint/${msg.complaintId}`}
                      className="inline-flex items-center gap-1 bg-[#2AABEE] hover:bg-sky-600 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition-all shadow-xs"
                    >
                      <span>Track Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Time & Read Status */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[9.5px] font-mono ${
                    isUser ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isUser && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-sky-500" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-400 font-medium bg-white dark:bg-slate-900 w-fit px-3 py-1.5 rounded-full shadow-xs border border-sky-100 dark:border-sky-900 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-spin" />
            <span>Awaaz AI Bot is typing...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ═══ 1-Click Quick Grievance Presets ═══ */}
      <div className="bg-sky-50/70 dark:bg-slate-900/90 px-3 py-2 border-t border-sky-100 dark:border-sky-950 overflow-x-auto">
        <div className="flex items-center gap-1.5 w-max">
          <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 shrink-0">
            Presets:
          </span>
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              disabled={loading}
              className="text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800 px-2.5 py-1 rounded-full whitespace-nowrap transition active:scale-95 disabled:opacity-50 shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Telegram Input Box ═══ */}
      <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isHindi ? 'टेलीग्राम पर शिकायत लिखें या /status दर्ज करें...' : 'Send message to Awaaz Civic Bot or type /help...'}
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#2AABEE] transition"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="w-10 h-10 rounded-full bg-[#2AABEE] hover:bg-sky-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white flex items-center justify-center transition active:scale-95 shadow-md shrink-0"
          title="Send to Telegram Bot"
        >
          <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
        </button>
      </div>
    </div>
  );
}
