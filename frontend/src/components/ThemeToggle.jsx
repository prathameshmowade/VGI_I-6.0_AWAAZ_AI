import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark-theme');
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (dark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-theme');
        localStorage.setItem('civic_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-theme');
        localStorage.setItem('civic_theme', 'light');
      }
    } catch (e) {}
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className="p-1.5 px-2.5 rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {dark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
