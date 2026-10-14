const { query } = require('../config/db');
const crypto = require('crypto');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Initial Seed Announcements (Week 5: PostgreSQL Database Integration)
 */
const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'a1111111-1111-4111-a111-111111111111',
    title: 'Annual Alumni Homecoming 2026',
    content: 'Join us for the Annual Alumni Homecoming Gala on campus. Reconnect with fellow graduates, explore our new research centers, and enjoy keynote speeches from prominent alumni.',
    category: 'social',
    author: 'Alumni Relations Office',
    priority: 'urgent',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'b2222222-2222-4222-a222-222222222222',
    title: 'Fall Tech & Engineering Career Fair 2026',
    content: 'Over 80 partner engineering and technology firms will be hiring on-site for internship, graduate, and experienced alumni roles. Register your portfolio in advance.',
    category: 'career',
    author: 'Career Development Center',
    priority: 'normal',
    createdAt: '2026-09-15T14:30:00.000Z',
    updatedAt: '2026-09-15T14:30:00.000Z',
  },
  {
    id: 'c3333333-3333-4333-a333-333333333333',
    title: 'Distinguished Guest Speaker Series: Quantum Computing',
    content: 'Keynote lecture on Quantum Algorithms and Next-Generation Cloud Systems delivered by Turing Award laureates in the main auditorium and streamed worldwide.',
    category: 'academic',
    author: 'School of Computing & Engineering',
    priority: 'normal',
    createdAt: '2026-10-01T09:15:00.000Z',
    updatedAt: '2026-10-01T09:15:00.000Z',
  },
];

/**
 * AnnouncementModel
 * 
 * Model layer for Announcement entity backed by PostgreSQL 16 database.
 * Executes parameterized SQL queries via pg connection pool.
 */
class AnnouncementModel {
  /**
   * Normalize database row to standard announcement domain object
   * @param {Object} row
   * @returns {Object|null}
   */
  _mapAnnouncement(row) {
    if (!row) return null;
    const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
    const updatedAtIso = row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString();
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      author: row.author,
      priority: row.priority,
      createdAt: row.createdAt || createdAtIso,
      updatedAt: row.updatedAt || updatedAtIso,
      created_at: row.created_at || createdAtIso,
      updated_at: row.updated_at || updatedAtIso,
    };
  }

  /**
   * Retrieve all announcements from PostgreSQL ordered by created_at DESC
   * @returns {Promise<Array<Object>>}
   */
  async findAll() {
    const res = await query(
      'SELECT id, title, content, category, author, priority, created_at, updated_at FROM announcements ORDER BY created_at DESC'
    );
    return res.rows.map((row) => this._mapAnnouncement(row));
  }

  /**
   * Retrieve announcement by UUID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) return null;
    const res = await query(
      'SELECT id, title, content, category, author, priority, created_at, updated_at FROM announcements WHERE id = $1',
      [id]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapAnnouncement(res.rows[0]);
  }

  /**
   * Create and store a new announcement in PostgreSQL
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create({ title, content, category, author, priority, id }) {
    const itemId = id || crypto.randomUUID();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanCategory = category.trim().toLowerCase();
    const cleanAuthor = author.trim();
    const cleanPriority = (priority || 'normal').trim().toLowerCase();

    const res = await query(
      `INSERT INTO announcements (id, title, content, category, author, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, title, content, category, author, priority, created_at, updated_at`,
      [itemId, cleanTitle, cleanContent, cleanCategory, cleanAuthor, cleanPriority]
    );
    return this._mapAnnouncement(res.rows[0]);
  }

  /**
   * Update an existing announcement in PostgreSQL
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) return null;

    const sets = [];
    const values = [id];
    let idx = 2;

    if (updateData.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(updateData.title.trim());
    }
    if (updateData.content !== undefined) {
      sets.push(`content = $${idx++}`);
      values.push(updateData.content.trim());
    }
    if (updateData.category !== undefined) {
      sets.push(`category = $${idx++}`);
      values.push(updateData.category.trim().toLowerCase());
    }
    if (updateData.author !== undefined) {
      sets.push(`author = $${idx++}`);
      values.push(updateData.author.trim());
    }
    if (updateData.priority !== undefined) {
      sets.push(`priority = $${idx++}`);
      values.push(updateData.priority.trim().toLowerCase());
    }

    if (sets.length === 0) {
      return this.findById(id);
    }

    sets.push(`updated_at = NOW()`);
    const sql = `UPDATE announcements SET ${sets.join(', ')} WHERE id = $1 RETURNING id, title, content, category, author, priority, created_at, updated_at`;
    const res = await query(sql, values);
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapAnnouncement(res.rows[0]);
  }

  /**
   * Delete announcement by UUID from PostgreSQL
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) return false;
    const res = await query('DELETE FROM announcements WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  /**
   * Return count of stored announcements in PostgreSQL
   * @returns {Promise<number>}
   */
  async count() {
    const res = await query('SELECT COUNT(*) AS count FROM announcements');
    return parseInt(res.rows[0].count, 10);
  }

  /**
   * Reset announcements table to initial seed records
   * @returns {Promise<void>}
   */
  async reset() {
    await query('DELETE FROM announcements');
    for (const a of INITIAL_ANNOUNCEMENTS) {
      await query(
        `INSERT INTO announcements (id, title, content, category, author, priority, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           content = EXCLUDED.content,
           category = EXCLUDED.category,
           author = EXCLUDED.author,
           priority = EXCLUDED.priority,
           updated_at = EXCLUDED.updated_at`,
        [a.id, a.title, a.content, a.category, a.author, a.priority, a.createdAt, a.updatedAt]
      );
    }
  }

  // Static convenience wrappers
  static findAll() { return announcementModel.findAll(); }
  static findById(id) { return announcementModel.findById(id); }
  static create(data) { return announcementModel.create(data); }
  static update(id, data) { return announcementModel.update(id, data); }
  static delete(id) { return announcementModel.delete(id); }
  static reset() { return announcementModel.reset(); }
  static count() { return announcementModel.count(); }
}

const announcementModel = new AnnouncementModel();

module.exports = {
  AnnouncementModel,
  announcementModel,
};
