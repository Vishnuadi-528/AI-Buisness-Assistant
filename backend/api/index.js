'use strict';

/**
 * Vercel Serverless Entry Point
 *
 * Vercel invokes this handler for every request.
 * MongoDB connection is cached at module scope so it persists
 * across warm lambda invocations (avoids reconnecting on every request).
 */

const { connectDB } = require('../src/config/db');
const app = require('../src/app');

let isConnected = false;
let connectionError = null;

// Attempt DB connection once and cache the result
async function ensureDB() {
  if (isConnected) return;
  if (connectionError) throw connectionError;

  try {
    await connectDB();
    isConnected = true;
    connectionError = null;
  } catch (err) {
    connectionError = err;
    throw err;
  }
}

/**
 * Main serverless handler — Vercel passes every request here.
 * Express handles routing internally.
 */
module.exports = async (req, res) => {
  try {
    await ensureDB();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database connection failed.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
    return;
  }

  // Hand off to Express
  return app(req, res);
};
