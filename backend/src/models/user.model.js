const { inMemoryUserRepository } = require('../repositories/inMemoryUser.repository');

/**
 * UserModel
 * 
 * MVC Model layer representation for the User entity.
 * Encapsulates in-memory data store operations with thread-safe defensive
 * cloning, strict validation compliance, and state immutability.
 * 
 * Satisfies Week 4 In-Class Task: "Create Users Model"
 * (In-memory only, no database connection per instructor constraints).
 */
class UserModel {
  constructor(repository = inMemoryUserRepository) {
    this.repository = repository;
  }

  /**
   * Deep clone helper to enforce data encapsulation and immutability
   * @param {any} data
   * @returns {any}
   */
  _clone(data) {
    if (data === undefined || data === null) return data;
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Retrieve all user records
   * @returns {Array<Object>}
   */
  findAll() {
    return this._clone(this.repository.findAll());
  }

  /**
   * Find a single user by their unique UUID
   * @param {string} id - User UUID
   * @returns {Object|null}
   */
  findById(id) {
    if (!id) return null;
    return this._clone(this.repository.findById(id));
  }

  /**
   * Find a user by their email address (case-insensitive)
   * @param {string} email
   * @returns {Object|null}
   */
  findByEmail(email) {
    if (!email) return null;
    return this._clone(this.repository.findByEmail(email));
  }

  /**
   * Create and persist a new user record in memory
   * @param {Object} userData
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.role - User's role (admin, alumni, student)
   * @param {string} [userData.id] - Optional UUID override
   * @returns {Object} Newly created user
   */
  create({ name, email, role, id }) {
    const created = this.repository.create({ name, email, role, id });
    return this._clone(created);
  }

  /**
   * Update an existing user record
   * @param {string} id - Target user UUID
   * @param {Object} updateData - Key-values to update (name, email, role)
   * @returns {Object|null} Updated user or null if not found
   */
  update(id, updateData) {
    if (!id) return null;
    const updated = this.repository.update(id, updateData);
    return updated ? this._clone(updated) : null;
  }

  /**
   * Remove a user record by UUID
   * @param {string} id - Target user UUID
   * @returns {boolean} True if deleted, false if not found
   */
  delete(id) {
    if (!id) return false;
    return this.repository.delete(id);
  }

  /**
   * Return the total count of stored users
   * @returns {number}
   */
  count() {
    return this.repository.count();
  }

  /**
   * Reset store to initial seed users (for test isolation)
   */
  reset() {
    this.repository.reset();
  }

  // Static convenience wrappers for static class usage pattern
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
