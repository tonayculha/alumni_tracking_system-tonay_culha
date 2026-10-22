const { query } = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ApplicationModel
 * 
 * Model layer for Application join entity backed by PostgreSQL 16 database.
 * Represents candidate applications submitted for job postings (N:M association).
 */
class ApplicationModel {
  /**
   * Helper to check valid UUID format
   * @param {string} id
   * @returns {boolean}
   */
  _isValidUuid(id) {
    return typeof id === 'string' && UUID_REGEX.test(id.trim());
  }

  /**
   * Normalize database row to standard domain object
   * @param {Object} row
   * @returns {Object|null}
   */
  _mapApplication(row) {
    if (!row) return null;
    const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
    const updatedAtIso = row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString();
    return {
      id: row.id,
      userId: row.user_id,
      user_id: row.user_id,
      jobPostingId: row.job_posting_id,
      job_posting_id: row.job_posting_id,
      status: row.status,
      createdAt: createdAtIso,
      updatedAt: updatedAtIso,
      created_at: createdAtIso,
      updated_at: updatedAtIso,
    };
  }

  /**
   * Retrieve all applications
   * @returns {Promise<Array<Object>>}
   */
  async findAll() {
    const res = await query(
      `SELECT id, user_id, job_posting_id, status, created_at, updated_at 
       FROM applications 
       ORDER BY created_at DESC`
    );
    return res.rows.map((row) => this._mapApplication(row));
  }

  /**
   * Find a single application by UUID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (!this._isValidUuid(id)) return null;
    const res = await query(
      `SELECT id, user_id, job_posting_id, status, created_at, updated_at 
       FROM applications 
       WHERE id = $1`,
      [id.trim()]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapApplication(res.rows[0]);
  }

  /**
   * Find all applications submitted for a specific job posting
   * @param {string} jobId
   * @returns {Promise<Array<Object>>}
   */
  async findByJobId(jobId) {
    if (!this._isValidUuid(jobId)) return [];
    const res = await query(
      `SELECT id, user_id, job_posting_id, status, created_at, updated_at 
       FROM applications 
       WHERE job_posting_id = $1 
       ORDER BY created_at DESC`,
      [jobId.trim()]
    );
    return res.rows.map((row) => this._mapApplication(row));
  }

  /**
   * Find all applications submitted by a specific user
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async findByUserId(userId) {
    if (!this._isValidUuid(userId)) return [];
    const res = await query(
      `SELECT id, user_id, job_posting_id, status, created_at, updated_at 
       FROM applications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId.trim()]
    );
    return res.rows.map((row) => this._mapApplication(row));
  }

  /**
   * Find existing application for a specific user and job posting pair
   * @param {string} userId
   * @param {string} jobId
   * @returns {Promise<Object|null>}
   */
  async findPair(userId, jobId) {
    if (!this._isValidUuid(userId) || !this._isValidUuid(jobId)) return null;
    const res = await query(
      `SELECT id, user_id, job_posting_id, status, created_at, updated_at 
       FROM applications 
       WHERE user_id = $1 AND job_posting_id = $2`,
      [userId.trim(), jobId.trim()]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapApplication(res.rows[0]);
  }

  /**
   * Create and persist a new job application
   * Differentiates unique constraint violation (23505) cleanly.
   * @param {Object} data
   * @param {string} data.userId
   * @param {string} data.jobId
   * @param {string} [data.status='applied']
   * @returns {Promise<Object>}
   */
  async create({ userId, jobId, status = 'applied' }) {
    const cleanUserId = userId ? userId.trim() : null;
    const cleanJobId = jobId ? jobId.trim() : null;
    const cleanStatus = status ? status.trim() : 'applied';

    try {
      const res = await query(
        `INSERT INTO applications (id, user_id, job_posting_id, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         RETURNING id, user_id, job_posting_id, status, created_at, updated_at`,
        [cleanUserId, cleanJobId, cleanStatus]
      );
      return this._mapApplication(res.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        const conflictErr = new Error('User has already applied for this job posting');
        conflictErr.name = 'Conflict';
        conflictErr.statusCode = 409;
        conflictErr.code = '23505';
        throw conflictErr;
      }
      throw err;
    }
  }

  /**
   * Delete application by UUID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!this._isValidUuid(id)) return false;
    const res = await query('DELETE FROM applications WHERE id = $1', [id.trim()]);
    return res.rowCount > 0;
  }

  // Static convenience wrappers
  static findAll() { return applicationModel.findAll(); }
  static findById(id) { return applicationModel.findById(id); }
  static findByJobId(jobId) { return applicationModel.findByJobId(jobId); }
  static findByUserId(userId) { return applicationModel.findByUserId(userId); }
  static findPair(userId, jobId) { return applicationModel.findPair(userId, jobId); }
  static create(data) { return applicationModel.create(data); }
  static delete(id) { return applicationModel.delete(id); }
}

const applicationModel = new ApplicationModel();

module.exports = {
  ApplicationModel,
  applicationModel,
};
