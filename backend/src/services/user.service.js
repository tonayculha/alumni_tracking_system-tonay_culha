const { userModel } = require('../models/user.model');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'User not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict: Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Validate input fields for user creation/update
 * @param {Object} data
 * @param {boolean} isPartial
 */
function validateUserData(data, isPartial = false) {
  const errors = [];

  if (!isPartial || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Field "name" is required and must be at least 2 characters long.');
    }
  }

  if (!isPartial || data.email !== undefined) {
    if (typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
      errors.push('Field "email" is required and must be a valid email address.');
    }
  }

  if (!isPartial || data.role !== undefined) {
    if (typeof data.role !== 'string' || data.role.trim().length === 0) {
      errors.push('Field "role" is required and must be a non-empty string.');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for user payload', errors);
  }
}

/**
 * Retrieve all users
 * @returns {Array<Object>}
 */
const getAllUsers = () => {
  return userModel.findAll();
};

/**
 * Retrieve single user by ID
 * @param {string} id
 * @returns {Object}
 */
const getUserById = (id) => {
  const user = userModel.findById(id);
  if (!user) {
    throw new NotFoundError(`User with id "${id}" not found.`);
  }
  return user;
};

/**
 * Create a new user
 * @param {Object} payload
 * @returns {Object}
 */
const createUser = ({ name, email, role }) => {
  validateUserData({ name, email, role }, false);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = userModel.findByEmail(normalizedEmail);
  if (existing) {
    throw new ConflictError(`User with email "${normalizedEmail}" already exists.`);
  }

  return userModel.create({ name, email: normalizedEmail, role });
};

/**
 * Full update of an existing user (PUT)
 * @param {string} id
 * @param {Object} payload
 * @returns {Object}
 */
const updateUser = (id, { name, email, role }) => {
  const existing = userModel.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with id "${id}" not found.`);
  }

  validateUserData({ name, email, role }, false);

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== existing.email.toLowerCase()) {
    const emailConflict = userModel.findByEmail(normalizedEmail);
    if (emailConflict && emailConflict.id !== id) {
      throw new ConflictError(`User with email "${normalizedEmail}" already exists.`);
    }
  }

  return userModel.update(id, { name, email: normalizedEmail, role });
};

/**
 * Partial update of an existing user (PATCH)
 * @param {string} id
 * @param {Object} payload
 * @returns {Object}
 */
const patchUser = (id, fields) => {
  const existing = userModel.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with id "${id}" not found.`);
  }

  if (!fields || Object.keys(fields).length === 0) {
    throw new ValidationError('At least one field (name, email, role) must be provided for update.');
  }

  const allowedFields = ['name', 'email', 'role'];
  const updateData = {};

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      updateData[key] = fields[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No valid updatable fields provided.');
  }

  validateUserData(updateData, true);

  if (updateData.email) {
    const normalizedEmail = updateData.email.trim().toLowerCase();
    if (normalizedEmail !== existing.email.toLowerCase()) {
      const emailConflict = userModel.findByEmail(normalizedEmail);
      if (emailConflict && emailConflict.id !== id) {
        throw new ConflictError(`User with email "${normalizedEmail}" already exists.`);
      }
    }
    updateData.email = normalizedEmail;
  }

  return userModel.update(id, updateData);
};

/**
 * Delete a user by ID
 * @param {string} id
 * @returns {boolean}
 */
const deleteUser = (id) => {
  const existing = userModel.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with id "${id}" not found.`);
  }

  return userModel.delete(id);
};

/**
 * Reset store to seed data (useful for test isolation)
 */
const resetUsers = () => {
  userModel.reset();
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  resetUsers,
  ValidationError,
  NotFoundError,
  ConflictError,
};
