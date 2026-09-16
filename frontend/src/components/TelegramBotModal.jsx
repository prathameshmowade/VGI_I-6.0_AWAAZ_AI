import React, { useState } from 'react';
import { Send, Bot, ExternalLink, ArrowRight, ChevronDown } from 'lucide-react';
import TelegramSimulator from './TelegramSimulator';
import { Link } from 'react-router-dom';

export default function TelegramBotModal({ onComplaintCreated }) {
  const [showSimulator, setShowSimulator] = useState(false);
  const botUsername = 'awaaz_ai_civic_bot';
  const telegramUrl = `https://t.me/${botUsername}`;

  const handleOpenTelegram = (e) => {
    // If the user clicks the simulator toggle, don't redirect
    if (e.target.closest('.simulator-toggle')) return;
    
    // Direct redirect to Telegram
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-2">
      {/* Direct Telegram Chat Bot Ingestion Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenTelegram}
        onKeyDown={(e) => { if (e.key === 'Enter') handleOpenTelegram(e); }}
        className="w-full bg-gradient-to-r from-[#2AABEE] via-sky-500 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold p-4 sm:p-5 rounded-2xl transition-all shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group active:scale-[0.99] cursor-pointer border border-sky-300/40"
      >
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform shrink-0">
            <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black tracking-tight">
                Telegram Civic Chat Bot
              </span>
              <span className="bg-white/25 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                @awaaz_ai_civic_bot
              </span>
              <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>
                Live 24/7
              </span>
            </div>
            <span className="block text-xs text-sky-100 font-normal mt-0.5 leading-relaxed">
              Report civic issues instantly on Telegram with photos, voice, & live GPS location. Click to open bot chat.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-auto bg-white hover:bg-sky-50 text-[#2AABEE] font-black text-xs px-5 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg active:scale-95"
          >
            <span>Open Telegram Bot</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Optional In-Browser Testing Fallback */}
      <div className="flex justify-between items-center px-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span>Prefer testing in-browser?</span>
        <button
          type="button"
          onClick={() => setShowSimulator(!showSimulator)}
          className="simulator-toggle font-bold text-[#2AABEE] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{showSimulator ? 'Hide Web Simulator' : 'Test with In-Browser Simulator'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showSimulator ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showSimulator && (
        <div className="p-3 bg-sky-50/60 dark:bg-slate-900/60 rounded-3xl border border-sky-200 dark:border-sky-900 animate-in fade-in slide-in-from-top-3 duration-200 space-y-2">
          <div className="flex justify-between items-center px-2 text-xs text-sky-900 dark:text-sky-300">
            <span className="font-bold flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#2AABEE]" />
              <span>In-Browser Web Simulator</span>
            </span>
            <Link
              to="/telegram-complaint"
              className="text-[#2AABEE] hover:underline font-bold flex items-center gap-1"
            >
              <span>Full Screen View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <TelegramSimulator onComplaintCreated={onComplaintCreated} />
        </div>
      )}
    </div>
  );
}
