'use strict';

/**
 * Vercel Serverless Entry Point
 *
 * Vercel runs each request through this file as a serverless function.
 * We export the Express app directly — Vercel handles the HTTP plumbing.
 *
 * MongoDB connection is cached on the module level so it persists
 * across warm invocations (avoids reconnecting on every request).
 */

const { connectDB } = require('../src/config/db');
const app = require('../src/app');

let isConnected = false;

// Cache the DB connection across warm lambda invocations
async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// Vercel expects a default export of a Node.js http handler
module.exports = async (req, res) => {
  await ensureDB();
  return app(req, res);
};
