const express = require('express');
const router = express.Router();
const {
  handleWebhook,
  simulateTelegramMessage,
  getTelegramComplaints,
  getTelegramBotInfo,
  setupTelegramWebhook
} = require('../controllers/telegramController');

// Telegram Bot API Webhook (POST from Telegram servers)
router.post('/webhook', handleWebhook);

// Simulator endpoint for testing and interactive web chat
router.post('/simulate', simulateTelegramMessage);

// Get all complaints submitted via Telegram
router.get('/complaints', getTelegramComplaints);

// Get bot status & webhook info
router.get('/info', getTelegramBotInfo);

// Setup / register webhook with Telegram Bot API
router.post('/setup', setupTelegramWebhook);

module.exports = router;
