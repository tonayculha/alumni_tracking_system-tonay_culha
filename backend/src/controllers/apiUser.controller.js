const userService = require('../services/user.service');

/**
 * ApiUserController
 * 
 * Dedicated REST API controller for User entity.
 * Directly produces structured JSON envelopes with standard HTTP status codes
 * (200, 201, 400, 404, 409) for programmatic REST API clients and Swagger.
 * 
 * Mapped to: /api/users
 */

/**
 * GET /api/users
 * Returns array of all users as JSON
 */
const getUsers = (req, res, next) => {
  try {
    const users = userService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Returns single user by UUID or 404
 */
const getUserById = (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Validates payload and creates a new user, returns 201 Created
 */
const createUser = (req, res, next) => {
  try {
    const { name, email, role } = req.body || {};
    const newUser = userService.createUser({ name, email, role });
    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Full idempotent update of existing user, returns 200 OK
 */
const updateUser = (req, res, next) => {
  try {
    const { name, email, role } = req.body || {};
    const updatedUser = userService.updateUser(req.params.id, { name, email, role });
    return res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id
 * Partial update of existing user fields, returns 200 OK
 */
const patchUser = (req, res, next) => {
  try {
    const updatedUser = userService.patchUser(req.params.id, req.body || {});
    return res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Removes user from in-memory store, returns 200 with confirmation envelope
 */
const deleteUser = (req, res, next) => {
  try {
    userService.deleteUser(req.params.id);
    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
