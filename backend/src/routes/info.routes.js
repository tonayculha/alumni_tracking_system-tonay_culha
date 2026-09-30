const express = require('express');
const infoController = require('../controllers/info.controller');

const router = express.Router();

// GET /home and GET /about
router.get('/home', infoController.getHomeView);
router.get('/about', infoController.getAboutView);

module.exports = router;
