const mongoose = require('mongoose');
const s = new mongoose.Schema({ 
  complaintId: { type: String, required: true, unique: true }, 
  tenantId: { type: String, default: 'tenant_nmc', index: true },
  h3IndexRes8: { type: String, index: true },
  h3IndexRes9: { type: String, index: true },
  pHash: { type: String, index: true },
  intakeReference: { type: String, index: true },
  title: { type: String, required: true }, 
  description: String, 
  category: { type: String, default: 'Road Damage' }, 
  urgency: { type: String, enum: ['Low','Medium','High','Critical','Low Priority','Medium Priority','High Priority','Critical Priority'], default: 'Medium' }, 
  status: { type: String, enum: ['New','Not Assigned','Assigned','In Progress','Started','Under Verification','Pending Verification','Completed','Resolved','Verified & Resolved','Escalated'], default: 'New' }, 
  department: String, 
  departmentCode: String,
  location: { type: mongoose.Schema.Types.Mixed },
  jurisdiction: { ward: String, zone: String, zoneName: String },
  officerId: String,
  assetId: String,
  contractorId: String,
  workOrderId: String,
  responsibilityData: { type: mongoose.Schema.Types.Mixed },
  language: { type: String, default: 'en' }, 
  source: { type: String, enum: ['web', 'sms', 'call', 'whatsapp', 'telegram'], default: 'web' },
  citizenPhone: { type: String },
  citizenEmail: { type: String, index: true },
  citizenName: { type: String },
  citizenId: { type: String, index: true },
  telegramChatId: { type: String },
  telegramUsername: { type: String },
  telegramMessageId: { type: String },
  isAutoClassified: Boolean,
  confidenceScore: Number, 
  slaHoursTotal: Number, 
  slaHoursRemaining: Number, 
  impactScore: Number, 
  isDuplicate: Boolean, 
  duplicateCount: { type: Number, default: 0 },
  duplicateParentId: String,
  xaiData: { type: mongoose.Schema.Types.Mixed },
  xaiExplanation: Object, 
  blockchainHash: String, 

  // Officer completion fields
  resolutionProof: String,
  resolutionNotes: String,
  completed_by: {
    id: String,
    name: String,
    email: String,
    role: String,
    department: String
  },
  completion_proof: String,
  completion_notes: String,
  completed_at: Date,
  completion_history: [{
    proof: String,
    notes: String,
    officer: { type: mongoose.Schema.Types.Mixed },
    completedAt: Date,
    verificationResult: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED'] }
  }],

  // Verification lifecycle fields
  priority_weight: { type: Number, default: 1 },
  verification_status: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED', 'NONE'], default: 'NONE' },
  verification_deadline: Date,
  verification_attempts: { type: Number, default: 0 },
  verification_failures: { type: Number, default: 0 },
  verified_count: { type: Number, default: 0 },
  rejected_count: { type: Number, default: 0 },

  // Legacy fields for backward compatibility
  verifications: [{ citizenName: String, comment: String, verifiedAt: Date }],
  verificationsCount: { type: Number, default: 0 },
  requiredVerifications: { type: Number, default: 3 },
  pendingVerificationStartedAt: Date,
  verificationWindowDays: { type: Number, default: 7 },
  aiSimilarityScore: Number,

  // Audio/SMS/Call fields
  recordingUrl: String,
  recordingSid: String,
  recordingDuration: Number,
  messageSid: String,

  // Audit timeline
  auditTimeline: [{
    event: String,
    actor: String,
    actorRole: String,
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },
    hash: String
  }],

  createdAt: { type: Date, default: Date.now } 
});

// Multi-Tenant Compound Indexes
s.index({ tenantId: 1, status: 1 });
s.index({ tenantId: 1, h3IndexRes8: 1 });
s.index({ tenantId: 1, createdAt: -1 });
s.index({ tenantId: 1, pHash: 1 });

module.exports = mongoose.model('Complaint', s);
