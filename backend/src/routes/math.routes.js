const express = require('express');
const mathController = require('../controllers/math.controller');

const router = express.Router();

// GET /sum/:number1/:number2
router.get('/:number1/:number2', mathController.getSum);

module.exports = router;
