const fs = require('fs');
const path = require('path');
const { generateIncomingCallTwiml, generateRecordingCompleteTwiml, processCallTranscription } = require('../services/callService');
const { sendConfirmationSms } = require('../services/smsService');
const { recordAuditEvent } = require('../services/blockchainService');

const dataFilePath = path.join(__dirname, '../../data/sample_complaints.json');

const loadDatabase = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }
  } catch (err) {}
  return [];
};

const saveDatabase = (complaints) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(complaints, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving to database file:', err);
  }
};

/**
 * Handle incoming phone call from Twilio webhook.
 * POST /api/call/incoming
 * Responds with TwiML that greets the caller and starts recording.
 */
const handleIncomingCall = (req, res) => {
  try {
    const callerNumber = req.body.From || req.body.from || 'Unknown';
    const callSid = req.body.CallSid || req.body.callSid || `DEMO-${Date.now()}`;

    console.log(`[CALL INCOMING] From: ${callerNumber} | CallSid: ${callSid}`);

    // Determine webhook base URL
    const webhookBaseUrl = process.env.TWILIO_WEBHOOK_BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    const twiml = generateIncomingCallTwiml(webhookBaseUrl);

    res.set('Content-Type', 'text/xml');
    return res.send(twiml);
  } catch (err) {
    console.error('[CALL] Error handling incoming call:', err);
    res.set('Content-Type', 'text/xml');
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We are experiencing technical difficulties. Please try again later.</Say>
</Response>`);
  }
};

/**
 * Handle recording completion callback from Twilio.
 * POST /api/call/recording
 * Twilio sends: RecordingUrl, RecordingSid, RecordingDuration, etc.
 */
const handleCallRecording = async (req, res) => {
  try {
    const callerNumber = req.body.From || req.body.from || 'Unknown';
    const recordingUrl = req.body.RecordingUrl || req.body.recordingUrl || '';
    const recordingSid = req.body.RecordingSid || req.body.recordingSid || '';
    const recordingDuration = req.body.RecordingDuration || req.body.recordingDuration || '0';

    console.log(`[CALL RECORDING] From: ${callerNumber} | Duration: ${recordingDuration}s | URL: ${recordingUrl}`);

    // Generate a pending complaint (full complaint is created when transcription arrives)
    const store = loadDatabase();
    const newId = `CMP-2026-${String(store.length + 1).padStart(3, '0')}`;

    const pendingComplaint = {
      complaintId: newId,
      _id: newId,
      title: 'Voice Call Complaint (Transcription Pending)',
      description: `Voice recording received. Duration: ${recordingDuration} seconds. Transcription in progress.`,
      category: 'Pending Classification',
      urgency: 'High Priority',
      status: 'New',
      source: 'call',
      citizenPhone: callerNumber,
      recordingUrl: recordingUrl,
      recordingSid: recordingSid,
      recordingDuration: parseInt(recordingDuration, 10),
      confidenceScore: 0,
      isAutoClassified: false,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: false,
      blockchainHash: recordAuditEvent({ complaintId: newId, source: 'call', timestamp: new Date().toISOString() }).hash,
      xaiData: {
        confidence: 0,
        reasoning: ['Voice call recording received', 'Awaiting AI transcription and classification'],
        rulesApplied: ['Call-to-Complaint Intake Protocol'],
        similarCases: []
      },
      createdAt: new Date().toISOString()
    };

    store.unshift(pendingComplaint);
    saveDatabase(store);

    try {
      const Complaint = require('../models/Complaint');
      await Complaint.create(pendingComplaint);
    } catch (err) {}

    console.log(`[CALL] Pending complaint ${newId} created from call recording.`);

    // Respond with confirmation TwiML
    const twiml = generateRecordingCompleteTwiml(newId);
    res.set('Content-Type', 'text/xml');
    return res.send(twiml);
  } catch (err) {
    console.error('[CALL] Error handling recording:', err);
    res.set('Content-Type', 'text/xml');
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>There was an error processing your recording. Please try again.</Say>
</Response>`);
  }
};

/**
 * Handle transcription callback from Twilio.
 * POST /api/call/transcription
 * Twilio sends: TranscriptionText, TranscriptionSid, RecordingSid, etc.
 */
