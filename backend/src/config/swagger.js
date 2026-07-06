'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Business Assistant API',
      version: '1.0.0',
      description:
        'Backend API for the AI Business Assistant. ' +
        'Submit a business idea and receive a complete master report — ' +
        'feasibility, investment analysis, employee requirements, government schemes, ' +
        'bank loan guidance, risks, pros/cons, and a full action plan — generated via Claude AI.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token: Bearer <token>',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'Jane Doe' },
            email:    { type: 'string', format: 'email', example: 'jane@example.com' },
            password: { type: 'string', minLength: 8, example: 'Password123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken:  { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        // ── Business ──────────────────────────────────────
        Business: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            businessName:     { type: 'string', example: 'Green Leaf Cafe' },
            industry:         { type: 'string', example: 'Food & Beverage' },
            investmentAmount: { type: 'number', example: 500000 },
            country:          { type: 'string', example: 'India' },
            location:         { type: 'string', example: 'Bangalore' },
            stage:            { type: 'string', enum: ['idea', 'early', 'growth'] },
            createdAt:        { type: 'string', format: 'date-time' },
          },
        },
        CreateBusinessRequest: {
          type: 'object',
          required: ['businessName'],
          properties: {
            businessName:     { type: 'string', example: 'Green Leaf Cafe' },
            industry:         { type: 'string', example: 'Food & Beverage' },
            investmentAmount: { type: 'number', example: 500000 },
            country:          { type: 'string', example: 'India' },
            location:         { type: 'string', example: 'Bangalore' },
            stage:            { type: 'string', enum: ['idea', 'early', 'growth'], default: 'idea' },
          },
        },
        // ── Report ────────────────────────────────────────
        ReportSummary: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            version:          { type: 'integer', example: 1 },
            generationStatus: { type: 'string', example: 'completed' },
            createdAt:        { type: 'string', format: 'date-time' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            businessId:     { type: 'string', format: 'uuid' },
            version:        { type: 'integer' },
            reportJson:     { type: 'object', description: 'Structured AI output with all sections' },
            reportMarkdown: { type: 'string', description: 'Full rendered Markdown report' },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },
        GenerateReportRequest: {
          type: 'object',
          properties: {
            teamSize:          { type: 'string', example: '2 co-founders, no employees yet' },
            timeline:          { type: 'string', example: 'Launch in 6 months' },
            additionalContext: { type: 'string', example: 'Targeting millennials in urban areas' },
          },
        },
        ClarifyRequest: {
          type: 'object',
          required: ['answers'],
          properties: {
            answers: {
              type: 'object',
              additionalProperties: { type: 'string' },
              example: { country: 'India', investmentAmount: '500000', industry: 'Food & Beverage' },
            },
          },
        },
        // ── Common ────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health',     description: 'Server health check' },
      { name: 'Auth',       description: 'Register, login, token refresh, and logout' },
      { name: 'Businesses', description: 'Manage business entries and trigger AI report generation' },
      { name: 'Reports',    description: 'Access, regenerate, section queries, and export reports' },
    ],
  },
  apis: [
    './src/routes/*.js',  // Picks up all @swagger JSDoc annotations from route files
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
