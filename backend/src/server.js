'use strict';

const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = env.PORT;

async function start() {
  // Verify MongoDB connection before accepting traffic
  try {
    await connectDB();
  } catch (err) {
    logger.fatal(
      { err },
      'Failed to connect to MongoDB. ' +
      'Make sure MongoDB is running and MONGODB_URI in .env is correct.\n' +
      'Quick start options:\n' +
      '  1. Docker:  docker-compose up -d\n' +
      '  2. Local:   mongod --dbpath ./data/db\n' +
      '  3. Atlas:   set MONGODB_URI to your Atlas connection string'
    );
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(
      {
        port: PORT,
        env: env.NODE_ENV,
        docs: `http://localhost:${PORT}/api/docs`,
        health: `http://localhost:${PORT}/health`,
      },
      `AI Business Assistant server running on port ${PORT}`
    );
  });

  // ─── Graceful Shutdown ──────────────────────────────────
  async function shutdown(signal) {
    logger.info({ signal }, 'Shutdown signal received — closing gracefully...');
    server.close(async () => {
      await disconnectDB();
      logger.info('Server closed. Goodbye.');
      process.exit(0);
    });

    // Force exit after 10s if server is stuck
    setTimeout(() => {
      logger.warn('Forcing exit after 10s timeout.');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down');
    shutdown('uncaughtException');
  });
}

start();
