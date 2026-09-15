const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  verificationId: { type: String, required: true, unique: true },
  complaintId: { type: String, required: true, index: true },
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  citizenEmail: { type: String },
  vote: { type: String, enum: ['VERIFIED', 'REJECTED'], required: true },
  feedback: { type: String, default: '' },
  location: {
    ward: String,
    zone: String,
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique index: one vote per citizen per complaint
verificationSchema.index({ complaintId: 1, citizenId: 1 }, { unique: true });

module.exports = mongoose.model('Verification', verificationSchema);
