'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const { swaggerSpec } = require('./config/swagger');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, aiGenerationLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth.routes');
const businessRoutes = require('./routes/business.routes');
const { reportRouter, businessReportRouter } = require('./routes/report.routes');

const app = express();

// ─── Security & Compression ───────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.isProduction ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Request Logging ──────────────────────────────────────
app.use(requestLogger);

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Swagger Docs ─────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'AI Business Assistant API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: { persistAuthorization: true },
  })
);

// Serve raw OpenAPI spec as JSON
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ─── API Routes ───────────────────────────────────────────
app.use('/api', generalLimiter);

// Auth
app.use('/api/auth', authLimiter, authRoutes);

// Businesses + nested report list + generate + clarify
app.use('/api/business', businessRoutes);

// Nested: GET /api/business/:id/reports
app.use('/api/business/:id/reports', businessReportRouter);

// Reports (standalone): get, section, regenerate, export
app.use('/api/reports', reportRouter);

// Apply strict AI limiter to generation endpoints
app.use('/api/business/:id/generate-report', aiGenerationLimiter);
app.use('/api/reports/:reportId/regenerate',  aiGenerationLimiter);

// ─── Catch-all & Error Handling ───────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
