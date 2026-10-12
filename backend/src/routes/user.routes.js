const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users View (MVC)
 *     summary: Render User Management Portal (HTML View)
 *     description: Serves the semantic HTML5 view for interactive in-browser user management, role inspection, and CRUD operations.
 *     responses:
 *       200:
 *         description: Semantic HTML user management dashboard.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<!DOCTYPE html><html><head><title>Alumni Tracking System | Users</title>..."
 *   post:
 *     tags:
 *       - Users View (MVC)
 *     summary: Handle User Creation Form Submission
 *     description: Accepts standard HTML form submissions or AJAX payloads to create a new user and redirects or returns the result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       302:
 *         description: Redirects back to /users on successful form submission.
 *       201:
 *         description: User created (AJAX clients).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error.
 */
router.get('/', userController.getUsersView);
router.post('/', userController.handleCreateUser);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users View (MVC)
 *     summary: Inspect User Detail HTML View
 *     description: Renders the details of a specific user or redirects to the dashboard with highlighting for the selected user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the user
 *     responses:
 *       200:
 *         description: User detail view or JSON representation.
 *       302:
 *         description: Redirects to /users with view query parameter.
 *       404:
 *         description: User not found.
 */
router.get('/:id', userController.getUserDetailView);
router.post('/:id/delete', userController.handleDeleteUser);
router.delete('/:id', userController.handleDeleteUser);

module.exports = router;
