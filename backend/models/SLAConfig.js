const mongoose = require('mongoose');
const s = new mongoose.Schema({ category: String, urgency: String, slaHours: Number });
module.exports = mongoose.model('SLAConfig', s);
