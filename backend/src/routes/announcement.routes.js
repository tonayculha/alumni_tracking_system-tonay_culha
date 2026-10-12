const express = require('express');
const announcementController = require('../controllers/announcement.controller');

const router = express.Router();

/**
 * @openapi
 * /announcements:
 *   get:
 *     tags:
 *       - Announcements View (MVC)
 *     summary: Render Announcements Management Portal (HTML View)
 *     description: Serves the semantic HTML5 view for interactive in-browser announcement browsing, category filtering, and CRUD operations.
 *     responses:
 *       200:
 *         description: Semantic HTML announcement management dashboard.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *   post:
 *     tags:
 *       - Announcements View (MVC)
 *     summary: Handle Announcement Creation Form Submission
 *     description: Accepts standard HTML form submissions or AJAX payloads to create a new announcement and redirects or returns the result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementInput'
 *     responses:
 *       302:
 *         description: Redirects back to /announcements on successful form submission.
 *       201:
 *         description: Announcement created (AJAX clients).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Validation error.
 */
router.get('/', announcementController.getAnnouncementsView);
router.post('/', announcementController.handleCreateAnnouncement);

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements View (MVC)
 *     summary: Inspect Announcement Detail HTML View
 *     description: Renders the details of a specific announcement or redirects to the dashboard with highlighting.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the announcement
 *     responses:
 *       200:
 *         description: Announcement detail view or JSON representation.
 *       302:
 *         description: Redirects to /announcements with view query parameter.
 *       404:
 *         description: Announcement not found.
 */
router.get('/:id', announcementController.getAnnouncementDetailView);
router.post('/:id/delete', announcementController.handleDeleteAnnouncement);
router.delete('/:id', announcementController.handleDeleteAnnouncement);

module.exports = router;
