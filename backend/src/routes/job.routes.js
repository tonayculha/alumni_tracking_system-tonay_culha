const express = require('express');
const jobController = require('../controllers/job.controller');

const router = express.Router();

/**
 * @openapi
 * /jobs:
 *   get:
 *     tags:
 *       - Jobs View (MVC)
 *     summary: Render Job Postings Portal (HTML View)
 *     description: Serves the responsive semantic HTML5 view for browsing job opportunities, searching, and opening modals to post jobs or apply.
 *     responses:
 *       200:
 *         description: Semantic HTML job catalog.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *   post:
 *     tags:
 *       - Jobs View (MVC)
 *     summary: Handle Job Posting Form Submission
 *     description: Accepts standard HTML form submissions or AJAX payloads to publish a new job opportunity.
 *     responses:
 *       302:
 *         description: Redirects back to /jobs on successful submission.
 *       201:
 *         description: Job posting created (AJAX clients).
 */
router.get('/', jobController.getJobsView);
router.post('/', jobController.handleCreateJob);

/**
 * @openapi
 * /jobs/{id}:
 *   get:
 *     tags:
 *       - Jobs View (MVC)
 *     summary: Inspect Job Posting Detail View
 *     description: Renders the details of a specific job posting or redirects to the catalog.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job posting details.
 *       302:
 *         description: Redirects to /jobs?view=:id.
 */
router.get('/:id', jobController.getJobDetailView);
router.post('/:id/delete', jobController.handleDeleteJob);
router.delete('/:id', jobController.handleDeleteJob);

module.exports = router;
