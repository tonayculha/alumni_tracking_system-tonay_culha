const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Relax CSP header for Swagger UI documentation routes to allow interactive testing
const bypassCspForDocs = (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:;"
  );
  next();
};

// Serve raw OpenAPI JSON specification
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const swaggerUiOptions = {
  customSiteTitle: 'Alumni Tracking System API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
  },
};

// Mount Swagger UI on /docs
router.use(
  '/docs',
  bypassCspForDocs,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Mount Swagger UI on /swagger
router.use(
  '/swagger',
  bypassCspForDocs,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

module.exports = router;
