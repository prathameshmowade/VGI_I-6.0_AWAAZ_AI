import React, { useContext } from 'react';
import { Send, ExternalLink, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

export default function TelegramBotModal() {
  const { isHindi } = useContext(LanguageContext);
  const botUsername = 'awaaz_ai_civic_bot';
  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <div className="bg-sky-50/80 dark:bg-slate-900 border border-sky-200 dark:border-sky-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Send className="w-4 h-4 -translate-x-0.2 translate-y-0.2" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sky-950 dark:text-sky-100">
              {isHindi ? 'टेलीग्राम से भी शिकायत दर्ज कर सकते हैं' : 'Prefer Telegram? File complaints on the go'}
            </span>
            <span className="bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              @awaaz_ai_civic_bot
            </span>
          </div>
          <p className="text-[11px] text-sky-800 dark:text-slate-200 font-medium">
            {isHindi
              ? 'फोटो, वॉयस संदेश और जीपीएस लोकेशन सीधे हमारे बॉट पर भेजें।'
              : 'Send voice messages, live photos, and location directly through Telegram.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <span>{isHindi ? 'टेलीग्राम बॉट खोलें' : 'Open Telegram'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <Link
          to="/telegram-complaint"
          className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-sky-100/60 dark:hover:bg-slate-800 transition"
        >
          {isHindi ? 'वेब सिम्युलेटर' : 'Web Chat'}
        </Link>
      </div>
    </div>
  );
}
