const mongoose = require('mongoose');
const assetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  type: String,
  name: String,
  ward: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  departmentId: String,
  contractorId: String
});
module.exports = mongoose.model('Asset', assetSchema);
