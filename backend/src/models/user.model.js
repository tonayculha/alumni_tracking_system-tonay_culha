const { query } = require('../config/db');
const crypto = require('crypto');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Baseline Seed Users (Week 5: PostgreSQL Database Integration)
 */
const INITIAL_USERS = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Ada Lovelace',
    email: 'ada.lovelace@alumni.edu',
    role: 'admin',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    name: 'Alan Turing',
    email: 'alan.turing@alumni.edu',
    role: 'alumni',
    createdAt: '2024-02-20T10:30:00.000Z',
    updatedAt: '2024-02-20T10:30:00.000Z',
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Grace Hopper',
    email: 'grace.hopper@alumni.edu',
    role: 'alumni',
    createdAt: '2024-03-10T14:15:00.000Z',
    updatedAt: '2024-03-10T14:15:00.000Z',
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    name: 'Margaret Hamilton',
    email: 'margaret.hamilton@alumni.edu',
    role: 'student',
    createdAt: '2024-04-05T09:45:00.000Z',
    updatedAt: '2024-04-05T09:45:00.000Z',
  },
];

/**
 * UserModel
 * 
 * Model layer for User entity backed by PostgreSQL 16 database.
 * Executes parameterized SQL queries via pg connection pool.
 */
class UserModel {
  /**
   * Helper to normalize database rows into standard user domain objects
   * @param {Object} row
   * @returns {Object|null}
   */
  _mapUser(row) {
    if (!row) return null;
    const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
    const updatedAtIso = row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString();
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt || createdAtIso,
      updatedAt: row.updatedAt || updatedAtIso,
      created_at: row.created_at || createdAtIso,
      updated_at: row.updated_at || updatedAtIso,
    };
  }

  /**
   * Retrieve all user records from PostgreSQL
   * @returns {Promise<Array<Object>>}
   */
  async findAll() {
    const res = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at ASC'
    );
    return res.rows.map((row) => this._mapUser(row));
  }

  /**
   * Find a single user by UUID
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) return null;
    const res = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapUser(res.rows[0]);
  }

  /**
   * Find user by email (case-insensitive)
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const res = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
      [email]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapUser(res.rows[0]);
  }

  /**
   * Create and persist a new user in PostgreSQL
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.role
   * @param {string} [userData.id]
   * @returns {Promise<Object>}
   */
  async create({ name, email, role, id }) {
    const userId = id || crypto.randomUUID();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim();

    const res = await query(
      `INSERT INTO users (id, name, email, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, role, created_at, updated_at`,
      [userId, cleanName, cleanEmail, cleanRole]
    );
    return this._mapUser(res.rows[0]);
  }

  /**
   * Update existing user record in PostgreSQL
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) return null;

    const sets = [];
    const values = [id];
    let idx = 2;

    if (updateData.name !== undefined) {
      sets.push(`name = $${idx++}`);
      values.push(updateData.name.trim());
    }
    if (updateData.email !== undefined) {
      sets.push(`email = $${idx++}`);
      values.push(updateData.email.trim().toLowerCase());
    }
    if (updateData.role !== undefined) {
      sets.push(`role = $${idx++}`);
      values.push(updateData.role.trim());
    }

    if (sets.length === 0) {
      return this.findById(id);
    }

    sets.push(`updated_at = NOW()`);
    const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = $1 RETURNING id, name, email, role, created_at, updated_at`;
    const res = await query(sql, values);
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapUser(res.rows[0]);
  }

  /**
   * Delete user by UUID from PostgreSQL
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) return false;
    const res = await query('DELETE FROM users WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  /**
   * Count total stored users in PostgreSQL
   * @returns {Promise<number>}
   */
  async count() {
    const res = await query('SELECT COUNT(*) AS count FROM users');
    return parseInt(res.rows[0].count, 10);
  }

  /**
   * Reset store to initial seed users
   * @returns {Promise<void>}
   */
  async reset() {
    await query('DELETE FROM users');
    for (const u of INITIAL_USERS) {
      await query(
        `INSERT INTO users (id, name, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           updated_at = EXCLUDED.updated_at`,
        [u.id, u.name, u.email, u.role, u.createdAt, u.updatedAt]
      );
    }
  }

  // Static convenience wrappers
  static findAll() { return userModel.findAll(); }
  static findById(id) { return userModel.findById(id); }
  static findByEmail(email) { return userModel.findByEmail(email); }
  static create(data) { return userModel.create(data); }
  static update(id, data) { return userModel.update(id, data); }
  static delete(id) { return userModel.delete(id); }
  static count() { return userModel.count(); }
  static reset() { return userModel.reset(); }
}

const userModel = new UserModel();

module.exports = {
  UserModel,
  userModel,
};
