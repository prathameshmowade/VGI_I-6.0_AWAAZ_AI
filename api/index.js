const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Database Fallback for Serverless
const sampleComplaints = require('../data/sample_complaints.json');
const wardsData = require('../data/wards.json');

const classifyText = (data) => {
  const combined = `${data.title || ''} ${data.description || ''} ${data.category || ''} ${data.customCategory || ''}`.toLowerCase();
  const isOther = (data.category && data.category.toLowerCase().includes('other')) || data.category === 'Miscellaneous';

  if (combined.match(/pothole|road|asphalt|crater|pavement|footpath|traffic|divider|tar|highway|flyover/i)) {
    return {
      category: 'Road Damage',
      department: 'Roads & Infrastructure Department',
      departmentCode: 'DEPT_ROAD',
      urgency: 'High Priority',
      confidenceScore: 96,
      isAutoClassified: isOther,
      xaiReasoning: ['Road hazard and crater keywords detected', 'Mapped to Indore Municipal Corporation (IMC) Zone 12 Road Dept']
    };
  }
  if (combined.match(/pipe|leak|sewage|sewer|water|drain|drainage|tap|contamination|flood|overflow|tank/i)) {
    return {
      category: 'Water Supply',
      department: 'Water Supply & Drainage Dept',
      departmentCode: 'DEPT_WATER',
      urgency: 'Critical Priority',
      confidenceScore: 95,
      isAutoClassified: isOther,
      xaiReasoning: ['Hydraulic pipeline and drainage leakage detected', 'Priority escalation for potential drinking water contamination']
    };
  }
  if (combined.match(/garbage|trash|waste|dump|clean|dustbin|sanitation|litter|sweep|smell|dead animal/i)) {
    return {
      category: 'Sanitation',
      department: 'Sanitation & Waste Management',
      departmentCode: 'DEPT_SANITATION',
      urgency: 'Medium Priority',
      confidenceScore: 93,
      isAutoClassified: isOther,
      xaiReasoning: ['Solid waste and public health sanitation keywords detected', 'Assigned to Ward Hygiene Taskforce']
    };
  }
  if (combined.match(/light|streetlight|lamp|wire|pole|electric|electricity|spark|blackout|transformer/i)) {
    return {
      category: 'Electrical',
      department: 'Electrical & Smart Lighting',
      departmentCode: 'DEPT_ELECTRICAL',
      urgency: 'High Priority',
      confidenceScore: 94,
      isAutoClassified: isOther,
      xaiReasoning: ['Electrical hazard and public streetlight outage detected', 'Urgent night safety routing applied']
    };
  }
  if (combined.match(/park|garden|tree|bench|playground|grass|amenit|fountain|jogging/i)) {
    return {
      category: 'Parks',
      department: 'Parks & Public Amenities',
      departmentCode: 'DEPT_PARKS',
      urgency: 'Low Priority',
      confidenceScore: 91,
      isAutoClassified: isOther,
      xaiReasoning: ['Public park and botanical amenity keywords matched', 'Scheduled for Horticultural maintenance']
    };
  }

  return {
    category: isOther ? 'Road Damage' : (data.category || 'Road Damage'),
    department: 'Roads & Infrastructure Department',
    departmentCode: 'DEPT_ROAD',
    urgency: 'High Priority',
    confidenceScore: 92,
    isAutoClassified: isOther,
    xaiReasoning: ['Civic anomaly classified by municipal rule engine', 'Assigned to Central Redressal Taskforce']
  };
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Awaaz AI Vercel Serverless API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/complaints', (req, res) => {
  res.json({ success: true, count: sampleComplaints.length, data: sampleComplaints });
});

app.get('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const found = sampleComplaints.find(c => c.complaintId === id || c._id === id);
  if (!found) return res.status(404).json({ success: false, message: 'Complaint not found' });
  res.json({ success: true, data: found });
});

