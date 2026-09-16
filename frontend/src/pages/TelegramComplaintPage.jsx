import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import TelegramSimulator from '../components/TelegramSimulator';
import {
  Send,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Bot,
  Copy,
  Check,
  Smartphone,
  Globe,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Radio
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function TelegramComplaintPage() {
  const { t, isHindi } = useContext(LanguageContext);
  const [telegramComplaints, setTelegramComplaints] = useState([]);
  const [botInfo, setBotInfo] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('/api/telegram/complaints');
      if (res.data?.complaints) {
        setTelegramComplaints(res.data.complaints);
      }
    } catch (err) {
      try {
        const res = await axios.get('/api/complaints');
        const all = res.data?.data || res.data || [];
        setTelegramComplaints(all.filter((c) => c.source === 'telegram'));
      } catch (e) {}
    }
  };

  const fetchBotInfo = async () => {
    try {
      const res = await axios.get('/api/telegram/info');
      if (res.data) setBotInfo(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchComplaints();
    fetchBotInfo();
  }, []);

  const handleCopyWebhook = () => {
    const url = botInfo?.webhookEndpoint || `${window.location.origin}/api/telegram/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ═══ Header ═══ */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-sky-100 dark:border-sky-950 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#2AABEE]" />
          <span>{isHindi ? 'टेलीग्राम डायरेक्ट इनटेक' : 'TELEGRAM DIRECT INTAKE'}</span>
          <span className="text-sky-300">•</span>
          <span>{isHindi ? 'शून्य-ऐप चैट निवारण' : 'ZERO-APP CHAT REDRESSAL'}</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#2AABEE] text-white flex items-center justify-center shadow-md">
                <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
              </div>
              <span>{isHindi ? 'टेलीग्राम से सीधे शिकायत दर्ज करें' : 'File Complaints via Telegram'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              {isHindi
                ? 'टेलीग्राम पर संदेश भेजकर नगर निगम शिकायत दर्ज करें। AI स्वतः विभाग, प्राथमिकता और 48 घंटे का SLA निर्धारित करता है।'
                : 'Send a direct message on Telegram to report civic grievances. Awaaz AI auto-routes to departments with instant tracking IDs and blockchain stamping.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3 py-2 rounded-2xl flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <div className="text-left leading-none">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Bot Status</span>
                <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  {botInfo?.configured ? '🟢 Live Telegram API' : '⚡ Webhook & Simulator Ready'}
                </span>
              </div>
            </div>

            <a
              href="https://t.me/awaaz_ai_civic_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2AABEE] hover:bg-sky-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open @awaaz_ai_civic_bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ═══ 4-Step Intake Flow ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            step: '1',
            icon: <Send className="w-5 h-5 text-sky-500" />,
            title: isHindi ? 'टेलीग्राम संदेश' : 'Direct Message',
            desc: isHindi ? 'बॉट को समस्या या फोटो भेजें' : 'Send issue description or photo to Telegram Bot'
          },
          {
            step: '2',
            icon: <Sparkles className="w-5 h-5 text-teal-500" />,
            title: isHindi ? 'एआई ट्रायज' : 'NLP Triage',
            desc: isHindi ? 'AI स्वतः श्रेणी और प्राथमिकता तय करता है' : 'Auto-classifies into Road, Water, Waste, or Electric'
          },
          {
            step: '3',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
            title: isHindi ? 'ब्लॉकचेन रिकॉर्ड' : 'Blockchain Ledger',
            desc: isHindi ? 'SHA-256 ऑडिट हैश से सुरक्षित टिकट' : 'Immutable timestamp and cryptographic tamper hash'
          },
          {
            step: '4',
            icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
            title: isHindi ? 'लाइव ट्रैकिंग' : 'Instant Tracking',
            desc: isHindi ? 'चैट में ट्रैकिंग आईडी व SLA मिलता है' : 'Tracking ID & resolution SLA sent back to Telegram'
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2 relative"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2AABEE] text-white text-xs font-bold flex items-center justify-center">
                {item.step}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ═══ Main Split: Interactive Simulator + Real Bot Connect Card ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Telegram Chat Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#2AABEE]" />
              <span>{isHindi ? 'लाइव टेलीग्राम बॉट सिम्युलेटर' : 'Live Telegram Bot Simulator'}</span>
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isHindi ? 'वास्तविक समय परीक्षण' : 'Real-time interactive testing'}
            </span>
          </div>

          <TelegramSimulator onComplaintCreated={() => fetchComplaints()} />
        </div>

        {/* Right Column: Connect Real Telegram Bot & Recent Complaints (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real Telegram Bot Configuration Guide */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-sky-100 dark:border-sky-950 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#2AABEE]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'वास्तविक टेलीग्राम बॉट जोड़ें' : 'Connect Real Telegram Bot'}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {isHindi ? '3 आसान चरणों में लाइव करें' : 'Go live in 3 simple steps'}
                </span>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  1
                </span>
                <span>
                  Open Telegram, search for{' '}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2AABEE] font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    @BotFather <ExternalLink className="w-2.5 h-2.5" />
                  </a>{' '}
                  and type <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/newbot</code>.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  2
                </span>
                <span>
                  Copy your HTTP API Token and add it to <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">backend/.env</code>:
                  <div className="mt-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-800 dark:text-slate-200 truncate">
                    TELEGRAM_BOT_TOKEN=789456:AAH...
                  </div>
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  3
                </span>
                <div className="space-y-1">
                  <span>Register this webhook with Telegram:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={botInfo?.webhookEndpoint || `${window.location.origin}/api/telegram/webhook`}
                      className="bg-slate-100 dark:bg-slate-800 text-[10.5px] font-mono px-2 py-1 rounded-lg flex-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-[#2AABEE] hover:bg-sky-100 transition shrink-0"
                      title="Copy Webhook URL"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Recent Telegram Complaints Feed */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#2AABEE]" />
                <span>{isHindi ? 'टेलीग्राम से प्राप्त शिकायतें' : 'Complaints From Telegram'}</span>
              </h3>
              <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-mono">
                {telegramComplaints.length} Total
              </span>
            </div>

            {telegramComplaints.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No complaints recorded via Telegram yet. Try sending one in the simulator!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {telegramComplaints.slice(0, 6).map((c) => (
                  <Link
                    key={c.complaintId || c._id}
                    to={`/complaint/${c.complaintId || c._id}`}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between gap-2 block group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
                          {c.complaintId}
                        </span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-slate-100 font-medium truncate mt-0.5">
                        {c.title}
                      </p>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
