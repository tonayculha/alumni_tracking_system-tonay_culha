const crypto = require('crypto');

/**
 * Initial Seed Data for Announcements
 * Pre-populated with realistic campus & alumni announcements
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
 * In-memory model for Announcement entity operations.
 * Enforces defensive deep cloning to maintain thread safety and state immutability.
 * 
 * Schema:
 * - id: UUID string
 * - title: string
 * - content: string
 * - category: 'academic' | 'career' | 'social'
 * - author: string
 * - priority: 'low' | 'normal' | 'urgent'
 * - createdAt: ISO date string
 * - updatedAt: ISO date string
 */
class AnnouncementModel {
  constructor() {
    this.announcements = [];
    this.reset();
  }

  /**
   * Defensive deep clone helper
   * @param {any} data
   * @returns {any}
   */
  _clone(data) {
    if (data === undefined || data === null) return data;
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Reset store to initial seed announcements
   */
  reset() {
    this.announcements = this._clone(INITIAL_ANNOUNCEMENTS);
  }

  /**
   * Retrieve all announcements
   * @returns {Array<Object>}
   */
  findAll() {
    return this._clone(this.announcements);
  }

  /**
   * Retrieve announcement by UUID
   * @param {string} id
   * @returns {Object|null}
   */
  findById(id) {
    if (!id) return null;
    const item = this.announcements.find((a) => a.id === id);
    return item ? this._clone(item) : null;
  }

  /**
   * Create and store a new announcement
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.content
   * @param {string} data.category - 'academic' | 'career' | 'social'
   * @param {string} data.author
   * @param {string} data.priority - 'low' | 'normal' | 'urgent'
   * @param {string} [data.id] - Optional UUID override
   * @returns {Object} Newly created record
   */
  create({ title, content, category, author, priority, id }) {
    const now = new Date().toISOString();
    const newRecord = {
      id: id || crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      category: category.trim().toLowerCase(),
      author: author.trim(),
      priority: (priority || 'normal').trim().toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };

    this.announcements.unshift(this._clone(newRecord));
    return this._clone(newRecord);
  }

  /**
   * Update an existing announcement
   * @param {string} id
   * @param {Object} updateData
   * @returns {Object|null}
   */
  update(id, updateData) {
    const index = this.announcements.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const existing = this.announcements[index];
    const updated = {
      ...existing,
      ...(updateData.title !== undefined ? { title: updateData.title.trim() } : {}),
      ...(updateData.content !== undefined ? { content: updateData.content.trim() } : {}),
      ...(updateData.category !== undefined ? { category: updateData.category.trim().toLowerCase() } : {}),
      ...(updateData.author !== undefined ? { author: updateData.author.trim() } : {}),
      ...(updateData.priority !== undefined ? { priority: updateData.priority.trim().toLowerCase() } : {}),
      id: existing.id, // Immutable ID
      createdAt: existing.createdAt, // Immutable createdAt
      updatedAt: new Date().toISOString(),
    };

    this.announcements[index] = this._clone(updated);
    return this._clone(updated);
  }

  /**
   * Delete announcement by ID
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const index = this.announcements.findIndex((a) => a.id === id);
    if (index === -1) return false;

    this.announcements.splice(index, 1);
    return true;
  }

  /**
   * Return count of stored announcements
   * @returns {number}
   */
  count() {
    return this.announcements.length;
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
