'use strict';

require('dotenv').config();

function required(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key, defaultValue = '') {
  return process.env[key] ?? defaultValue;
}

const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),

  MONGODB_URI: required('MONGODB_URI'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  GROQ_API_KEY: required('GROQ_API_KEY'),
  GROQ_MODEL: optional('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  AI_MAX_TOKENS: parseInt(optional('AI_MAX_TOKENS', '8000'), 10),

  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  AI_RATE_LIMIT_WINDOW_MS: parseInt(optional('AI_RATE_LIMIT_WINDOW_MS', '3600000'), 10),
  AI_RATE_LIMIT_MAX: parseInt(optional('AI_RATE_LIMIT_MAX', '10'), 10),

  BCRYPT_SALT_ROUNDS: parseInt(optional('BCRYPT_SALT_ROUNDS', '12'), 10),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),

  get isProduction() { return this.NODE_ENV === 'production'; },
  get isDevelopment() { return this.NODE_ENV === 'development'; },
};

module.exports = env;
