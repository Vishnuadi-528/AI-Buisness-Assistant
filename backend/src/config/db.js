'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

/**
 * Connect to MongoDB. Called once at server startup.
 * Mongoose maintains a connection pool internally — import this module
 * anywhere you need DB access; models are globally registered.
 */
async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () =>
    logger.info({ uri: sanitizeUri(env.MONGODB_URI) }, 'MongoDB connected')
  );
  mongoose.connection.on('disconnected', () =>
    logger.warn('MongoDB disconnected')
  );
  mongoose.connection.on('error', (err) =>
    logger.error({ err }, 'MongoDB connection error')
  );

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,   // fail fast if no server found
    socketTimeoutMS: 45000,
  });
}

async function disconnectDB() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}

/** Strip credentials from URI for safe logging */
function sanitizeUri(uri = '') {
  try {
    const u = new URL(uri);
    u.password = '****';
    return u.toString();
  } catch {
    return uri.replace(/:\/\/[^@]+@/, '://<credentials>@');
  }
}

module.exports = { connectDB, disconnectDB };
