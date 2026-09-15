const mongoose = require('mongoose');
const s = new mongoose.Schema({ complaintId: String, action: String, actor: String, timestamp: { type: Date, default: Date.now }, hash: String, previousHash: String, details: Object });
module.exports = mongoose.model('AuditLog', s);
