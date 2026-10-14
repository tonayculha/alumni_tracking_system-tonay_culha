const { announcementModel } = require('../models/announcement.model');

const ALLOWED_CATEGORIES = ['academic', 'career', 'social'];
const ALLOWED_PRIORITIES = ['low', 'normal', 'urgent'];

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
  constructor(message = 'Announcement not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Validate announcement data payload
 * @param {Object} data
 * @param {boolean} isPartial
 */
function validateAnnouncementData(data, isPartial = false) {
  const errors = [];

  if (!isPartial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Field "title" is required and must be at least 3 characters long.');
    }
  }

  if (!isPartial || data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.trim().length < 5) {
      errors.push('Field "content" is required and must be at least 5 characters long.');
    }
  }

  if (!isPartial || data.category !== undefined) {
    if (typeof data.category !== 'string' || !ALLOWED_CATEGORIES.includes(data.category.trim().toLowerCase())) {
      errors.push(`Field "category" must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
    }
  }

  if (!isPartial || data.author !== undefined) {
    if (typeof data.author !== 'string' || data.author.trim().length < 2) {
      errors.push('Field "author" is required and must be at least 2 characters long.');
    }
  }

  if (!isPartial || data.priority !== undefined) {
    if (typeof data.priority !== 'string' || !ALLOWED_PRIORITIES.includes(data.priority.trim().toLowerCase())) {
      errors.push(`Field "priority" must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for announcement payload', errors);
  }
}

/**
 * Retrieve all announcements
 * @returns {Promise<Array<Object>>}
 */
const getAllAnnouncements = async () => {
  return await announcementModel.findAll();
};

/**
 * Retrieve single announcement by UUID
 * @param {string} id
 * @returns {Promise<Object>}
 */
const getAnnouncementById = async (id) => {
  const item = await announcementModel.findById(id);
  if (!item) {
    throw new NotFoundError(`Announcement with id "${id}" not found.`);
  }
  return item;
};

/**
 * Create a new announcement
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
const createAnnouncement = async ({ title, content, category, author, priority }) => {
  validateAnnouncementData({ title, content, category, author, priority }, false);

  return await announcementModel.create({
    title,
    content,
    category: category.trim().toLowerCase(),
    author,
    priority: priority ? priority.trim().toLowerCase() : 'normal',
  });
};

/**
 * Full update of an existing announcement (PUT)
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
const updateAnnouncement = async (id, { title, content, category, author, priority }) => {
  const existing = await announcementModel.findById(id);
  if (!existing) {
    throw new NotFoundError(`Announcement with id "${id}" not found.`);
  }

  validateAnnouncementData({ title, content, category, author, priority }, false);

  return await announcementModel.update(id, {
    title,
    content,
    category: category.trim().toLowerCase(),
    author,
    priority: priority ? priority.trim().toLowerCase() : 'normal',
  });
};

/**
 * Partial update of an existing announcement (PATCH)
 * @param {string} id
 * @param {Object} fields
 * @returns {Promise<Object>}
 */
const patchAnnouncement = async (id, fields) => {
  const existing = await announcementModel.findById(id);
  if (!existing) {
    throw new NotFoundError(`Announcement with id "${id}" not found.`);
  }

  if (!fields || Object.keys(fields).length === 0) {
    throw new ValidationError('At least one updatable field must be provided.');
  }

  const allowedFields = ['title', 'content', 'category', 'author', 'priority'];
  const updateData = {};

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      updateData[key] = fields[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No valid updatable fields provided.');
  }

  validateAnnouncementData(updateData, true);

  return await announcementModel.update(id, updateData);
};

/**
 * Delete announcement by ID
 * @param {string} id
 * @returns {Promise<boolean>}
 */
const deleteAnnouncement = async (id) => {
  const existing = await announcementModel.findById(id);
  if (!existing) {
    throw new NotFoundError(`Announcement with id "${id}" not found.`);
  }

  return await announcementModel.delete(id);
};

/**
 * Reset announcements store (useful for tests)
 * @returns {Promise<void>}
 */
const resetAnnouncements = async () => {
  await announcementModel.reset();
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncement,
  deleteAnnouncement,
  resetAnnouncements,
  ValidationError,
  NotFoundError,
};
