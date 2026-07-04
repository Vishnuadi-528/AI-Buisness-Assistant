'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { unauthorized } = require('../utils/response');

/**
 * Verifies the Bearer access token on protected routes.
 * Attaches decoded payload to req.user on success.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing or malformed Authorization header.');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = payload; // { userId, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Access token expired. Please refresh.');
    }
    return unauthorized(res, 'Invalid access token.');
  }
}

module.exports = { authenticate };
