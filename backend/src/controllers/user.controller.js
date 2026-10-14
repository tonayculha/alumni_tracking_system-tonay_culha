const path = require('path');
const fs = require('fs');
const userService = require('../services/user.service');

const viewsPath = path.resolve(__dirname, '../views');

/**
 * UserController
 * 
 * Dedicated MVC View Controller for the User domain.
 * Serves semantic HTML5 views, injects server-side rendered seed data into
 * the HTML template for immediate client hydration, and gracefully handles
 * both standard browser form submissions and AJAX requests.
 * 
 * Mapped to: /users
 */

/**
 * GET /users
 * Serves the semantic HTML user management portal (users.html) with embedded initial users state
 */
const getUsersView = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    const filePath = path.join(viewsPath, 'users.html');

    if (!fs.existsSync(filePath)) {
      return res.status(500).send('<h1>500 Internal Server Error</h1><p>View users.html not found.</p>');
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Dynamic Server-Side Hydration: inject initial seed data into placeholder
    const injectionScript = `<script id="initial-users-data" type="application/json">${JSON.stringify(users)}</script>`;
    if (html.includes('<!-- INITIAL_USERS_DATA -->')) {
      html = html.replace('<!-- INITIAL_USERS_DATA -->', injectionScript);
    } else {
      // Fallback injection before closing </head>
      html = html.replace('</head>', `  ${injectionScript}\n</head>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/:id
 * User detail view or redirection with view query parameter
 */
const getUserDetailView = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    // If browser client requests HTML, redirect to main view highlighting this user
    if (req.accepts('html') && !req.xhr && !req.headers['content-type']?.includes('application/json')) {
      return res.redirect(`/users?view=${encodeURIComponent(user.id)}`);
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /users
 * Handles user creation via standard HTML forms (x-www-form-urlencoded) or direct view AJAX
 */
const handleCreateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body || {};
    const newUser = await userService.createUser({ name, email, role });

    // Standard HTML form submission redirect
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/users?status=created');
    }

    return res.status(201).json(newUser);
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

/**
 * POST /users/:id/delete or DELETE /users/:id
 * Handles user deletion from standard HTML form actions or view AJAX
 */
const handleDeleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/users?status=deleted');
    }

    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

module.exports = {
  getUsersView,
  getUserDetailView,
  handleCreateUser,
  handleDeleteUser,
};
