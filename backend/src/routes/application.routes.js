const express = require('express');
const applicationController = require('../controllers/application.controller');

const router = express.Router();

/**
 * @openapi
 * /applications:
 *   get:
 *     tags:
 *       - Applications View (MVC)
 *     summary: Render Applications Management Dashboard (HTML View)
 *     description: Serves the responsive semantic HTML5 view displaying candidate job applications, status badges, and submission modals.
 *     responses:
 *       200:
 *         description: Semantic HTML applications dashboard.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *   post:
 *     tags:
 *       - Applications View (MVC)
 *     summary: Handle Application Submission Form
 *     description: Accepts standard HTML form submissions or AJAX payloads to submit candidate job applications.
 *     responses:
 *       302:
 *         description: Redirects back to /applications on successful submission.
 *       201:
 *         description: Application created (AJAX clients).
 */
router.get('/', applicationController.getApplicationsView);
router.post('/', applicationController.handleCreateApplication);

/**
 * @openapi
 * /applications/{id}:
 *   get:
 *     tags:
 *       - Applications View (MVC)
 *     summary: Inspect Application Detail View
 *     description: Renders details of a single application or redirects to the dashboard.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Application details.
 *       302:
 *         description: Redirects to /applications?view=:id.
 */
router.get('/:id', applicationController.getApplicationDetailView);
router.post('/:id/delete', applicationController.handleDeleteApplication);
router.delete('/:id', applicationController.handleDeleteApplication);

module.exports = router;
