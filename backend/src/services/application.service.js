const { applicationModel } = require('../models/application.model');
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
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'User has already applied for this job posting') {
    super(message, 409);
    this.name = 'Conflict';
    this.code = '23505';
  }
}

const ALLOWED_STATUSES = ['applied', 'interview', 'accepted', 'rejected'];

/**
 * Application Service
 */
class ApplicationService {
  /**
   * Retrieve all applications
   * @returns {Promise<Array<Object>>}
   */
  async getAllApplications() {
    return applicationModel.findAll();
  }

  /**
   * Retrieve single application by UUID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getApplicationById(id) {
    const app = await applicationModel.findById(id);
    if (!app) {
      throw new NotFoundError(`Application with ID "${id}" not found`);
    }
    return app;
  }

  /**
   * Retrieve all applications for a specific job posting
   * Verifies job posting exists first.
   * @param {string} jobId
   * @returns {Promise<Array<Object>>}
   */
  async getApplicationsByJobId(jobId) {
    const job = await jobPostingModel.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job posting with ID "${jobId}" not found`);
    }
    return applicationModel.findByJobId(jobId);
  }

  /**
   * Retrieve all applications submitted by a specific user
   * Verifies user exists first.
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async getApplicationsByUserId(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }
    return applicationModel.findByUserId(userId);
  }

  /**
   * Create an application
   * Business rules:
   * 1. Verify user exists (404 if not).
   * 2. Verify job posting exists (404 if not).
   * 3. Validate status if provided.
   * 4. Enforce uniqueness: If user already applied, throw ConflictError (409).
   * @param {Object} data
   * @param {string} data.userId
   * @param {string} data.jobId
   * @param {string} [data.status='applied']
   * @returns {Promise<Object>}
   */
  async createApplication({ userId, jobId, status = 'applied' }) {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Field "userId" is required and must be a valid UUID string.');
    }
    if (!jobId || typeof jobId !== 'string') {
      throw new ValidationError('Field "jobId" is required and must be a valid UUID string.');
    }

    if (status && !ALLOWED_STATUSES.includes(status.trim().toLowerCase())) {
      throw new ValidationError(
        `Field "status" must be one of: ${ALLOWED_STATUSES.join(', ')}`
      );
    }

    // Verify User exists
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }

    // Verify Job Posting exists
    const job = await jobPostingModel.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job posting with ID "${jobId}" not found`);
    }

    // Check existing application pair
    const existing = await applicationModel.findPair(userId, jobId);
    if (existing) {
      throw new ConflictError('User has already applied for this job posting');
    }

    return applicationModel.create({
      userId,
      jobId,
      status: status ? status.trim().toLowerCase() : 'applied',
    });
  }

  /**
   * Delete application by UUID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteApplication(id) {
    await this.getApplicationById(id);
    return applicationModel.delete(id);
  }
}

const applicationService = new ApplicationService();

module.exports = {
  applicationService,
  ApplicationService,
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
};
