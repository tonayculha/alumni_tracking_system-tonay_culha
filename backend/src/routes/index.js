const express = require('express');
const healthRoutes = require('./health.routes');
const greetingRoutes = require('./greeting.routes');
const mathRoutes = require('./math.routes');
const infoRoutes = require('./info.routes');
const apiRoutes = require('./api.routes');
const userRoutes = require('./user.routes');
const announcementRoutes = require('./announcement.routes');

const router = express.Router();

// Mount Week 3 & 4 API routes under /api prefix (/api/health, /api/users, /api/announcements, /api/swagger, /api/docs)
router.use('/api', apiRoutes);

// Mount Week 4 MVC User View routes under /users (Semantic HTML view, UserController)
router.use('/users', userRoutes);

// Mount Week 4 Homework MVC Announcement View routes under /announcements (Semantic HTML view, AnnouncementController)
router.use('/announcements', announcementRoutes);

// Root redirects for documentation convenience
router.get('/docs', (req, res) => res.redirect('/api/docs'));
router.get('/swagger', (req, res) => res.redirect('/api/swagger'));

// Mount domain routes for Week 1 & 2 backwards compatibility
router.use('/', healthRoutes);
router.use('/', infoRoutes);
router.use('/hello', greetingRoutes);
router.use('/sum', mathRoutes);

module.exports = router;
