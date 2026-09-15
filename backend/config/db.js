const mongoose = require('mongoose');
const env = require('./env');
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected');
  } catch(e) {
    console.warn('MongoDB offline, using mock in-memory/JSON fallback mode');
  }
};
module.exports = connectDB;
