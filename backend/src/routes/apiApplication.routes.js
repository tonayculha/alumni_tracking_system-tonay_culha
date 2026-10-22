const express = require('express');
const apiApplicationController = require('../controllers/apiApplication.controller');

const router = express.Router();

/**
 * @openapi
 * /api/applications:
 *   get:
 *     tags:
 *       - Applications API (REST)
 *     summary: Retrieve all job applications
 *     description: Returns a list of all job application records across the platform.
 *     responses:
 *       200:
 *         description: Applications retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *   post:
 *     tags:
 *       - Applications API (REST)
 *     summary: Create an application directly
 *     description: Creates an application record linking a candidate user to a job posting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApplicationInput'
 *     responses:
 *       201:
 *         description: Application created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Validation error or invalid inputs.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate user or target job posting not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate application conflict.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictErrorResponse'
 */
router.get('/', apiApplicationController.getApplications);
router.post('/', apiApplicationController.createApplication);

/**
 * @openapi
 * /api/applications/{id}:
 *   get:
 *     tags:
 *       - Applications API (REST)
 *     summary: Get application by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Application retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Applications API (REST)
 *     summary: Delete an application
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Application deleted successfully.
 *       404:
 *         description: Application not found.
 */
router.get('/:id', apiApplicationController.getApplicationById);
router.delete('/:id', apiApplicationController.deleteApplication);

module.exports = router;
