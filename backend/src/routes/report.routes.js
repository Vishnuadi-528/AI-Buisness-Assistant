'use strict';

const { Router } = require('express');
const c = require('../controllers/report.controller');
const { authenticate } = require('../middleware/authenticate');

// Two separate routers so they can be mounted at different base paths

// ─── Mounted at /api/business/:id/reports ────────────────
const businessReportRouter = Router({ mergeParams: true });
businessReportRouter.use(authenticate);

/**
 * @swagger
 * /api/business/{id}/reports:
 *   get:
 *     summary: List all report versions for a business
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of report summaries
 */
businessReportRouter.get('/', c.listReports);

// ─── Mounted at /api/reports ──────────────────────────────
const reportRouter = Router();
reportRouter.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Access, regenerate, and export AI-generated business reports
 */

/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     summary: Get a full report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full report with JSON and Markdown
 *       404:
 *         description: Not found
 */
reportRouter.get('/:reportId', c.getReport);

/**
 * @swagger
 * /api/reports/{reportId}/sections/{sectionKey}:
 *   get:
 *     summary: Get a specific section of a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectionKey
 *         required: true
 *         schema:
 *           type: string
 *           enum: [investment_analysis, employee_requirement, government_schemes, bank_loan_guidance, risks, pros_and_cons, action_plan]
 *     responses:
 *       200:
 *         description: Section content
 */
reportRouter.get('/:reportId/sections/:sectionKey', c.getReportSection);

/**
 * @swagger
 * /api/reports/{reportId}/regenerate:
 *   put:
 *     summary: Regenerate a report with updated inputs
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               investmentAmount:
 *                 type: number
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               teamSize:
 *                 type: string
 *               timeline:
 *                 type: string
 *               additionalContext:
 *                 type: string
 *     responses:
 *       201:
 *         description: New report version created
 */
reportRouter.put('/:reportId/regenerate', c.regenerateReport);

/**
 * @swagger
 * /api/reports/{reportId}/export:
 *   get:
 *     summary: Export a report as PDF or DOCX
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, docx]
 *           default: pdf
 *     responses:
 *       200:
 *         description: Binary file download
 */
reportRouter.get('/:reportId/export', c.exportReport);

module.exports = { reportRouter, businessReportRouter };
