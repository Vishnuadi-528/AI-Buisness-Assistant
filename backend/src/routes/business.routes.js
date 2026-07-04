'use strict';

const { Router } = require('express');
const c = require('../controllers/business.controller');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const v = require('../validators/business.validators');

const router = Router();

// All business routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Businesses
 *   description: Manage business entries and trigger AI report generation
 */

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: List all businesses for the authenticated user
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of business entries
 */
router.get('/', c.listBusinesses);

/**
 * @swagger
 * /api/business:
 *   post:
 *     summary: Create a new business entry
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName]
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: Green Leaf Cafe
 *               industry:
 *                 type: string
 *                 example: Food & Beverage
 *               investmentAmount:
 *                 type: number
 *                 example: 500000
 *               country:
 *                 type: string
 *                 example: India
 *               location:
 *                 type: string
 *                 example: Bangalore
 *               stage:
 *                 type: string
 *                 enum: [idea, early, growth]
 *     responses:
 *       201:
 *         description: Business created
 */
router.post('/', validate(v.createBusiness), c.createBusiness);

/**
 * @swagger
 * /api/business/{id}:
 *   get:
 *     summary: Get a single business by ID
 *     tags: [Businesses]
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
 *         description: Business object
 *       404:
 *         description: Not found
 */
router.get('/:id', c.getBusiness);

/**
 * @swagger
 * /api/business/{id}:
 *   put:
 *     summary: Update a business entry
 *     tags: [Businesses]
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
 *         description: Updated business
 */
router.put('/:id', validate(v.updateBusiness), c.updateBusiness);

/**
 * @swagger
 * /api/business/{id}:
 *   delete:
 *     summary: Delete a business and all its reports
 *     tags: [Businesses]
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
 *         description: Deleted
 */
router.delete('/:id', c.deleteBusiness);

/**
 * @swagger
 * /api/business/{id}/generate-report:
 *   post:
 *     summary: Generate a full AI business report (or get clarifying questions)
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamSize:
 *                 type: string
 *                 example: "2 co-founders"
 *               timeline:
 *                 type: string
 *                 example: "Launch in 6 months"
 *               additionalContext:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report generated and saved
 *       200:
 *         description: Clarifying questions returned (report not yet generated)
 */
router.post('/:id/generate-report', validate(v.generateReport), c.generateReport);

/**
 * @swagger
 * /api/business/{id}/clarify:
 *   post:
 *     summary: Submit answers to clarifying questions so the report can be generated
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: object
 *                 example: { "country": "India", "investmentAmount": "500000" }
 *     responses:
 *       200:
 *         description: Clarification saved
 */
router.post('/:id/clarify', validate(v.clarify), c.clarifyBusiness);

module.exports = router;
