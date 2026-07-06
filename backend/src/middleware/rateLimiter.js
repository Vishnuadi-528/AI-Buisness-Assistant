'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { tooManyRequests } = require('../utils/response');

/**
 * General API rate limiter — applied to all /api/* routes.
 * Default: 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  handler: (_req, res) => tooManyRequests(res, 'Too many requests. Please wait and try again.'),
  keyGenerator: (req) => req.ip,
});

/**
 * Strict AI generation limiter — applied only to generate-report and regenerate endpoints.
 * Default: 10 requests per hour per user (falls back to IP if unauthenticated).
 */
const aiGenerationLimiter = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    tooManyRequests(
      res,
      `AI report generation limit reached. You can generate up to ${env.AI_RATE_LIMIT_MAX} reports per hour.`
    ),
  keyGenerator: (req) => req.user?.userId ?? req.ip,
  skip: (req) => env.NODE_ENV === 'test', // Don't block during automated testing
});

/**
 * Auth endpoint limiter — brute-force protection on login/register.
 * 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    tooManyRequests(res, 'Too many authentication attempts. Please wait 15 minutes.'),
  keyGenerator: (req) => req.ip,
  skip: (req) => env.NODE_ENV === 'test',
});

module.exports = { generalLimiter, aiGenerationLimiter, authLimiter };
