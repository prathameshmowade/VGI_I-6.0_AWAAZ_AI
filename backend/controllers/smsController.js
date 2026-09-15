const fs = require('fs');
const path = require('path');
const { parseSmsToComplaint, sendConfirmationSms, generateTwimlSmsReply } = require('../services/smsService');
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
 * Handle incoming SMS from Twilio webhook.
 * POST /api/sms/incoming
 * Twilio sends: Body, From, To, MessageSid, etc.
 */
const handleIncomingSms = async (req, res) => {
  try {
    const smsBody = req.body.Body || req.body.body || '';
    const fromNumber = req.body.From || req.body.from || '+919876543210';
    const messageSid = req.body.MessageSid || req.body.messageSid || `DEMO-${Date.now()}`;

    console.log(`[SMS INCOMING] From: ${fromNumber} | Body: "${smsBody}" | SID: ${messageSid}`);

    // Parse and classify the SMS
    const parsed = parseSmsToComplaint(smsBody, fromNumber);
    if (parsed.error) {
      const errorReply = generateTwimlSmsReply('❌ Awaaz AI: Your message was empty. Please send your complaint description via SMS.');
      res.set('Content-Type', 'text/xml');
      return res.send(errorReply);
    }

    // Generate complaint ID
    const store = loadDatabase();
    const newId = `CMP-2026-${String(store.length + 1).padStart(3, '0')}`;

    // Audit hash
    const auditRecord = recordAuditEvent({
      complaintId: newId,
      title: parsed.title,
      description: parsed.description,
      source: 'sms',
      timestamp: new Date().toISOString()
    });

    // Build complaint record
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
      source: 'sms',
      citizenPhone: fromNumber,
      messageSid: messageSid,
      confidenceScore: parsed.confidenceScore,
      isAutoClassified: parsed.isAutoClassified,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: false,
      blockchainHash: auditRecord.hash,
      language: parsed.language,
      xaiData: {
        confidence: parsed.confidenceScore,
        reasoning: parsed.xaiReasoning,
        rulesApplied: ['SMS Auto-Classification Protocol', 'Municipal Service Routing Protocol'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      },
      xaiExplanation: {
        confidence: parsed.confidenceScore,
        reasoning: parsed.xaiReasoning,
        rulesApplied: ['SMS Intake Zero-Friction Rule'],
        similarCases: ['CMP-2025-8891']
      },
      createdAt: new Date().toISOString()
    };

    // Save to JSON store
    store.unshift(newComplaint);
    saveDatabase(store);

    // Also save to localStorage-style sync (for Vercel)
    try {
      const Complaint = require('../models/Complaint');
      await Complaint.create(newComplaint);
    } catch (err) {}

    console.log(`[SMS] Complaint ${newId} created from SMS. Category: ${parsed.category} | Confidence: ${parsed.confidenceScore}%`);

    // Send confirmation SMS
    await sendConfirmationSms(fromNumber, newId, parsed.category);

    // Respond with TwiML for Twilio
    const replyMsg = `✅ Awaaz AI: Complaint registered!\n📋 ID: ${newId}\n📁 ${parsed.category}\n⏱️ SLA: 48hrs`;
    const twiml = generateTwimlSmsReply(replyMsg);

    res.set('Content-Type', 'text/xml');
    return res.send(twiml);
  } catch (err) {
    console.error('[SMS] Error handling incoming SMS:', err);
    const errorTwiml = generateTwimlSmsReply('❌ Awaaz AI: Server error processing your complaint. Please try again.');
    res.set('Content-Type', 'text/xml');
    return res.status(500).send(errorTwiml);
  }
};

/**
 * Demo/Simulation endpoint for frontend SMS simulator.
 * POST /api/sms/simulate
 */
const simulateSms = async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a complaint message.' });
    }

    const fromNumber = phoneNumber || '+919876543210';
    const parsed = parseSmsToComplaint(message, fromNumber);
    if (parsed.error) {
      return res.status(400).json({ success: false, error: parsed.message });
    }

    const store = loadDatabase();
    const newId = `CMP-2026-${String(store.length + 1).padStart(3, '0')}`;

    const auditRecord = recordAuditEvent({
      complaintId: newId,
      title: parsed.title,
      description: parsed.description,
      source: 'sms',
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
      source: 'sms',
      citizenPhone: fromNumber,
      confidenceScore: parsed.confidenceScore,
      isAutoClassified: true,
      slaHoursTotal: 48,
      slaHoursRemaining: 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: false,
      blockchainHash: auditRecord.hash,
      language: parsed.language,
      xaiData: {
        confidence: parsed.confidenceScore,
        reasoning: parsed.xaiReasoning,
        rulesApplied: ['SMS Simulation Protocol'],
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

    console.log(`[SMS SIM] Complaint ${newId} created via simulation.`);

    return res.status(201).json({
      success: true,
      message: `Complaint registered via SMS! Tracking ID: ${newId}`,
      data: newComplaint,
      confirmation: `✅ Awaaz AI: Your complaint "${parsed.title}" has been registered as ${newId}. Category: ${parsed.category}. SLA: 48 hours.`
    });
  } catch (err) {
    console.error('[SMS SIM] Error:', err);
    return res.status(500).json({ success: false, error: 'Server error during SMS simulation.' });
  }
};

/**
 * Get all SMS-originated complaints.
 * GET /api/sms/complaints
 */
const getSmsComplaints = async (req, res) => {
  try {
    const store = loadDatabase();
    const smsComplaints = store.filter(c => c.source === 'sms');
    return res.json({ success: true, count: smsComplaints.length, data: smsComplaints });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error fetching SMS complaints' });
  }
};

module.exports = { handleIncomingSms, simulateSms, getSmsComplaints };
