const mongoose = require('mongoose');
const s = new mongoose.Schema({ id: { type: String, unique: true }, name: String, code: String, headOfficer: String, email: String, phone: String });
module.exports = mongoose.model('Department', s);
