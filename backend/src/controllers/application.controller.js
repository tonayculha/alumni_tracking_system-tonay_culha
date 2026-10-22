const path = require('path');
const fs = require('fs');
const { applicationService } = require('../services/application.service');
const { jobPostingService } = require('../services/jobPosting.service');
const userService = require('../services/user.service');

const viewsPath = path.resolve(__dirname, '../views');

/**
 * ApplicationViewController
 * 
 * MVC View Controller for the Job Applications domain.
 * Serves semantic HTML5 views, pre-hydrates initial applications, candidate users,
 * and job vacancies for responsive dashboard rendering, and handles form submissions.
 * 
 * Mapped to: /applications
 */

/**
 * GET /applications
 * Serves applications.html with embedded initial applications, jobs, and users state
 */
const getApplicationsView = async (req, res, next) => {
  try {
    const [applications, jobs, users] = await Promise.all([
      applicationService.getAllApplications(),
      jobPostingService.getAllJobPostings(),
      userService.getAllUsers(),
    ]);

    const filePath = path.join(viewsPath, 'applications.html');
    if (!fs.existsSync(filePath)) {
      return res.status(500).send('<h1>500 Internal Server Error</h1><p>View applications.html not found.</p>');
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Server-Side Hydration: inject initial seed data
    const appsScript = `<script id="initial-applications-data" type="application/json">${JSON.stringify(applications)}</script>`;
    const jobsScript = `<script id="initial-jobs-data" type="application/json">${JSON.stringify(jobs)}</script>`;
    const usersScript = `<script id="initial-users-data" type="application/json">${JSON.stringify(users)}</script>`;

    if (html.includes('<!-- INITIAL_APPLICATIONS_DATA -->')) {
      html = html.replace('<!-- INITIAL_APPLICATIONS_DATA -->', `${appsScript}\n  ${jobsScript}\n  ${usersScript}`);
    } else {
      html = html.replace('</head>', `  ${appsScript}\n  ${jobsScript}\n  ${usersScript}\n</head>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /applications/:id
 * Application detail view or redirection with view query
 */
const getApplicationDetailView = async (req, res, next) => {
  try {
    const appItem = await applicationService.getApplicationById(req.params.id);

    if (req.accepts('html') && !req.xhr && !req.headers['content-type']?.includes('application/json')) {
      return res.redirect(`/applications?view=${encodeURIComponent(appItem.id)}`);
    }

    return res.status(200).json(appItem);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /applications
 * Handles creation via standard HTML forms or AJAX
 */
const handleCreateApplication = async (req, res, next) => {
  try {
    const { userId, user_id, jobId, job_id, status } = req.body || {};
    const effectiveUserId = userId || user_id;
    const effectiveJobId = jobId || job_id;

    const newApp = await applicationService.createApplication({
      userId: effectiveUserId,
      jobId: effectiveJobId,
      status: status || 'applied',
    });

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/applications?status=created');
    }

    return res.status(201).json(newApp);
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      const isConflict = error.statusCode === 409 || error.code === '23505';
      const errorMsg = isConflict ? 'User has already applied for this job posting' : error.message;
      return res.redirect(`/applications?error=${encodeURIComponent(errorMsg)}`);
    }
    next(error);
  }
};

/**
 * POST /applications/:id/delete or DELETE /applications/:id
 * Handles deletion from HTML form actions or view AJAX
 */
const handleDeleteApplication = async (req, res, next) => {
  try {
    await applicationService.deleteApplication(req.params.id);

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/applications?status=deleted');
    }

    return res.status(200).json({
      status: 'success',
      message: 'Application deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/applications?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

module.exports = {
  getApplicationsView,
  getApplicationDetailView,
  handleCreateApplication,
  handleDeleteApplication,
};