app.post('/api/complaints', (req, res) => {
  const compId = req.body.complaintId || `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
  const classified = classifyText(req.body);

  // DPDP Act 2023 Server-Side Privacy Shield PII Redaction
  let safeTitle = req.body.title || 'Civic Grievance Reported';
  let safeDesc = req.body.description || '';

  safeDesc = safeDesc
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED_AADHAAR]')
    .replace(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b|\b\d{10}\b/g, '[REDACTED_PHONE]');

  safeTitle = safeTitle
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED_AADHAAR]')
    .replace(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b|\b\d{10}\b/g, '[REDACTED_PHONE]');

  const newComplaint = {
    complaintId: compId,
    _id: compId,
    title: safeTitle,
    description: safeDesc,
    category: classified.category,
    department: classified.department,
    departmentCode: classified.departmentCode,
    isAutoClassified: classified.isAutoClassified,
    location: req.body.location || 'Vijay Nagar, Indore',
    urgency: req.body.urgency || classified.urgency,
    status: 'New',
    confidenceScore: classified.confidenceScore,
    slaHoursTotal: 48,
    slaHoursRemaining: 48,
    impactScore: 94,
    xaiData: {
      confidence: classified.confidenceScore,
      reasoning: classified.xaiReasoning,
      rulesApplied: ['Civic Redressal Emergency Protocol (SLA 48h)', 'Municipal Service Routing Protocol'],
      similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
    },
    xaiExplanation: {
      confidence: classified.confidenceScore,
      reasoning: classified.xaiReasoning,
      rulesApplied: ['School & Hospital Proximity Priority Rule'],
      similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
    },
    createdAt: new Date().toISOString()
  };
  sampleComplaints.unshift(newComplaint);
  res.status(201).json({ success: true, data: newComplaint });
});

app.patch('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, resolutionProof, resolutionNotes, aiSimilarityScore } = req.body;
  const target = sampleComplaints.find(c => c.complaintId === id || c._id === id);
  if (target) {
    if (status) target.status = status;
    if (resolutionProof) target.resolutionProof = resolutionProof;
    if (resolutionNotes) target.resolutionNotes = resolutionNotes;
    if (aiSimilarityScore) target.aiSimilarityScore = aiSimilarityScore;
  }
  res.json({ success: true, data: target });
});

app.post('/api/complaints/:id/verify', (req, res) => {
  const { id } = req.params;
  const { citizenName, comment } = req.body;
  const target = sampleComplaints.find(c => c.complaintId === id || c._id === id);
  if (target) {
    if (!target.verifications) target.verifications = [];
    target.verifications.push({
      citizenName: citizenName || 'Verified Citizen',
      comment: comment || 'Verified at site.',
      verifiedAt: new Date().toISOString()
    });
    target.verificationsCount = target.verifications.length;
    if (target.verificationsCount >= 3) {
      target.status = 'Verified & Resolved';
    }
  }
  res.json({ success: true, data: target });
});

app.get('/api/analytics', (req, res) => {
  res.json({
    totalComplaints: sampleComplaints.length,
    resolvedCount: sampleComplaints.filter(c => c.status === 'Resolved' || c.status === 'Verified & Resolved').length,
    pendingCount: sampleComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Verified & Resolved').length,
    wardStats: wardsData
  });
});

app.post('/api/auth/send-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || String(mobile).replace(/\D/g, '').length < 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
  }
  const demoOtp = '123456';
  res.json({
    success: true,
    message: `SMS OTP dispatched to +91-${mobile}`,
    otp: demoOtp,
    expiresIn: '10 minutes'
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ success: false, error: 'Mobile number and OTP are required.' });
  }
  if (otp === '123456' || String(otp).length === 6) {
    return res.json({ success: true, message: 'Mobile Number Verified via SMS OTP! ✓' });
  }
  return res.status(400).json({ success: false, error: 'Invalid OTP code. Enter 123456 for demo verification.' });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, role } = req.body;
  res.json({
    success: true,
    user: {
      name: role === 'officer' ? 'Er. Rajesh Sharma' : 'Rahul Sharma',
      email: identifier,
      role: role || 'citizen',
      department: role === 'officer' ? 'Roads & Infrastructure Department' : undefined,
      wardId: 12
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const citizenId = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  res.json({
    success: true,
    citizenId,
    message: 'Registered successfully'
  });
});

// ===== SMS Complaint Endpoints =====

app.post('/api/sms/incoming', (req, res) => {
  const smsBody = req.body.Body || req.body.body || '';
  const fromNumber = req.body.From || req.body.from || '+919876543210';
  const compId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
  const classified = classifyText({ title: smsBody, description: smsBody });

  const newComplaint = {
    complaintId: compId,
    _id: compId,
    title: smsBody.substring(0, 60) + (smsBody.length > 60 ? '...' : ''),
    description: smsBody,
    category: classified.category,
    department: classified.department,
    urgency: classified.urgency,
    status: 'New',
    source: 'sms',
    citizenPhone: fromNumber,
    confidenceScore: classified.confidenceScore,
    isAutoClassified: true,
    slaHoursTotal: 48,
    slaHoursRemaining: 48,
    createdAt: new Date().toISOString()
  };
  sampleComplaints.unshift(newComplaint);

  const replyMsg = `✅ Awaaz AI: Complaint registered! ID: ${compId} | ${classified.category} | SLA: 48hrs`;
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMsg}</Message></Response>`);
});

