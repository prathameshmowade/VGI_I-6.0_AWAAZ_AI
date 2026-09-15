import React, { useState } from 'react';
import { Send, Bot, X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import TelegramSimulator from './TelegramSimulator';
import { Link } from 'react-router-dom';

export default function TelegramBotModal({ onComplaintCreated }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#2AABEE] hover:bg-sky-600 text-white font-extrabold p-4 rounded-2xl transition shadow-xl flex items-center justify-between group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner">
            <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div>
            <span className="block text-sm font-black flex items-center gap-2">
              <span>Innovation #6: Telegram Civic Direct Ingestion</span>
              <span className="bg-white/25 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                New
              </span>
            </span>
            <span className="block text-xs text-sky-100 font-normal">
              Direct message from Telegram instantly registered into civic complaints ledger
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-sky-700/80 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold font-mono">
            {isOpen ? 'Close Chat' : 'Open Telegram Bot'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 p-2 bg-sky-50/50 dark:bg-slate-900/60 rounded-3xl border border-sky-200 dark:border-sky-900 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex justify-between items-center px-4 py-2 text-xs text-sky-900 dark:text-sky-300">
            <span className="font-bold flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#2AABEE]" />
              <span>Telegram Bot Ingestion Window</span>
            </span>
            <Link
              to="/telegram-complaint"
              className="text-[#2AABEE] hover:underline font-bold flex items-center gap-1"
            >
              <span>Full Screen & BotFather Guide</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <TelegramSimulator onComplaintCreated={onComplaintCreated} />
        </div>
      )}
    </div>
  );
}
