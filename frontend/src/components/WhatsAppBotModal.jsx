import React, { useState } from 'react';

export default function WhatsAppBotModal() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Welcome to awaaz.ai WhatsApp Assistant! Type your issue or send a photo.' }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `🤖 Complaint Registered via WhatsApp! Ref Tracking ID: CMP-2026-WA${Math.floor(Math.random()*899)+100}. AI classified category as Road/Infra damage with 96% confidence.` }
      ]);
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold p-4 rounded-2xl transition shadow-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="text-2xl">💬</span>
          <div>
            <span className="block text-sm font-black">Innovation #5: WhatsApp Civic Assistant Bot</span>
            <span className="block text-xs text-emerald-200 font-normal">Click to open instant zero-app WhatsApp complaint simulator</span>
          </div>
        </div>
        <span className="bg-emerald-800 text-emerald-100 text-xs px-3 py-1.5 rounded-xl font-mono">
          {isOpen ? 'Close Bot' : 'Open WhatsApp Demo'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 font-mono">💬 WhatsApp Simulation Window</span>
            <span className="text-[10px] text-slate-400 font-mono">Simulated WhatsApp Web</span>
          </div>

          <div className="h-48 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Type complaint e.g. Water leak near Dharampeth..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl text-xs transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
