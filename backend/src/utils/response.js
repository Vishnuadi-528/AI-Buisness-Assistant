'use strict';

/**
 * Consistent JSON response helpers.
 * All API responses use { success, data?, error?, message? } shape.
 */

function ok(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function created(res, data = null, message = 'Created') {
  return ok(res, data, message, 201);
}

function badRequest(res, message = 'Bad request.', errors = null) {
  return res.status(400).json({ success: false, message, ...(errors && { errors }) });
}

function unauthorized(res, message = 'Unauthorized.') {
  return res.status(401).json({ success: false, message });
}

function forbidden(res, message = 'Forbidden.') {
  return res.status(403).json({ success: false, message });
}

function notFound(res, message = 'Resource not found.') {
  return res.status(404).json({ success: false, message });
}

function conflict(res, message = 'Conflict.') {
  return res.status(409).json({ success: false, message });
}

function tooManyRequests(res, message = 'Too many requests. Please slow down.') {
  return res.status(429).json({ success: false, message });
}

function serverError(res, message = 'Internal server error.') {
  return res.status(500).json({ success: false, message });
}

module.exports = {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,
  serverError,
};
