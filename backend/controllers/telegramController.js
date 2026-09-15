const fs = require('fs');
const path = require('path');
const axios = require('axios');
const env = require('../config/env');
const {
  sendTelegramMessage,
  parseTelegramToComplaint,
  formatComplaintConfirmation,
  formatStatusReply,
  formatWelcomeMessage
} = require('../services/telegramService');
const { recordAuditEvent } = require('../services/blockchainService');

const dataFilePath = path.join(__dirname, '../../data/sample_complaints.json');

const loadDatabase = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading complaints database file:', err);
  }
  return [];
};

const saveDatabase = (complaints) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(complaints, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving to complaints database file:', err);
  }
};

/**
 * Handle incoming webhook update from Telegram Bot API.
 * POST /api/telegram/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const update = req.body;
    console.log('[Telegram Webhook] Received update:', JSON.stringify(update).substring(0, 150));

    // Telegram sends message under update.message or update.edited_message
    const message = update.message || update.edited_message;
    if (!message) {
      // Return 200 OK immediately for callbacks, inline queries, etc.
      return res.status(200).json({ ok: true, notice: 'No message object in update' });
    }

    const chatId = message.chat?.id;
    const text = (message.text || message.caption || '').trim();

    // 1. Check for commands
    if (text === '/start' || text === '/help') {
      const welcomeText = formatWelcomeMessage();
      await sendTelegramMessage(chatId, welcomeText);
      return res.status(200).json({ ok: true, action: 'welcome_sent' });
    }

    // 2. Check for /status command
    if (text.startsWith('/status')) {
      const parts = text.split(/\s+/);
      const queryId = parts[1]?.toUpperCase()?.trim();

      const store = loadDatabase();
      const matched = store.find(c => c.complaintId === queryId || c._id === queryId);

      const statusReply = formatStatusReply(matched);
      await sendTelegramMessage(chatId, statusReply);
      return res.status(200).json({ ok: true, action: 'status_replied', found: !!matched });
    }

    // 3. Process civic issue complaint
    const parsed = parseTelegramToComplaint(message);
    if (parsed.error) {
      await sendTelegramMessage(chatId, `❌ *Awaaz AI:* ${parsed.message}`);
      return res.status(200).json({ ok: true, error: parsed.message });
    }

    const store = loadDatabase();
    const newId = `CMP-2026-${String(store.length + 1).padStart(3, '0')}`;

    // Blockchain audit hash
    const auditRecord = recordAuditEvent({
      complaintId: newId,
      title: parsed.title,
      description: parsed.description,
      source: 'telegram',
      timestamp: new Date().toISOString()
    });

    const newComplaint = {
      complaintId: newId,
      _id: newId,
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      department: parsed.department,
      departmentCode: parsed.departmentCode,
      urgency: parsed.urgency,
      status: 'New',
      source: 'telegram',
      citizenPhone: parsed.citizenPhone,
      telegramChatId: parsed.telegramChatId,
      telegramUsername: parsed.telegramUsername,
      telegramMessageId: parsed.telegramMessageId,
      location: parsed.location,
      confidenceScore: parsed.confidenceScore,
      isAutoClassified: parsed.isAutoClassified,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: false,
      blockchainHash: auditRecord.hash,
      language: parsed.language,
      evidencePhotos: parsed.photoUrl ? [parsed.photoUrl] : [],
      priority_weight: 1,
      verification_status: 'NONE',
      verified_count: 0,
      rejected_count: 0,
      xaiData: {
        confidence: parsed.confidenceScore,
        reasoning: parsed.xaiReasoning,
        rulesApplied: ['Telegram Direct Message Protocol', 'NLP Semantic Department Router'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      },
      auditTimeline: [{
        event: 'Complaint Registered via Telegram',
        actor: parsed.telegramUsername,
        actorRole: 'Citizen',
        timestamp: new Date(),
        details: { chatId: parsed.telegramChatId, messageId: parsed.telegramMessageId },
        hash: auditRecord.hash
      }],
      createdAt: new Date().toISOString()
    };

    // Save to JSON database
    store.unshift(newComplaint);
    saveDatabase(store);

    // Save to MongoDB if connected
    try {
      const Complaint = require('../models/Complaint');
      await Complaint.create(newComplaint);
    } catch (dbErr) {}

    console.log(`[Telegram] Registered ${newId} from ${parsed.telegramUsername}: "${parsed.title}"`);

    // Send confirmation message back to citizen on Telegram
    const confirmationText = formatComplaintConfirmation(newComplaint);
    await sendTelegramMessage(chatId, confirmationText);

    return res.status(200).json({
      ok: true,
      complaintId: newId,
      category: parsed.category,
      department: parsed.department
    });
  } catch (err) {
    console.error('[Telegram Webhook Error]:', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
};

/**
 * Simulate receiving a message from Telegram (for testing and demo simulator).
 * POST /api/telegram/simulate
 */