const handleCallTranscription = async (req, res) => {
  try {
    const transcriptionText = req.body.TranscriptionText || req.body.transcriptionText || '';
    const recordingSid = req.body.RecordingSid || req.body.recordingSid || '';
    const callerNumber = req.body.From || req.body.from || '';

    console.log(`[CALL TRANSCRIPTION] Text: "${transcriptionText}" | RecordingSid: ${recordingSid}`);

    if (!transcriptionText.trim()) {
      return res.json({ success: false, message: 'Empty transcription' });
    }

    // Find the pending complaint by recordingSid and update it
    const store = loadDatabase();
    let existingComplaint = store.find(c => c.recordingSid === recordingSid && c.source === 'call');

    if (existingComplaint) {
      // Classify the transcription
      const classified = processCallTranscription(transcriptionText, callerNumber || existingComplaint.citizenPhone);

      // Update the existing complaint with classified data
      existingComplaint.title = classified.title;
      existingComplaint.description = classified.description;
      existingComplaint.category = classified.category;
      existingComplaint.department = classified.department;
      existingComplaint.departmentCode = classified.departmentCode;
      existingComplaint.urgency = classified.urgency;
      existingComplaint.confidenceScore = classified.confidenceScore;
      existingComplaint.isAutoClassified = true;
      existingComplaint.language = classified.language;
      existingComplaint.xaiData = {
        confidence: classified.confidenceScore,
        reasoning: classified.xaiReasoning,
        rulesApplied: ['Call Transcription AI Classification', 'Municipal Service Routing Protocol'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      };

      saveDatabase(store);

      // Send SMS confirmation
      if (existingComplaint.citizenPhone) {
        await sendConfirmationSms(existingComplaint.citizenPhone, existingComplaint.complaintId, classified.category);
      }

      console.log(`[CALL] Complaint ${existingComplaint.complaintId} updated with transcription. Category: ${classified.category}`);
    }

    return res.json({ success: true, message: 'Transcription processed' });
  } catch (err) {
    console.error('[CALL] Error handling transcription:', err);
    return res.status(500).json({ success: false, error: 'Error processing transcription' });
  }
};

/**
 * Demo/Simulation endpoint for frontend call simulator.
 * POST /api/call/simulate
 */
const simulateCall = async (req, res) => {
  try {
    const { transcription, phoneNumber } = req.body;
    if (!transcription || !transcription.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a complaint transcription.' });
    }

    const fromNumber = phoneNumber || '+919876543210';
    const classified = processCallTranscription(transcription, fromNumber);
    if (classified.error) {
      return res.status(400).json({ success: false, error: classified.message });
    }

    const store = loadDatabase();
    const newId = `CMP-2026-${String(store.length + 1).padStart(3, '0')}`;

    const auditRecord = recordAuditEvent({
      complaintId: newId,
      title: classified.title,
      description: classified.description,
      source: 'call',
      timestamp: new Date().toISOString()
    });

    const newComplaint = {
      complaintId: newId,
      _id: newId,
      title: classified.title,
      description: classified.description,
      category: classified.category,
      department: classified.department,
      departmentCode: classified.departmentCode,
      urgency: classified.urgency,
      status: 'New',
      source: 'call',
      citizenPhone: fromNumber,
      confidenceScore: classified.confidenceScore,
      isAutoClassified: true,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: false,
      blockchainHash: auditRecord.hash,
      language: classified.language,
      xaiData: {
        confidence: classified.confidenceScore,
        reasoning: classified.xaiReasoning,
        rulesApplied: ['Call Simulation Protocol'],
        similarCases: ['CMP-2025-8891']
      },
      createdAt: new Date().toISOString()
    };

    store.unshift(newComplaint);
    saveDatabase(store);

    try {
      const Complaint = require('../models/Complaint');
      await Complaint.create(newComplaint);
    } catch (err) {}

    console.log(`[CALL SIM] Complaint ${newId} created via call simulation.`);

    return res.status(201).json({
      success: true,
      message: `Complaint registered via call! Tracking ID: ${newId}`,
      data: newComplaint,
      confirmation: `✅ Awaaz AI: Your voice complaint has been registered as ${newId}. Category: ${classified.category}. SLA: 48 hours.`
    });
  } catch (err) {
    console.error('[CALL SIM] Error:', err);
    return res.status(500).json({ success: false, error: 'Server error during call simulation.' });
  }
};

/**
 * Get all call-originated complaints.
 * GET /api/call/complaints
 */
const getCallComplaints = async (req, res) => {
  try {
    const store = loadDatabase();
    const callComplaints = store.filter(c => c.source === 'call');
    return res.json({ success: true, count: callComplaints.length, data: callComplaints });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error fetching call complaints' });
  }
};

module.exports = {
  handleIncomingCall,
  handleCallRecording,
  handleCallTranscription,
  simulateCall,
  getCallComplaints
};
