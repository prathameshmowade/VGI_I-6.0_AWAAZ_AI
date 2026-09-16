const fs = require('fs');
const path = require('path');
const { taskQueue, JOB_TYPES } = require('../infrastructure/queue/taskQueue');
const { sendTelegramMessage } = require('./telegramService');
const { sendStatusUpdateSms } = require('./smsService');

const notificationsFilePath = path.join(__dirname, '../../data/notifications.json');

// ─── Persistence Helper Functions ───────────────────────────────────────────

const loadNotifications = () => {
  try {
    if (!fs.existsSync(notificationsFilePath)) {
      fs.writeFileSync(notificationsFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(notificationsFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[NotificationService] Error loading notifications:', err.message);
    return [];
  }
};

const saveNotifications = (notifications) => {
  try {
    fs.writeFileSync(notificationsFilePath, JSON.stringify(notifications, null, 2), 'utf8');
  } catch (err) {
    console.error('[NotificationService] Error saving notifications:', err.message);
  }
};

// ─── Dispatch Resolution Notification ────────────────────────────────────────

/**
 * Dispatch an official resolution notification to a citizen across all active channels
 * (In-App notification store, Telegram Bot, SMS/WhatsApp, and Background Queue).
 */
const dispatchResolutionNotification = async (complaint, options = {}) => {
  if (!complaint) return null;

  const compId = complaint.complaintId || complaint._id || 'CMP-UNKNOWN';
  const actorName = options.actorName || options.officerName || 'Municipal Officer';
  const actorRole = options.actorRole || 'officer';
  const proof = options.resolutionProof || options.completionProof || complaint.resolutionProof || complaint.completionProof || '';
  const notes = options.resolutionNotes || options.completionNotes || complaint.resolutionNotes || complaint.completionNotes || 'Work has been completed on site.';

  const notification = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: 'COMPLAINT_RESOLVED',
    complaintId: compId,
    title: `Grievance Resolved: ${complaint.title || 'Civic Issue'}`,
    message: `Your grievance regarding "${complaint.title || 'Civic Issue'}" (${complaint.category || 'General'}) has been resolved by Municipal Officer ${actorName}. Official photographic proof has been uploaded.`,
    citizenId: complaint.citizenId || null,
    citizenEmail: complaint.citizenEmail || null,
    citizenPhone: complaint.citizenPhone || complaint.mobile || null,
    citizenName: complaint.citizenName || 'Citizen',
    category: complaint.category || 'Road Damage',
    location: complaint.location || '',
    evidencePhoto: complaint.evidencePhoto || complaint.proof || '',
    resolutionProof: proof,
    resolutionNotes: notes,
    officerName: actorName,
    officerRole: actorRole,
    status: complaint.status || 'Resolved',
    read: false,
    createdAt: new Date().toISOString()
  };

  // 1. Save to Persistent In-App Store
  const list = loadNotifications();
  // Avoid duplicate resolution notification for same complaint within 10 seconds
  const recentDup = list.find(
    (n) => n.complaintId === compId && 
           n.type === 'COMPLAINT_RESOLVED' && 
           (Date.now() - new Date(n.createdAt).getTime()) < 10000
  );

  if (!recentDup) {
    list.unshift(notification);
    // Keep max 200 notifications in store
    if (list.length > 200) list.length = 200;
    saveNotifications(list);
  }

  // 2. Dispatch Telegram Alert if user filed via Telegram
  const telegramChatId = complaint.telegramChatId || complaint.chatId || complaint.telegram_chat_id;
  if (telegramChatId) {
    const telegramText = [
      `🎉 *Awaaz AI Grievance Resolved!*`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Ticket ID:* \`${compId}\``,
      `📍 *Location:* ${complaint.location || 'Reported Location'}`,
      `🏷️ *Category:* ${complaint.category || 'Civic Issue'}`,
      `👷 *Resolved By:* ${actorName}`,
      `📝 *Officer Notes:* ${notes}`,
      `✅ *Status:* Officially Resolved & Verified`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `_Thank you for helping make the city cleaner and safer!_`
    ].join('\n');

    try {
      await sendTelegramMessage(telegramChatId, telegramText);
      console.log(`[NotificationService] Sent Telegram resolution notification to chat ${telegramChatId}`);
    } catch (e) {
      console.warn(`[NotificationService] Telegram dispatch error:`, e.message);
    }
  }

  // 3. Dispatch SMS Alert if citizen provided phone
  const phone = complaint.citizenPhone || complaint.mobile;
  if (phone) {
    try {
      await sendStatusUpdateSms(phone, compId, 'Resolved', notes);
      console.log(`[NotificationService] Sent SMS resolution alert to ${phone}`);
    } catch (e) {
      console.warn(`[NotificationService] SMS dispatch error:`, e.message);
    }
  }

  // 4. Enqueue to Background Task Queue for Resilience & Analytics
  try {
    taskQueue.enqueue(JOB_TYPES.DISPATCH_NOTIFICATIONS, {
      recipient: complaint.citizenEmail || phone || 'in-app-citizen',
      channel: telegramChatId ? 'telegram' : (phone ? 'sms' : 'in-app'),
      complaintId: compId,
      message: notification.message
    });
  } catch (e) {}

  console.log(`[NotificationService] Dispatched resolution notification for ticket ${compId} to citizen: ${notification.citizenName}`);
  return notification;
};

// ─── Query & State Helpers ───────────────────────────────────────────────────

const getNotifications = (filter = {}) => {
  const all = loadNotifications();
  const { citizenId, citizenEmail, citizenPhone } = filter;

  if (!citizenId && !citizenEmail && !citizenPhone) {
    return all;
  }

  return all.filter((n) => {
    if (citizenId && n.citizenId && String(n.citizenId).toLowerCase() === String(citizenId).toLowerCase()) return true;
    if (citizenEmail && n.citizenEmail && String(n.citizenEmail).toLowerCase() === String(citizenEmail).toLowerCase()) return true;
    if (citizenPhone && n.citizenPhone && String(n.citizenPhone) === String(citizenPhone)) return true;
    // Also include notifications that don't have a specific citizen assigned (broadcast or demo)
    return !n.citizenId && !n.citizenEmail;
  });
};

const markAsRead = (id) => {
  const all = loadNotifications();
  let found = false;
  const updated = all.map((n) => {
    if (n.id === id) {
      found = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (found) saveNotifications(updated);
  return found;
};

const markAllAsRead = (filter = {}) => {
  const all = loadNotifications();
  const { citizenId, citizenEmail } = filter;
  const updated = all.map((n) => {
    let match = true;
    if (citizenId && n.citizenId && String(n.citizenId) !== String(citizenId)) match = false;
    if (citizenEmail && n.citizenEmail && String(n.citizenEmail).toLowerCase() !== String(citizenEmail).toLowerCase()) match = false;
    return match ? { ...n, read: true } : n;
  });
  saveNotifications(updated);
  return true;
};

// ─── Legacy compatibility stubs ──────────────────────────────────────────────
const sendSMS = (phone, msg) => {
  console.log(`[SMS] To ${phone}: ${msg}`);
  return true;
};

const sendEmail = (email, subject, body) => {
  console.log(`[Email] To ${email}: ${subject}`);
  return true;
};

module.exports = {
  loadNotifications,
  saveNotifications,
  dispatchResolutionNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendSMS,
  sendEmail
};
