const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: System Health & Diagnostics
 *     description: Returns server operational status, uptime in seconds, ISO timestamp, and underlying system metrics.
 *     responses:
 *       200:
 *         description: Service is healthy and operational.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', healthController.getHealth);
router.get('/health', healthController.getHealth);

module.exports = router;
