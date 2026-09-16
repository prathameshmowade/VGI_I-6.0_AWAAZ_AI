import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import {
  Home,
  FileEdit,
  LayoutDashboard,
  Building2,
  BarChart3,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  MessageSquare,
  Phone,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Send
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { t, isHindi } = useContext(LanguageContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [channelsDropdownOpen, setChannelsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isChannelActive = isActive('/sms-complaint') || isActive('/call-complaint') || isActive('/telegram-complaint');

  // Close menus on outside click or route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setChannelsDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setChannelsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Animated Multi-Color Top Accent Bar */}
      <div className="rainbow-strip h-[3.5px] w-full sticky top-0 z-50 shadow-xs"></div>

      {/* Top Header Navbar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-[3.5px] z-40 px-3 sm:px-4 lg:px-6 py-2.5 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Left Area on Mobile / Desktop */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 3-Line Hamburger Button (Visible only on mobile/tablet < 1200px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="navbar-mobile-toggle p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 active:scale-95"
              aria-label="Open mobile navigation menu"
              title="Open Menu"
            >
              <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </button>

            {/* Brand Logo with Multi-Color Text */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="p-1 bg-white rounded-xl shadow-xs border border-slate-100">
                <img src="/logo.png" alt="awaaz.ai logo" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight flex items-center gap-0.5">
                  <span className="text-blue-600 dark:text-blue-400">awaaz</span>
                  <span className="text-purple-600 dark:text-purple-400 font-black">.ai</span>
                </span>
                {/* Slogan visible on sm+ screens */}
                <span className="hidden sm:block text-[9.5px] font-bold tracking-wide text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[140px] md:max-w-none">
                  {t('brand_slogan')}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (>= 1200px) */}
          <div className="navbar-desktop items-center gap-1 xl:gap-1.5 text-xs font-semibold shrink-0">
            {/* Overview Link */}
            <Link
              to="/overview"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/overview') || isActive('/')
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800 shadow-xs'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{t('nav_overview')}</span>
            </Link>

            {/* Resident Citizen Portal */}
            {(!user || user.role === 'citizen' || user.role === 'resident') && (
              <Link
                to="/citizen"
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/citizen')
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-800 shadow-xs'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{t('nav_citizen')}</span>
              </Link>
            )}

            {/* Officer Dashboard */}
            {user && (user.role === 'officer' || user.role === 'admin') && (
              <Link
                to="/officer"
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/officer')
                    ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 shadow-xs'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{t('nav_officer')}</span>
              </Link>
            )}

            {/* Digital Twin */}
            <Link
              to="/digital-twin"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/digital-twin')
                  ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-xs'
                  : 'text-slate-700 hover:text-purple-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{t('nav_digital_twin')}</span>
            </Link>

            {/* Analytics (Officer & Admin Only) */}
            {user && (user.role === 'officer' || user.role === 'admin') && (
              <Link
                to="/analytics"
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/analytics')
                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-800 shadow-xs'
                    : 'text-slate-700 hover:text-teal-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{t('nav_analytics')}</span>
              </Link>
            )}

            {/* Direct Intake Channels Dropdown (SMS & Call) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setChannelsDropdownOpen(!channelsDropdownOpen)}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isChannelActive
                    ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 shadow-xs'
                    : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{isHindi ? 'हेल्पलाइन चैनल' : 'Helpline Channels'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${channelsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {channelsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    to="/sms-complaint"
                    onClick={() => setChannelsDropdownOpen(false)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                      isActive('/sms-complaint')
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{t('nav_sms_complaint')}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block leading-tight">
                        {isHindi ? 'बिना इंटरनेट SMS से शिकायत' : 'Zero-app text SMS reporting'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/call-complaint"
                    onClick={() => setChannelsDropdownOpen(false)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                      isActive('/call-complaint')
                        ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{t('nav_call_complaint')}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block leading-tight">
                        {isHindi ? '24/7 वॉयस IVR हेल्पलाइन' : '24/7 Voice IVR helpline'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/telegram-complaint"
                    onClick={() => setChannelsDropdownOpen(false)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                      isActive('/telegram-complaint')
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-900 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-[#2AABEE] dark:text-sky-300 shrink-0 mt-0.5">
                      <Send className="w-3.5 h-3.5 -translate-x-0.2 translate-y-0.2" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block flex items-center gap-1.5">
                        <span>{isHindi ? 'टेलीग्राम बॉट' : 'Telegram Civic Bot'}</span>
                        <span className="text-[9px] bg-[#2AABEE] text-white px-1.5 py-0.2 rounded font-bold uppercase">New</span>
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block leading-tight">
                        {isHindi ? 'टेलीग्राम से सीधी शिकायत' : 'Direct Telegram messaging'}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Right Controls (Language + Theme + User/Login) */}
            <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200 dark:border-slate-800 ml-1">
              <LanguageToggle />
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-1.5">
                  <div className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 max-w-[140px] truncate" title={user.name}>
                    <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{user.name.split(' ')[0]}</span>
                    <span className="text-[9px] bg-indigo-200 dark:bg-indigo-800 text-indigo-950 dark:text-indigo-100 px-1 py-0.2 rounded font-mono uppercase">
                      {user.role === 'officer' || user.role === 'admin' ? 'OFF' : 'CIT'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                    title={t('auth_logout')}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary text-xs py-1.5 px-3.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('auth_signin')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Controls for Mobile Screen (< 1200px) */}
          <div className="flex items-center gap-1.5 navbar-mobile-toggle">
            <LanguageToggle />
            <ThemeToggle />

            {user ? (
              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 transition"
                title={t('auth_logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-[11px] py-1.5 px-2.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('auth_signin')}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE / TABLET SLIDEOUT DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between p-5 z-50 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="awaaz.ai logo" className="h-7 w-auto object-contain" />
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    <span className="text-blue-600">awaaz</span>
                    <span className="text-purple-600 font-extrabold">.ai</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links Group */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-3 mb-1">
                  Menu & Portals
                </span>

                <Link
                  to="/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                    isActive('/overview') || isActive('/')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span>{t('nav_overview')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {(!user || user.role === 'citizen' || user.role === 'resident') && (
                  <Link
                    to="/citizen"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                      isActive('/citizen')
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileEdit className="w-4 h-4 text-indigo-600" />
                      <span>{t('nav_citizen')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                )}

                {user && (user.role === 'officer' || user.role === 'admin') && (
                  <Link
                    to="/officer"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                      isActive('/officer')
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-amber-600" />
                      <span>{t('nav_officer')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                )}

                <Link
                  to="/digital-twin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                    isActive('/digital-twin')
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>{t('nav_digital_twin')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {user && (user.role === 'officer' || user.role === 'admin') && (
                  <Link
                    to="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                      isActive('/analytics')
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      <span>{t('nav_analytics')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                )}
              </div>

              {/* Direct Offline Channels */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-3 mb-1">
                  Offline & Phone Channels
                </span>

                <Link
                  to="/sms-complaint"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive('/sms-complaint')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>{t('nav_sms_complaint')}</span>
                  </div>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">SMS</span>
                </Link>

                <Link
                  to="/call-complaint"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive('/call-complaint')
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-rose-600" />
                    <span>{t('nav_call_complaint')}</span>
                  </div>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">IVR</span>
                </Link>

                <Link
                  to="/telegram-complaint"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive('/telegram-complaint')
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-[#2AABEE]" />
                    <span>{isHindi ? 'टेलीग्राम बॉट' : 'Telegram Civic Bot'}</span>
                  </div>
                  <span className="text-[9px] bg-[#2AABEE] text-white px-1.5 py-0.5 rounded font-bold">NEW</span>
                </Link>
              </div>
            </div>

            {/* User Details / Sign-In Bottom Box */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('auth_logout')}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary text-xs py-2.5 justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('auth_signin')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
