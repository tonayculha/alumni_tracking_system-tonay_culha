const announcementService = require('../services/announcement.service');

/**
 * ApiAnnouncementController
 * 
 * REST API controller for Announcement entities.
 * Returns structured JSON responses for programmatic clients and Swagger.
 * 
 * Mapped to: /api/announcements
 */

/**
 * GET /api/announcements
 * Retrieve all announcements as JSON array
 */
const getAnnouncements = (req, res, next) => {
  try {
    const items = announcementService.getAllAnnouncements();
    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/announcements/:id
 * Retrieve announcement by UUID or 404
 */
const getAnnouncementById = (req, res, next) => {
  try {
    const item = announcementService.getAnnouncementById(req.params.id);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/announcements
 * Validates payload and creates a new announcement, returns 201 Created
 */
const createAnnouncement = (req, res, next) => {
  try {
    const { title, content, category, author, priority } = req.body || {};
    const newItem = announcementService.createAnnouncement({ title, content, category, author, priority });
    return res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/announcements/:id
 * Full idempotent update of existing announcement, returns 200 OK
 */
const updateAnnouncement = (req, res, next) => {
  try {
    const { title, content, category, author, priority } = req.body || {};
    const updatedItem = announcementService.updateAnnouncement(req.params.id, { title, content, category, author, priority });
    return res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/announcements/:id
 * Partial update of existing announcement, returns 200 OK
 */
const patchAnnouncement = (req, res, next) => {
  try {
    const updatedItem = announcementService.patchAnnouncement(req.params.id, req.body || {});
    return res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/announcements/:id
 * Removes announcement by ID, returns 200 OK with confirmation
 */
const deleteAnnouncement = (req, res, next) => {
  try {
    announcementService.deleteAnnouncement(req.params.id);
    return res.status(200).json({
      status: 'success',
      message: 'Announcement deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncement,
  deleteAnnouncement,
};
