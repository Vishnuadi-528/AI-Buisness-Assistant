'use strict';

const logger = require('../config/logger');

/**
 * Lightweight request/response logger using pino.
 * Logs method, URL, status, and response time.
 * Skips /health to avoid noise.
 */
function requestLogger(req, res, next) {
  if (req.path === '/health') return next();

  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level]({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms,
      userId: req.user?.userId ?? null,
    }, `${req.method} ${req.originalUrl} ${res.statusCode} — ${ms}ms`);
  });

  next();
}

module.exports = { requestLogger };
