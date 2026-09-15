const mongoose = require('mongoose');
const contractSchema = new mongoose.Schema({
  workOrderId: { type: String, required: true, unique: true },
  contractorId: String,
  departmentId: String,
  ward: String,
  assetType: String,
  project: String,
  slaHours: { type: Number, default: 48 },
  startDate: String,
  endDate: String,
  status: { type: String, enum: ['Active', 'Completed', 'Expired', 'Suspended'], default: 'Active' }
});
module.exports = mongoose.model('Contract', contractSchema);