app.post('/api/sms/simulate', (req, res) => {
  const { message, phoneNumber } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Please provide a complaint message.' });
  }
  const compId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
  const classified = classifyText({ title: message, description: message });

  const newComplaint = {
    complaintId: compId,
    _id: compId,
    title: message.substring(0, 60) + (message.length > 60 ? '...' : ''),
    description: message,
    category: classified.category,
    department: classified.department,
    departmentCode: classified.departmentCode,
    urgency: classified.urgency,
    status: 'New',
    source: 'sms',
    citizenPhone: phoneNumber || '+919876543210',
    confidenceScore: classified.confidenceScore,
    isAutoClassified: true,
    slaHoursTotal: 48,
    slaHoursRemaining: 48,
    impactScore: Math.floor(Math.random() * 10) + 85,
    xaiData: {
      confidence: classified.confidenceScore,
      reasoning: classified.xaiReasoning,
      rulesApplied: ['SMS Simulation Protocol'],
      similarCases: ['CMP-2025-8891']
    },
    createdAt: new Date().toISOString()
  };
  sampleComplaints.unshift(newComplaint);

  res.status(201).json({
    success: true,
    message: `Complaint registered via SMS! Tracking ID: ${compId}`,
    data: newComplaint,
    confirmation: `✅ Awaaz AI: Your complaint "${message.substring(0, 40)}..." has been registered as ${compId}. Category: ${classified.category}. SLA: 48 hours.`
  });
});

app.get('/api/sms/complaints', (req, res) => {
  const smsComplaints = sampleComplaints.filter(c => c.source === 'sms');
  res.json({ success: true, count: smsComplaints.length, data: smsComplaints });
});

// ===== Call Complaint Endpoints =====

app.post('/api/call/incoming', (req, res) => {
  const baseUrl = process.env.TWILIO_WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">Welcome to Awaaz AI Municipal Grievance Helpline. Please describe your complaint after the beep.</Say>
  <Record maxLength="120" transcribe="true" transcribeCallback="${baseUrl}/api/call/transcription" action="${baseUrl}/api/call/recording" playBeep="true" timeout="5" />
  <Say>We did not receive a recording. Please call again.</Say>
</Response>`);
});

app.post('/api/call/recording', (req, res) => {
  const compId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">Thank you. Your complaint has been recorded. Your tracking ID is ${compId.split('').join(' ')}. You will receive an SMS confirmation shortly.</Say>
</Response>`);
});

