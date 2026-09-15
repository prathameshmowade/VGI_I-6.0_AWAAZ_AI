const express = require('express');
const router = express.Router();
const { handleIncomingSms, simulateSms, getSmsComplaints } = require('../controllers/smsController');

// Twilio webhook endpoint for incoming SMS
router.post('/incoming', handleIncomingSms);

// Demo/simulation endpoint for frontend SMS simulator
router.post('/simulate', simulateSms);

// Get all SMS-originated complaints
router.get('/complaints', getSmsComplaints);

module.exports = router;
