'use strict';

const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  redact: {
    paths: ['*.password', '*.passwordHash', '*.token', '*.accessToken', '*.refreshToken'],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
