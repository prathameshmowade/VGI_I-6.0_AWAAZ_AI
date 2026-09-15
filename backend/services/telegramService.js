const axios = require('axios');
const env = require('../config/env');
const { classifyComplaintLocally } = require('./aiService');

const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * Send a message to a Telegram chat via the Telegram Bot API.
 * In demo mode (no token), gracefully logs and returns success.
 */
const sendTelegramMessage = async (chatId, text, options = {}) => {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token || token.startsWith('your_')) {
    console.info(`[Telegram Bot (Demo)] Message to Chat ${chatId}:\n${text}`);
    return { success: true, demo: true };
  }

  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: options.parse_mode || 'Markdown',
      disable_web_page_preview: options.disable_web_page_preview || false,
      ...options
    };

    const response = await axios.post(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, payload, {
      timeout: 5000
    });

    return { success: true, data: response.data };
  } catch (err) {
    console.error('[Telegram Service] Error sending message:', err.response?.data || err.message);
    return { success: false, error: err.response?.data?.description || err.message };
  }
};

/**
 * Parse an incoming Telegram message into a complaint-ready structure.
 * Supports text messages, photo captions, and shared locations.
 */
const parseTelegramToComplaint = (message) => {
  const text = (message.text || message.caption || '').trim();
  const from = message.from || {};
  const chat = message.chat || {};
  const location = message.location || null;

  if (!text && !location && !message.photo) {
    return {
      error: true,
      message: 'Empty Telegram message received. Please provide a description or photo of the issue.'
    };
  }

  // Sender details
  const senderName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Citizen';
  const username = from.username ? `@${from.username}` : senderName;
  const chatId = String(chat.id || from.id || 'demo_chat');

  // Title extraction: First sentence or first 60 characters
  let title = '';
  if (text) {
    const firstSentenceEnd = text.search(/[.!?।\n]/);
    title = firstSentenceEnd > 0 && firstSentenceEnd < 60
      ? text.substring(0, firstSentenceEnd + 1).trim()
      : text.substring(0, 60).trim() + (text.length > 60 ? '...' : '');
  } else if (location) {
    title = `Civic Issue reported at GPS (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`;
  } else {
    title = 'Photo Evidence Civic Issue';
  }

  const description = text || (location ? `Civic issue reported at GPS Coordinates: ${location.latitude}, ${location.longitude}` : 'Photo evidence submitted without description.');

  // AI Classification
  const aiResult = classifyComplaintLocally({
    title,
    description,
    category: null,
    customCategory: null
  });

  // Extract location data if available
  let locationData = {
    address: 'Laxmi Nagar, Nagpur (Reported via Telegram)',
    lat: 21.1458,
    lng: 79.0882
  };

  if (location) {
    locationData = {
      address: `GPS: ${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E (Shared via Telegram)`,
      lat: location.latitude,
      lng: location.longitude
    };
  }

  // Photo URL if provided in update
  let photoUrl = '';
  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    // Pick highest resolution photo
    const bestPhoto = message.photo[message.photo.length - 1];
    photoUrl = bestPhoto.file_id ? `telegram://${bestPhoto.file_id}` : '';
  }

  return {
    error: false,
    title,
    description,
    category: aiResult.category,
    department: aiResult.department,
    departmentCode: aiResult.departmentCode,
    urgency: aiResult.urgency,
    confidenceScore: aiResult.confidenceScore,
    isAutoClassified: true,
    xaiReasoning: aiResult.xaiReasoning,
    source: 'telegram',
    citizenPhone: username,
    telegramChatId: chatId,
    telegramUsername: username,
    telegramMessageId: String(message.message_id || Date.now()),
    location: locationData,
    photoUrl,
    language: detectLanguage(description)
  };
};

/**
 * Detect language of the incoming message
 */
const detectLanguage = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
};

/**
 * Format registration confirmation reply for Telegram
 */
const formatComplaintConfirmation = (complaint, baseUrl = 'http://localhost:3000') => {
  const isHi = complaint.language === 'hi';
  const trackingUrl = `${baseUrl}/complaint/${complaint.complaintId}`;

  if (isHi) {
    return `🏛️ *आवाज़ एआई — शिकायत सफलतापूर्वक दर्ज हुई!*

📋 *शिकायत आईडी:* \`${complaint.complaintId}\`
📌 *विषय:* ${complaint.title}
📁 *श्रेणी:* ${complaint.category} (एआई सटीकता: ${complaint.confidenceScore}%)
🏢 *विभाग:* ${complaint.department}
⚡ *प्राथमिकता:* ${complaint.urgency}
⏱️ *समाधान समय (SLA):* 48 घंटे

🔗 *लाइव प्रगति ट्रैक करें:*
${trackingUrl}

_हर आवाज़ सुनी जाएगी • Awaaz.ai नगर निगम निवारण_`;
  }

  return `🏛️ *Awaaz AI — Civic Complaint Registered!*

📋 *Tracking ID:* \`${complaint.complaintId}\`
📌 *Title:* ${complaint.title}
📁 *Category:* ${complaint.category} (${complaint.confidenceScore}% AI Confidence)
🏢 *Assigned Dept:* ${complaint.department}
⚡ *Urgency:* ${complaint.urgency}
⏱️ *Resolution SLA:* 48 Hours

🔗 *Track Real-time Progress:*
${trackingUrl}

_Every Voice Heard • Municipal Redressal Platform_`;
};

/**
 * Format status lookup reply for Telegram
 */
const formatStatusReply = (complaint, baseUrl = 'http://localhost:3000') => {
  if (!complaint) {
    return `❌ *Awaaz AI: Complaint Not Found*
Please check your tracking ID format (e.g., \`CMP-2026-001\`).`;
  }

  const trackingUrl = `${baseUrl}/complaint/${complaint.complaintId}`;
  return `📋 *Civic Complaint Status*

🆔 *ID:* \`${complaint.complaintId}\`
📌 *Title:* ${complaint.title}
📁 *Category:* ${complaint.category}
🏢 *Department:* ${complaint.department || 'Roads & Infrastructure'}
🚦 *Status:* *${complaint.status}*
⏱️ *SLA Remaining:* ${complaint.slaHoursRemaining || 48} hrs
🛡️ *Blockchain Audit:* \`${(complaint.blockchainHash || '0x4f8e...3c12').substring(0, 16)}...\`

🔗 *View Full Dossier:*
${trackingUrl}`;
};

/**
 * Format welcome/tutorial message for /start or /help
 */
const formatWelcomeMessage = () => {
  return `🏛️ *Welcome to Awaaz AI Civic Bot!*
_Every Voice Heard • Instant Municipal Redressal_

You can report civic complaints in your city directly from Telegram with zero app downloads!

👉 *How to report:*
• Simply send a message describing the issue:
  _"Pothole on Laxmi Nagar main road near metro pillar 42"_
• Or send a photo with a caption describing the problem.
• You can also share your live GPS location for automatic geotagging!

👉 *Useful Commands:*
• \`/status CMP-2026-001\` — Track the status of your complaint
• \`/help\` — View this guide

_Type your issue below to register your complaint now:_ 👇`;
};

module.exports = {
  sendTelegramMessage,
  parseTelegramToComplaint,
  formatComplaintConfirmation,
  formatStatusReply,
  formatWelcomeMessage
};
