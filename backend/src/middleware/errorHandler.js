'use strict';

const logger = require('../config/logger');
const env = require('../config/env');

/**
 * Global error handler — registered last in the Express middleware chain.
 * Handles Mongoose, JWT, and generic errors with a consistent response shape.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars

  // ── Mongoose Validation Error ───────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  // ── Mongoose Duplicate Key (unique index) ───────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`,
    });
  }

  // ── Mongoose CastError (invalid ObjectId) ──────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: '${err.value}'.`,
    });
  }

  // ── JWT Errors ─────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  // ── Payload Too Large ──────────────────────────────────
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request payload too large.' });
  }

  // ── Generic ────────────────────────────────────────────
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message    = statusCode < 500 ? err.message : 'Internal server error.';

  logger.error(
    { err, method: req.method, url: req.originalUrl, userId: req.user?.userId ?? null },
    'Unhandled error'
  );

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
}

/**
 * 404 handler — catches any request that didn't match a route.
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = { errorHandler, notFoundHandler };
