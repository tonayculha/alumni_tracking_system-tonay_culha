const express = require('express');
const apiAnnouncementController = require('../controllers/apiAnnouncement.controller');

const router = express.Router();

/**
 * @openapi
 * /api/announcements:
 *   get:
 *     tags:
 *       - Announcements API (REST)
 *     summary: Retrieve all announcements (JSON)
 *     description: Returns a JSON array of all active announcements in the in-memory store.
 *     responses:
 *       200:
 *         description: A list of announcements.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 *   post:
 *     tags:
 *       - Announcements API (REST)
 *     summary: Create a new announcement (JSON)
 *     description: Validates and creates a new announcement, assigning a unique UUID and persisting in memory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementInput'
 *     responses:
 *       201:
 *         description: Announcement created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Invalid input or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', apiAnnouncementController.getAnnouncements);
router.post('/', apiAnnouncementController.createAnnouncement);

/**
 * @openapi
 * /api/announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements API (REST)
 *     summary: Get announcement by ID (JSON)
 *     description: Retrieves details of a specific announcement matching the supplied UUID.
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
 *         description: Announcement found and returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       404:
 *         description: Announcement not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Announcements API (REST)
 *     summary: Full update of an existing announcement (JSON)
 *     description: Replaces all mutable attributes of the announcement matching the supplied ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementInput'
 *     responses:
 *       200:
 *         description: Announcement updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Announcement not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags:
 *       - Announcements API (REST)
 *     summary: Partial update of an existing announcement (JSON)
 *     description: Modifies one or more fields of the announcement matching the supplied ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAnnouncementInput'
 *     responses:
 *       200:
 *         description: Announcement updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Announcement not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Announcements API (REST)
 *     summary: Delete an announcement by ID (JSON)
 *     description: Permanently removes the announcement matching the supplied ID from the in-memory store.
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
 *         description: Announcement deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Announcement deleted successfully
 *                 id:
 *                   type: string
 *                   example: a1111111-1111-4111-a111-111111111111
 *       404:
 *         description: Announcement not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', apiAnnouncementController.getAnnouncementById);
router.put('/:id', apiAnnouncementController.updateAnnouncement);
router.patch('/:id', apiAnnouncementController.patchAnnouncement);
router.delete('/:id', apiAnnouncementController.deleteAnnouncement);

module.exports = router;
