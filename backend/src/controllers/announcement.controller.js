const path = require('path');
const fs = require('fs');
const announcementService = require('../services/announcement.service');

const viewsPath = path.resolve(__dirname, '../views');

/**
 * AnnouncementController
 * 
 * MVC View Controller for the Announcement domain.
 * Serves semantic HTML5 views, pre-hydrates initial announcements data for
 * zero-flicker loading, and handles browser form submissions gracefully.
 * 
 * Mapped to: /announcements
 */

/**
 * GET /announcements
 * Serves announcements.html with embedded initial announcements state
 */
const getAnnouncementsView = async (req, res, next) => {
  try {
    const items = await announcementService.getAllAnnouncements();
    const filePath = path.join(viewsPath, 'announcements.html');

    if (!fs.existsSync(filePath)) {
      return res.status(500).send('<h1>500 Internal Server Error</h1><p>View announcements.html not found.</p>');
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Dynamic Server-Side Hydration: inject initial seed data into placeholder
    const injectionScript = `<script id="initial-announcements-data" type="application/json">${JSON.stringify(items)}</script>`;
    if (html.includes('<!-- INITIAL_ANNOUNCEMENTS_DATA -->')) {
      html = html.replace('<!-- INITIAL_ANNOUNCEMENTS_DATA -->', injectionScript);
    } else {
      html = html.replace('</head>', `  ${injectionScript}\n</head>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /announcements/:id
 * Announcement detail view or redirection with view query
 */
const getAnnouncementDetailView = async (req, res, next) => {
  try {
    const item = await announcementService.getAnnouncementById(req.params.id);

    if (req.accepts('html') && !req.xhr && !req.headers['content-type']?.includes('application/json')) {
      return res.redirect(`/announcements?view=${encodeURIComponent(item.id)}`);
    }

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /announcements
 * Handles creation via standard HTML forms or AJAX
 */
const handleCreateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, author, priority } = req.body || {};
    const newItem = await announcementService.createAnnouncement({ title, content, category, author, priority });

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/announcements?status=created');
    }

    return res.status(201).json(newItem);
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/announcements?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

/**
 * POST /announcements/:id/delete or DELETE /announcements/:id
 * Handles deletion from HTML form actions or view AJAX
 */
const handleDeleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/announcements?status=deleted');
    }

    return res.status(200).json({
      status: 'success',
      message: 'Announcement deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/announcements?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

module.exports = {
  getAnnouncementsView,
  getAnnouncementDetailView,
  handleCreateAnnouncement,
  handleDeleteAnnouncement,
};
