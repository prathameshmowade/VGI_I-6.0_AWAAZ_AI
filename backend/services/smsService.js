const env = require('../config/env');
const { classifyComplaintLocally } = require('./aiService');

// Twilio client (lazy initialization — only if credentials are present)
let twilioClient = null;
const getTwilioClient = () => {
  if (twilioClient) return twilioClient;
  try {
    const twilio = require('twilio');
    if (env.TWILIO_API_KEY && env.TWILIO_API_SECRET && env.TWILIO_ACCOUNT_SID) {
      twilioClient = twilio(env.TWILIO_API_KEY, env.TWILIO_API_SECRET, {
        accountSid: env.TWILIO_ACCOUNT_SID
      });
      console.log('[SMS Service] Twilio client initialized via API Key & Secret');
      return twilioClient;
    } else if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && !env.TWILIO_ACCOUNT_SID.startsWith('your_')) {
      twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      console.log('[SMS Service] Twilio client initialized via Account SID & Auth Token');
      return twilioClient;
    }
  } catch (err) {
    console.warn('[SMS Service] Twilio SDK initialization notice:', err.message);
  }
  console.info('[SMS Service] Running in DEMO mode (no Twilio credentials configured)');
  return null;
};

/**
 * Parse an incoming SMS body into a complaint-ready object and classify it via AI.
 * @param {string} body - The SMS message text
 * @param {string} fromNumber - The sender's phone number (E.164 format)
 * @returns {object} - Classified complaint data
 */
const parseSmsToComplaint = (body, fromNumber) => {
  const trimmedBody = (body || '').trim();
  if (!trimmedBody) {
    return {
      error: true,
      message: 'Empty SMS body received'
    };
  }

  // Extract a title from the first sentence or first 60 characters
  const firstSentenceEnd = trimmedBody.search(/[.!?।]/);
  const title = firstSentenceEnd > 0 && firstSentenceEnd < 60
    ? trimmedBody.substring(0, firstSentenceEnd + 1)
    : trimmedBody.substring(0, 60) + (trimmedBody.length > 60 ? '...' : '');

  // Run through AI triage engine
  const aiResult = classifyComplaintLocally({
    title,
    description: trimmedBody,
    category: null,
    customCategory: null
  });

  return {
    error: false,
    title,
    description: trimmedBody,
    category: aiResult.category,
    department: aiResult.department,
    departmentCode: aiResult.departmentCode,
    urgency: aiResult.urgency,
    confidenceScore: aiResult.confidenceScore,
    isAutoClassified: true,
    xaiReasoning: aiResult.xaiReasoning,
    source: 'sms',
    citizenPhone: fromNumber,
    language: detectLanguage(trimmedBody)
  };
};

/**
 * Simple language detection based on character ranges.
 */
const detectLanguage = (text) => {
  // Devanagari Unicode range (Hindi/Marathi)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
};

/**
 * Send a confirmation SMS back to the citizen with their tracking ID.
 * Falls back to console log in demo mode.
 */
const sendConfirmationSms = async (toNumber, complaintId, category) => {
  const message = `✅ Awaaz AI: Your complaint has been registered!\n\n📋 Tracking ID: ${complaintId}\n📁 Category: ${category}\n⏱️ SLA: 48 hours\n\nTrack status at: awaaz.ai/complaint/${complaintId}\n\nHar Awaaz Suni Jayegi! 🏛️`;

  const client = getTwilioClient();
  if (client) {
    try {
      const result = await client.messages.create({
        body: message,
        from: env.TWILIO_PHONE_NUMBER,
        to: toNumber
      });
      console.log(`[SMS] Confirmation sent to ${toNumber}, SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (err) {
      console.error('[SMS] Failed to send confirmation:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Demo mode — just log
  console.log(`[SMS DEMO] Confirmation to ${toNumber}: ${message}`);
  return { success: true, demo: true, message };
};

/**
 * Send a status update SMS to the citizen.
 */
const sendStatusUpdateSms = async (toNumber, complaintId, newStatus) => {
  const message = `🔔 Awaaz AI Status Update\n\n📋 Ticket: ${complaintId}\n📌 New Status: ${newStatus}\n\nTrack: awaaz.ai/complaint/${complaintId}`;

  const client = getTwilioClient();
  if (client) {
    try {
      const result = await client.messages.create({
        body: message,
        from: env.TWILIO_PHONE_NUMBER,
        to: toNumber
      });
      return { success: true, sid: result.sid };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  console.log(`[SMS DEMO] Status update to ${toNumber}: ${message}`);
  return { success: true, demo: true };
};

/**
 * Generate TwiML response XML for replying to an incoming SMS.
 */
const generateTwimlSmsReply = (messageText) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${messageText}</Message>
</Response>`;
};

module.exports = {
  parseSmsToComplaint,
  sendConfirmationSms,
  sendStatusUpdateSms,
  generateTwimlSmsReply,
  detectLanguage,
  getTwilioClient
};
