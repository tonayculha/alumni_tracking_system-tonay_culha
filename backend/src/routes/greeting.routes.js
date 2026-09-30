const express = require('express');
const greetingController = require('../controllers/greeting.controller');

const router = express.Router();

// GET /hello/:name
router.get('/:name', greetingController.getGreeting);

module.exports = router;
