const mongoose = require('mongoose');
const officerSchema = new mongoose.Schema({
  officerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: String,
  departmentId: String,
  departmentName: String,
  jurisdiction: {
    ward: String,
    zone: String,
    zoneName: String
  },
  responsibilities: [String],
  stats: {
    activeComplaints: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
    avgResolutionHours: { type: Number, default: 0 }
  }
});
module.exports = mongoose.model('Officer', officerSchema);
