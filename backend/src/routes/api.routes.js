const express = require('express');
const healthRoutes = require('./health.routes');
const userRoutes = require('./user.routes');
const swaggerRoutes = require('./swagger.routes');

const router = express.Router();

// Mount Health Check under /api/health
router.use('/', healthRoutes);

// Mount In-Memory User CRUD under /api/users
router.use('/users', userRoutes);

// Mount Swagger & OpenAPI Documentation under /api/swagger, /api/docs
router.use('/', swaggerRoutes);

module.exports = router;
