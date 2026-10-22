const { jobPostingModel } = require('../models/jobPosting.model');
const { userModel } = require('../models/user.model');

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
  constructor(message = 'Job posting not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Validate job posting payload
 * @param {Object} data
 * @param {boolean} isPartial
 */
function validateJobData(data, isPartial = false) {
  const errors = [];

  if (!isPartial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 2) {
      errors.push('Field "title" is required and must be at least 2 characters long.');
    }
  }

  if (!isPartial || data.company !== undefined) {
    if (typeof data.company !== 'string' || data.company.trim().length < 2) {
      errors.push('Field "company" is required and must be at least 2 characters long.');
    }
  }

  if (data.location !== undefined && data.location !== null) {
    if (typeof data.location !== 'string') {
      errors.push('Field "location" must be a string.');
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push('Field "description" must be a string.');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for job posting payload', errors);
  }
}

/**
 * Job Posting Service
 */
class JobPostingService {
  /**
   * Retrieve all job postings
   * @param {Object} [filters]
   * @returns {Promise<Array<Object>>}
   */
  async getAllJobPostings(filters = {}) {
    return jobPostingModel.findAll(filters);
  }

  /**
   * Retrieve job posting by UUID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getJobPostingById(id) {
    const job = await jobPostingModel.findById(id);
    if (!job) {
      throw new NotFoundError(`Job posting with ID "${id}" not found`);
    }
    return job;
  }

  /**
   * Retrieve all jobs published by a specific user
   * Verifies that the user exists first.
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async getJobPostingsByUserId(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }
    return jobPostingModel.findByUserId(userId);
  }

  /**
   * Create a new job posting
   * Verifies author user exists before insertion.
   * @param {Object} data
   * @param {string} data.userId
   * @param {string} data.title
   * @param {string} data.company
   * @param {string} [data.location]
   * @param {string} [data.description]
   * @returns {Promise<Object>}
   */
  async createJobPosting({ userId, title, company, location, description }) {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Field "userId" is required and must be a valid UUID string.');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }

    validateJobData({ title, company, location, description }, false);

    return jobPostingModel.create({
      userId,
      title,
      company,
      location,
      description,
    });
  }

  /**
   * Update existing job posting
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateJobPosting(id, data = {}) {
    await this.getJobPostingById(id);
    validateJobData(data, true);

    const updated = await jobPostingModel.update(id, data);
    return updated;
  }

  /**
   * Delete job posting by UUID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteJobPosting(id) {
    await this.getJobPostingById(id);
    return jobPostingModel.delete(id);
  }
}

const jobPostingService = new JobPostingService();

module.exports = {
  jobPostingService,
  JobPostingService,
  AppError,
  ValidationError,
  NotFoundError,
};
