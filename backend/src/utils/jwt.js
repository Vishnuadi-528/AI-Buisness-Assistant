'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a short-lived access token.
 * @param {{ userId: string, email: string }} payload
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'ai-business-assistant',
  });
}

/**
 * Sign a long-lived refresh token.
 * @param {{ userId: string }} payload
 * @returns {string}
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'ai-business-assistant',
  });
}

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Parse ms from JWT expiry string (e.g. "7d" → 604800000).
 * Used to set DB expiry on the RefreshToken record.
 * @param {string} expiresIn
 * @returns {Date}
 */
function expiryDate(expiresIn) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  const ms = parseInt(match[1], 10) * units[match[2]];
  return new Date(Date.now() + ms);
}

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, expiryDate };
