const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  citizenId: {
    type: String,
    required: true,
    unique: true,
    default: () => `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: 'Indore'
  },
  state: {
    type: String,
    default: 'Madhya Pradesh'
  },
  pinCode: {
    type: String,
    default: '452001'
  },
  role: {
    type: String,
    enum: ['resident', 'citizen', 'officer', 'department_worker', 'admin'],
    default: 'resident'
  },
  department: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);
