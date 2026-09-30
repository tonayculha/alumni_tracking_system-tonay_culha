const crypto = require('crypto');

/**
 * Initial Seed Data for Week 3 In-Memory User Store
 * Pre-populated with diverse realistic sample users
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
 * InMemoryUserRepository
 * Provides thread-safe, concurrency-safe in-memory operations with deep cloning
 * to prevent external mutation leaks.
 */
class InMemoryUserRepository {
  constructor() {
    this.users = [];
    this.reset();
  }

  /**
   * Deep clone helper to ensure immutability and thread safety
   * @param {any} data
   * @returns {any}
   */
  _clone(data) {
    if (data === undefined || data === null) return data;
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Reset store to initial seed users
   */
  reset() {
    this.users = this._clone(INITIAL_USERS);
  }

  /**
   * Find all users
   * @returns {Array<Object>}
   */
  findAll() {
    return this._clone(this.users);
  }

  /**
   * Find user by UUID
   * @param {string} id
   * @returns {Object|null}
   */
  findById(id) {
    if (!id) return null;
    const user = this.users.find((u) => u.id === id);
    return user ? this._clone(user) : null;
  }

  /**
   * Find user by email (case-insensitive)
   * @param {string} email
   * @returns {Object|null}
   */
  findByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === normalized);
    return user ? this._clone(user) : null;
  }

  /**
   * Create and store a new user
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.role
   * @returns {Object}
   */
  create({ name, email, role, id }) {
    const now = new Date().toISOString();
    const newUser = {
      id: id || crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(this._clone(newUser));
    return this._clone(newUser);
  }

  /**
   * Update an existing user
   * @param {string} id
   * @param {Object} updateData
   * @returns {Object|null}
   */
  update(id, updateData) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const existing = this.users[index];
    const updated = {
      ...existing,
      ...(updateData.name !== undefined ? { name: updateData.name.trim() } : {}),
      ...(updateData.email !== undefined ? { email: updateData.email.trim().toLowerCase() } : {}),
      ...(updateData.role !== undefined ? { role: updateData.role.trim() } : {}),
      id: existing.id, // Immutable ID
      createdAt: existing.createdAt, // Immutable createdAt
      updatedAt: new Date().toISOString(),
    };

    this.users[index] = this._clone(updated);
    return this._clone(updated);
  }

  /**
   * Delete user by ID
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  /**
   * Return count of stored users
   * @returns {number}
   */
  count() {
    return this.users.length;
  }
}

// Export singleton instance
const inMemoryUserRepository = new InMemoryUserRepository();

module.exports = {
  inMemoryUserRepository,
  InMemoryUserRepository,
};
