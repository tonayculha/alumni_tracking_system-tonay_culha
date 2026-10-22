const { applicationService } = require('../services/application.service');

/**
 * ApiApplicationController
 * 
 * REST API controller for Applications (both direct and nested routing).
 */

/**
 * GET /api/applications
 * List all job applications
 */
const getApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getAllApplications();
    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/applications/:id
 * Retrieve single application by UUID
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    return res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications
 * Direct creation of job application (requires userId and jobId in request body)
 */
const createApplication = async (req, res, next) => {
  try {
    const {
      userId,
      user_id,
      jobId,
      job_id,
      jobPostingId,
      job_posting_id,
      status,
    } = req.body || {};

    const effectiveUserId = userId || user_id;
    const effectiveJobId = jobId || job_id || jobPostingId || job_posting_id;

    const application = await applicationService.createApplication({
      userId: effectiveUserId,
      jobId: effectiveJobId,
      status,
    });
    return res.status(201).json(application);
  } catch (error) {
    if (error.statusCode === 409 || error.code === '23505' || error.name === 'Conflict') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User has already applied for this job posting',
      });
    }
    next(error);
  }
};

/**
 * GET /api/jobs/:id/applications
 * Nested route: Retrieve all applications submitted for job :id
 */
const getJobApplications = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const applications = await applicationService.getApplicationsByJobId(jobId);
    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/jobs/:id/applications
 * Nested route: Apply to job :id with userId in request body.
 * STRICT BUSINESS RULE: Verify both job and user exist. If user already applied,
 * catch unique constraint violation and return HTTP 409 Conflict:
 * { error: 'Conflict', message: 'User has already applied for this job posting' }
 */
const createJobApplication = async (req, res, next) => {
  try {
    const jobId = req.params.id; // Strictly from URL path parameter
    const { userId, user_id, status } = req.body || {};
    const effectiveUserId = userId || user_id;

    const application = await applicationService.createApplication({
      userId: effectiveUserId,
      jobId,
      status,
    });
    return res.status(201).json(application);
  } catch (error) {
    if (error.statusCode === 409 || error.code === '23505' || error.name === 'Conflict') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User has already applied for this job posting',
      });
    }
    next(error);
  }
};

/**
 * GET /api/users/:id/applications
 * Nested route: Retrieve all applications submitted by candidate user :id
 */
const getUserApplications = async (req, res, next) => {
  try {
    const userId = req.params.id; // From URL path parameter
    const applications = await applicationService.getApplicationsByUserId(userId);
    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/applications/:id
 * Delete application by UUID
 */
const deleteApplication = async (req, res, next) => {
  try {
    await applicationService.deleteApplication(req.params.id);
    return res.status(200).json({
      status: 'success',
      message: 'Application deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  getJobApplications,
  createJobApplication,
  getUserApplications,
  deleteApplication,
};
