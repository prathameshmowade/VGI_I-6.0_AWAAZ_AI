const mongoose = require('mongoose');
const contractorSchema = new mongoose.Schema({
  contractorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  departmentId: String,
  assignedWards: [String],
  activeContracts: [String],
  contactOffice: String,
  registrationNo: String,
  stats: {
    totalAssigned: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
    avgResolutionHours: { type: Number, default: 0 },
    slaCompliance: { type: Number, default: 0 },
    resolutionRate: { type: Number, default: 0 },
    citizenSatisfaction: { type: Number, default: 0 },
    repeatComplaints: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 }
  }
});
module.exports = mongoose.model('Contractor', contractorSchema);
