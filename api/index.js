// Vercel Serverless Function Ingress Gateway
const app = require('../backend/app');
const connectDB = require('../backend/config/db');

// Connect Database (cached by Mongoose across serverless invocations)
connectDB().catch(err => {
  console.warn('[Vercel Serverless] DB connection notice:', err.message);
});

module.exports = app;
