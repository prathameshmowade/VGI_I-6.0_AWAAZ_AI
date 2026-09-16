import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  Camera,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  ChevronRight,
  Volume2
} from 'lucide-react';
import CitizenResolutionModal from './CitizenResolutionModal';
import { LanguageContext } from '../context/LanguageContext';

export default function NotificationCenter({ user }) {
  const { isHindi } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeModalNotification, setActiveModalNotification] = useState(null);
  const [latestToast, setLatestToast] = useState(null);
  const dropdownRef = useRef(null);
  const prevIdsRef = useRef(new Set());

  const citizenId = user?.citizenId || user?.email || user?.id || '';

  // Request HTML5 Web Notification permission
  const requestBrowserNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const showBrowserNotification = (notif) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🎉 Awaaz AI: Complaint Resolved!', {
          body: `${notif.complaintId}: ${notif.title || 'Your civic issue'} has been officially resolved with photo proof.`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };

  // Fetch notifications from backend API
  const fetchNotifications = async () => {
    try {
      const url = citizenId ? `/api/notifications?citizenId=${encodeURIComponent(citizenId)}` : '/api/notifications';
      const res = await axios.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const list = res.data.data;
        
        // Detect newly arrived resolution notification to trigger toast & desktop push
        if (prevIdsRef.current.size > 0) {
          const newNotifs = list.filter((n) => !prevIdsRef.current.has(n.id) && n.type === 'COMPLAINT_RESOLVED');
          if (newNotifs.length > 0) {
            const newest = newNotifs[0];
            setLatestToast(newest);
            showBrowserNotification(newest);
          }
        }

        // Update known IDs
        prevIdsRef.current = new Set(list.map((n) => n.id));
        setNotifications(list);
      }
    } catch (err) {
      // Fallback: check local complaints for any resolved items
      try {
        const saved = localStorage.getItem('civic_officer_complaints');
        if (saved) {
          const parsed = JSON.parse(saved);
          const resolved = parsed.filter((c) => 
            c.status === 'Resolved' || c.status === 'Completed' || c.status === 'Verified & Resolved'
          );
          if (resolved.length > 0) {
            const mapped = resolved.map((c) => ({
              id: `local-notif-${c.complaintId || c._id}`,
              complaintId: c.complaintId || c._id,
              type: 'COMPLAINT_RESOLVED',
              title: c.title || 'Civic Issue',
              category: c.category || 'General',
              location: c.location || '',
              officerName: 'Municipal Officer',
              resolutionProof: c.resolutionProof || c.completionProof || c.completion_proof,
              resolutionNotes: c.resolutionNotes || c.completionNotes || c.completion_notes || 'Resolved on site.',
              evidencePhoto: c.evidencePhoto || c.proof,
              read: false,
              createdAt: c.createdAt || new Date().toISOString()
            }));
            setNotifications(mapped);
          }
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchNotifications();
    requestBrowserNotificationPermission();
    const timer = setInterval(fetchNotifications, 4000);
    return () => clearInterval(timer);
  }, [citizenId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (latestToast) {
      const timer = setTimeout(() => setLatestToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [latestToast]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await axios.patch(`/api/notifications/${id}/read`);
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', { citizenId });
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpenProof = (notif) => {
    handleMarkAsRead(notif.id);
    setActiveModalNotification(notif);
    setIsOpen(false);
    setLatestToast(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ─── Bell Icon Trigger Button ─── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center border border-slate-200 dark:border-slate-800 focus:outline-hidden"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-emerald-600 dark:text-emerald-400 animate-wiggle' : ''}`} />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Live Toast Alert (Pop-in when resolved) ─── */}
      {latestToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  🎉 Issue Resolved!
                </span>
                <button
                  type="button"
                  onClick={() => setLatestToast(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate mt-0.5">
                {latestToast.title || 'Complaint Resolved'}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                {latestToast.resolutionNotes || 'Official photo proof certified by municipal officer.'}
              </p>
              <button
                type="button"
                onClick={() => handleOpenProof(latestToast)}
                className="mt-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition"
              >
                <Camera className="w-3 h-3" />
                <span>{isHindi ? 'प्रमाण फोटो देखें' : 'View Resolution Proof'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notification Dropdown Panel ─── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-black text-slate-900 dark:text-white text-sm">
                {isHindi ? 'सूचनाएं' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} {isHindi ? 'नई' : 'new'}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isHindi ? 'सभी पढ़ी गईं' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isHindi ? 'कोई नई सूचना नहीं है' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isHindi 
                    ? 'जब आपकी शिकायत का समाधान होगा, तो यहां सूचना मिलेगी।'
                    : 'When your grievance is resolved, you will receive real-time notifications here.'}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleOpenProof(notif)}
                  className={`p-3.5 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer transition flex items-start gap-3 ${
                    !notif.read ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        {notif.complaintId}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.resolutionNotes || notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {isHindi ? 'प्रमाण फोटो देखें' : 'View Proof'}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tamper-Proof Citizen Resolution Audit</span>
            </span>
          </div>

        </div>
      )}

      {/* ─── Resolution Proof Inspection Modal ─── */}
      {activeModalNotification && (
        <CitizenResolutionModal
          notification={activeModalNotification}
          onClose={() => setActiveModalNotification(null)}
          onFeedback={(id, satisfied) => {
            console.log(`Citizen feedback on ${id}: satisfied=${satisfied}`);
          }}
        />
      )}
    </div>
  );
}
