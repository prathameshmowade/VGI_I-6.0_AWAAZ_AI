const express = require('express');
const router = express.Router();
const {
  handleIncomingCall,
  handleCallRecording,
  handleCallTranscription,
  simulateCall,
  getCallComplaints
} = require('../controllers/callController');

// Twilio voice webhook for incoming calls
router.post('/incoming', handleIncomingCall);

// Twilio callback after recording completes
router.post('/recording', handleCallRecording);

// Twilio callback with transcription text
router.post('/transcription', handleCallTranscription);

// Demo/simulation endpoint for frontend call simulator
router.post('/simulate', simulateCall);

// Get all call-originated complaints
router.get('/complaints', getCallComplaints);

module.exports = router;