const simulateTelegramMessage = async (req, res) => {
  try {
    const { text, username, chatId, location } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required.' });
    }

    const mockMessage = {
      message_id: Math.floor(Math.random() * 90000) + 10000,
      from: {
        id: chatId || 98765432,
        first_name: username ? username.replace('@', '') : 'Nagpur',
        last_name: 'Citizen',
        username: username ? username.replace('@', '') : 'nagpur_citizen'
      },
      chat: {
        id: chatId || 98765432,
        type: 'private'
      },
      text: text.trim(),
      location: location || null,
      date: Math.floor(Date.now() / 1000)
    };

    // Check for /status command
    if (text.trim().startsWith('/status')) {
      const parts = text.trim().split(/\s+/);
      const queryId = parts[1]?.toUpperCase()?.trim();

      const store = loadDatabase();
      const matched = store.find(c => c.complaintId === queryId || c._id === queryId);
      const reply = formatStatusReply(matched);

      return res.json({
        success: true,
        action: 'status_lookup',
        reply,
        complaint: matched || null
      });
    }

    // Check for /start or /help
    if (text.trim() === '/start' || text.trim() === '/help') {
      const reply = formatWelcomeMessage();
      return res.json({
        success: true,
        action: 'welcome',
        reply
      });
    }

    // Parse into complaint
    const parsed = parseTelegramToComplaint(mockMessage);
    if (parsed.error) {
      return res.status(400).json({ success: false, error: parsed.message });
    }

    const store = loadDatabase();
    const newId = `CMP-2026-${String(store.length + 1).padStart(3, '0')}`;

    const auditRecord = recordAuditEvent({
      complaintId: newId,
      title: parsed.title,
      description: parsed.description,
      source: 'telegram',
      timestamp: new Date().toISOString()
    });

    const newComplaint = {
      complaintId: newId,
      _id: newId,
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      department: parsed.department,
      departmentCode: parsed.departmentCode,
      urgency: parsed.urgency,
      status: 'New',
      source: 'telegram',
      citizenPhone: parsed.citizenPhone,
      telegramChatId: parsed.telegramChatId,
      telegramUsername: parsed.telegramUsername,
      telegramMessageId: parsed.telegramMessageId,
      location: parsed.location,
      confidenceScore: parsed.confidenceScore,
      isAutoClassified: parsed.isAutoClassified,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: false,
      blockchainHash: auditRecord.hash,
      language: parsed.language,
      evidencePhotos: [],
      priority_weight: 1,
      verification_status: 'NONE',
      verified_count: 0,
      rejected_count: 0,
      xaiData: {
        confidence: parsed.confidenceScore,
        reasoning: parsed.xaiReasoning,
        rulesApplied: ['Telegram Direct Message Protocol', 'NLP Semantic Department Router'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      },
      auditTimeline: [{
        event: 'Complaint Registered via Telegram',
        actor: parsed.telegramUsername,
        actorRole: 'Citizen',
        timestamp: new Date(),
        details: { chatId: parsed.telegramChatId, messageId: parsed.telegramMessageId },
        hash: auditRecord.hash
      }],
      createdAt: new Date().toISOString()
    };

    store.unshift(newComplaint);
    saveDatabase(store);

    try {
      const Complaint = require('../models/Complaint');
      await Complaint.create(newComplaint);
    } catch (dbErr) {}

    const reply = formatComplaintConfirmation(newComplaint);

    return res.status(201).json({
      success: true,
      complaintId: newId,
      complaint: newComplaint,
      reply
    });
  } catch (err) {
    console.error('[Telegram Simulate Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get all complaints originated from Telegram
 * GET /api/telegram/complaints
 */
const getTelegramComplaints = async (req, res) => {
  try {
    const store = loadDatabase();
    const telegramComplaints = store.filter(c => c.source === 'telegram');
    return res.json({
      success: true,
      count: telegramComplaints.length,
      complaints: telegramComplaints
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get Telegram Bot Configuration & Status
 * GET /api/telegram/info
 */
const getTelegramBotInfo = async (req, res) => {
  const token = env.TELEGRAM_BOT_TOKEN;
  const configured = Boolean(token && !token.startsWith('your_'));

  let botUser = null;
  if (configured) {
    try {
      const resp = await axios.get(`https://api.telegram.org/bot${token}/getMe`, { timeout: 4000 });
      botUser = resp.data?.result || null;
    } catch (e) {}
  }

  return res.json({
    success: true,
    configured,
    botUsername: botUser ? `@${botUser.username}` : '@AwaazCivic_bot',
    botName: botUser ? botUser.first_name : 'Awaaz AI Municipal Bot',
    webhookEndpoint: `${req.protocol}://${req.get('host')}/api/telegram/webhook`,
    mode: configured ? 'live' : 'demo_simulator'
  });
};

/**
 * Setup/Register webhook with Telegram
 * POST /api/telegram/setup
 */
const setupTelegramWebhook = async (req, res) => {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token || token.startsWith('your_')) {
    return res.status(400).json({
      success: false,
      error: 'TELEGRAM_BOT_TOKEN not configured in backend/.env'
    });
  }

  const webhookUrl = req.body.webhookUrl || env.TELEGRAM_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid HTTPS webhookUrl (or set TELEGRAM_WEBHOOK_URL in .env)'
    });
  }

  try {
    const resp = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
      url: webhookUrl,
      drop_pending_updates: true
    });
    return res.json({ success: true, result: resp.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.response?.data?.description || err.message
    });
  }
};

module.exports = {
  handleWebhook,
  simulateTelegramMessage,
  getTelegramComplaints,
  getTelegramBotInfo,
  setupTelegramWebhook
};