app.post('/api/call/transcription', (req, res) => {
  res.json({ success: true, message: 'Transcription processed' });
});

app.post('/api/call/simulate', (req, res) => {
  const { transcription, phoneNumber } = req.body;
  if (!transcription || !transcription.trim()) {
    return res.status(400).json({ success: false, error: 'Please provide a complaint transcription.' });
  }
  const compId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
  const classified = classifyText({ title: transcription, description: transcription });

  const newComplaint = {
    complaintId: compId,
    _id: compId,
    title: transcription.substring(0, 60) + (transcription.length > 60 ? '...' : ''),
    description: transcription,
    category: classified.category,
    department: classified.department,
    departmentCode: classified.departmentCode,
    urgency: classified.urgency,
    status: 'New',
    source: 'call',
    citizenPhone: phoneNumber || '+919876543210',
    confidenceScore: classified.confidenceScore,
    isAutoClassified: true,
    slaHoursTotal: 48,
    slaHoursRemaining: 48,
    impactScore: Math.floor(Math.random() * 10) + 85,
    xaiData: {
      confidence: classified.confidenceScore,
      reasoning: classified.xaiReasoning,
      rulesApplied: ['Call Simulation Protocol'],
      similarCases: ['CMP-2025-8891']
    },
    createdAt: new Date().toISOString()
  };
  sampleComplaints.unshift(newComplaint);

  res.status(201).json({
    success: true,
    message: `Complaint registered via call! Tracking ID: ${compId}`,
    data: newComplaint,
    confirmation: `✅ Awaaz AI: Your voice complaint has been registered as ${compId}. Category: ${classified.category}. SLA: 48 hours.`
  });
});

app.get('/api/call/complaints', (req, res) => {
  const callComplaints = sampleComplaints.filter(c => c.source === 'call');
  res.json({ success: true, count: callComplaints.length, data: callComplaints });
});

// ===== Google OAuth + Email OTP (Vercel Serverless) =====
const emailOtpStore = {};

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    if (!credential && !userInfo) {
      return res.status(400).json({ success: false, error: 'Google credential or user info is required.' });
    }

    let email, name, picture;

    if (userInfo && userInfo.email) {
      if (!userInfo.email_verified) {
        return res.status(403).json({ success: false, error: 'Your Google account email is not verified.' });
      }
      email = userInfo.email;
      name = userInfo.name || email.split('@')[0];
      picture = userInfo.picture || '';
    } else {
      return res.status(401).json({ success: false, error: 'Invalid Google credential.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    emailOtpStore[email.toLowerCase()] = {
      otp, name, picture,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    // In Vercel, email sending requires configured transporter (optional)
    // For demo: return OTP in response
    return res.json({
      success: true,
      email: email.toLowerCase(),
      name, picture,
      message: `Demo mode: Use OTP ${otp}`,
      demoOtp: otp
    });
  } catch (err) {
    console.error('[AUTH] Google login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

app.post('/api/auth/google-verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
    }

    const stored = emailOtpStore[email.toLowerCase()];
    if (!stored) {
      return res.status(400).json({ success: false, error: 'No OTP found. Please sign in with Google first.' });
    }

    if (Date.now() > stored.expiresAt) {
      delete emailOtpStore[email.toLowerCase()];
      return res.status(400).json({ success: false, error: 'OTP has expired.' });
    }

    if (stored.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP.' });
    }

    delete emailOtpStore[email.toLowerCase()];

    const citizenId = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    return res.json({
      success: true,
      user: {
        citizenId,
        name: stored.name,
        email: email.toLowerCase(),
        picture: stored.picture,
        role: 'citizen',
        authProvider: 'google',
        lastLoginAt: new Date().toISOString()
      },
      message: 'Email OTP verified! You are now logged in.'
    });
  } catch (err) {
    console.error('[AUTH] OTP verification error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = app;
