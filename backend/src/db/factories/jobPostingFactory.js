const { query } = require('../../config/db');
const { jobPostingModel } = require('../../models/jobPosting.model');

/**
 * JobPostingFactory
 *
 * Factory utility to generate, build, and seed job posting fixtures linked to
 * valid user entities in the PostgreSQL database.
 */
class JobPostingFactory {
  /**
   * Predefined baseline seed job templates linked to default seed users.
   * Ada Lovelace (admin): '11111111-1111-4111-a111-111111111111'
   * Alan Turing (alumni): '22222222-2222-4222-a222-222222222222'
   * Grace Hopper (alumni): '33333333-3333-4333-a333-333333333333'
   */
  static getSeedJobDefinitions(userIds = []) {
    const user1 = userIds[0] || '11111111-1111-4111-a111-111111111111';
    const user2 = userIds[1] || '22222222-2222-4222-a222-222222222222';
    const user3 = userIds[2] || '33333333-3333-4333-a333-333333333333';

    return [
      {
        id: '55555555-5555-4555-a555-555555555555',
        userId: user1,
        title: 'Senior Distributed Systems Architect',
        company: 'CloudScale Technologies',
        location: 'San Francisco, CA (Hybrid)',
        description: 'Design and implement high-throughput distributed state machines, consensus protocols, and low-latency gRPC microservices.',
      },
      {
        id: '66666666-6666-4666-a666-666666666666',
        userId: user2,
        title: 'Lead Quantum Software Engineer',
        company: 'Turing Quantum Systems',
        location: 'Cambridge, MA (Remote)',
        description: 'Architecting quantum circuit simulation algorithms and fault-tolerant intermediate representations for next-generation QPU execution.',
      },
      {
        id: '77777777-7777-4777-a777-777777777777',
        userId: user3,
        title: 'Principal Compiler Optimization Engineer',
        company: 'Hopper Systems Labs',
        location: 'New York, NY (On-site)',
        description: 'Leading compiler backend optimization, LLVM intermediate representations, and automated vectorized instruction generation.',
      },
      {
        id: '88888888-8888-4888-a888-888888888888',
        userId: user1,
        title: 'Full-Stack Platform Engineer',
        company: 'NextGen Financial Systems',
        location: 'London, UK (Hybrid)',
        description: 'Developing mission-critical financial ledger APIs and real-time transaction reconciliation engines using Node.js and PostgreSQL.',
      },
    ];
  }

  /**
   * Build an in-memory job posting fixture without persisting to DB.
   * @param {Object} [overrides]
   * @returns {Object}
   */
  static build(overrides = {}) {
    return {
      userId: overrides.userId || '11111111-1111-4111-a111-111111111111',
      title: overrides.title || 'Senior Software Engineer',
      company: overrides.company || 'Modern Tech Innovations',
      location: overrides.location || 'Remote',
      description: overrides.description || 'Designing scalable distributed services and resilient cloud systems.',
      ...overrides,
    };
  }

  /**
   * Create and persist a job posting fixture in PostgreSQL.
   * @param {Object} [overrides]
   * @returns {Promise<Object>}
   */
  static async create(overrides = {}) {
    const fixture = this.build(overrides);
    return jobPostingModel.create(fixture);
  }

  /**
   * Seed multiple job postings linked to existing database users idempotently.
   * @param {Array<string>} [explicitUserIds]
   * @returns {Promise<Array<Object>>}
   */
  static async seed(explicitUserIds = []) {
    let targetUserIds = explicitUserIds;

    // If no explicit user IDs provided, discover existing registered users from DB
    if (!targetUserIds || targetUserIds.length === 0) {
      const usersResult = await query('SELECT id FROM users ORDER BY created_at ASC');
      targetUserIds = usersResult.rows.map((row) => row.id);
    }

    if (!targetUserIds || targetUserIds.length === 0) {
      throw new Error('Cannot seed job postings: No users exist in database to link as authors.');
    }

    const jobDefs = this.getSeedJobDefinitions(targetUserIds);
    const seededJobs = [];

    for (const job of jobDefs) {
      const res = await query(
        `INSERT INTO job_postings (id, user_id, title, company, location, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           title = EXCLUDED.title,
           company = EXCLUDED.company,
           location = EXCLUDED.location,
           description = EXCLUDED.description,
           updated_at = NOW()
         RETURNING id, user_id, title, company, location, description, created_at, updated_at`,
        [job.id, job.userId, job.title, job.company, job.location, job.description]
      );
      seededJobs.push(jobPostingModel._mapJob(res.rows[0]));
    }

    return seededJobs;
  }

  // Instance methods delegating to class implementations
  getSeedJobDefinitions(userIds) {
    return JobPostingFactory.getSeedJobDefinitions(userIds);
  }

  build(overrides) {
    return JobPostingFactory.build(overrides);
  }

  create(overrides) {
    return JobPostingFactory.create(overrides);
  }

  seed(explicitUserIds) {
    return JobPostingFactory.seed(explicitUserIds);
  }
}

const jobPostingFactory = new JobPostingFactory();

module.exports = {
  JobPostingFactory,
  jobPostingFactory,
};
