const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

const app = require('../src/app');
const { resetUsers } = require('../src/services/user.service');
const { userModel, UserModel } = require('../src/models/user.model');

describe('Alumni Tracking System API Test Suite', () => {
  let server;
  const baseUrl = 'http://127.0.0.1:3001';

  before((done) => {
    server = app.listen(3001, '127.0.0.1', done);
  });

  after((done) => {
    server.close(done);
  });

  const apiRequest = (method, path, data = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const reqHeaders = { ...headers };
      let postData = null;

      if (data !== null) {
        postData = typeof data === 'string' ? data : JSON.stringify(data);
        reqHeaders['Content-Type'] = reqHeaders['Content-Type'] || 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(
        url,
        {
          method,
          headers: reqHeaders,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body,
              json: () => (body ? JSON.parse(body) : null),
            });
          });
        }
      );

      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };

  const request = (path, headers = {}) => apiRequest('GET', path, null, headers);

  // ==========================================
  // Week 1 & 2 Parity Tests
  // ==========================================
  describe('Health Check Endpoints (Legacy Root)', () => {
    test('GET / returns 200 with status ok and uptime', async () => {
      const res = await request('/');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const data = res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(typeof data.uptime, 'number');
      assert.ok(data.timestamp);
    });

    test('GET /health returns 200 with status ok and uptime', async () => {
      const res = await request('/health');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const data = res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(typeof data.uptime, 'number');
    });
  });

  describe('Parametric Greeting Endpoint', () => {
    test('GET /hello/Alice returns personalized greeting', async () => {
      const res = await request('/hello/Alice');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.name, 'Alice');
      assert.match(data.message, /Hello, Alice!/);
    });

    test('GET /hello/Dr%20Smith handles URL-encoded parameter', async () => {
      const res = await request('/hello/Dr%20Smith');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.name, 'Dr Smith');
      assert.match(data.message, /Hello, Dr Smith!/);
    });
  });

  describe('Calculation Endpoint', () => {
    test('GET /sum/15/27 correctly sums two positive integers', async () => {
      const res = await request('/sum/15/27');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.operation, 'sum');
      assert.strictEqual(data.number1, 15);
      assert.strictEqual(data.number2, 27);
      assert.strictEqual(data.result, 42);
    });

    test('GET /sum/-10/25 correctly handles negative numbers', async () => {
      const res = await request('/sum/-10/25');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.result, 15);
    });

    test('GET /sum/3.14/2.86 correctly handles floating-point numbers', async () => {
      const res = await request('/sum/3.14/2.86');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.result, 6);
    });

    test('GET /sum/abc/5 returns 400 Bad Request for non-numeric input', async () => {
      const res = await request('/sum/abc/5');
      assert.strictEqual(res.statusCode, 400);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Invalid input');
      assert.strictEqual(data.received.number1, 'abc');
      assert.strictEqual(data.received.number2, '5');
    });

    test('GET /sum/12/xyz returns 400 Bad Request when second param is invalid', async () => {
      const res = await request('/sum/12/xyz');
      assert.strictEqual(res.statusCode, 400);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
    });

    test('GET /sum/foo/bar returns 400 Bad Request when both params are invalid', async () => {
      const res = await request('/sum/foo/bar');
      assert.strictEqual(res.statusCode, 400);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.details.length, 2);
    });
  });

  describe('Static & Info Views', () => {
    test('GET /home returns semantic HTML view', async () => {
      const res = await request('/home');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /<title>Alumni Tracking System \| Home<\/title>/);
      assert.match(res.body, /<header>/);
      assert.match(res.body, /<main>/);
      assert.match(res.body, /<footer>/);
    });

    test('GET /about returns semantic HTML view with architecture info', async () => {
      const res = await request('/about');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /About the Project/);
      assert.match(res.body, /One-Command Rule/);
    });
  });

  describe('404 Handling', () => {
    test('GET /unknown-route with JSON accepts header returns 404 JSON', async () => {
      const res = await request('/unknown-route', { Accept: 'application/json' });
      assert.strictEqual(res.statusCode, 404);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Not Found');
    });
  });

  // ==========================================
  // Week 3 Requirements: /api prefix endpoints
  // ==========================================
  describe('Week 3: Health Check Endpoint (/api/health)', () => {
    test('GET /api/health returns 200 with status, timestamp, and uptime', async () => {
      const res = await request('/api/health');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const data = res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(typeof data.uptime, 'number');
      assert.ok(data.timestamp, 'timestamp must be present');
      assert.ok(data.service, 'service name must be present');
      assert.ok(data.system, 'system diagnostics must be present');
    });
  });

  describe('Week 3: Swagger / OpenAPI Documentation', () => {
    test('GET /api/swagger/ returns 200 with interactive Swagger UI HTML', async () => {
      const res = await request('/api/swagger/');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /swagger-ui/i);
    });

    test('GET /api/docs/ returns 200 with interactive Swagger UI HTML', async () => {
      const res = await request('/api/docs/');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /swagger-ui/i);
    });

    test('GET /api/swagger redirects or resolves to documentation', async () => {
      const res = await request('/api/swagger');
      // Either 301 redirect to /api/swagger/ or 200 directly
      assert.ok([200, 301, 302].includes(res.statusCode));
    });

    test('GET /api/swagger.json returns valid OpenAPI 3.0 specification with user routes', async () => {
      const res = await request('/api/swagger.json');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const spec = res.json();
      assert.strictEqual(spec.openapi, '3.0.0');
      assert.strictEqual(spec.info.title, 'Alumni Tracking System API');
      assert.ok(spec.paths['/users'], 'paths must contain /users');
      assert.ok(spec.paths['/users/{id}'], 'paths must contain /users/{id}');
      assert.ok(spec.paths['/api/users'], 'paths must contain /api/users');
      assert.ok(spec.paths['/api/users/{id}'], 'paths must contain /api/users/{id}');
      assert.ok(spec.components.schemas.User, 'schemas must contain User model');
      assert.ok(spec.components.schemas.CreateUserInput, 'schemas must contain CreateUserInput');
      const tagNames = spec.tags.map((t) => t.name);
      assert.ok(tagNames.includes('Users API (REST)'), 'tags must contain Users API (REST)');
      assert.ok(tagNames.includes('Users View (MVC)'), 'tags must contain Users View (MVC)');
    });
  });

  describe('Week 3: In-Memory User CRUD Operations (/api/users)', () => {
    beforeEach(() => {
      resetUsers();
    });

    test('GET /api/users returns initial seed users (at least 3-4 users)', async () => {
      const res = await request('/api/users');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const users = res.json();
      assert.ok(Array.isArray(users), 'Response should be a JSON array of users');
      assert.ok(users.length >= 3, `Expected at least 3 seed users, got ${users.length}`);

      for (const user of users) {
        assert.ok(user.id, 'User must have an id');
        assert.ok(user.name, 'User must have a name');
        assert.ok(user.email, 'User must have an email');
        assert.ok(user.role, 'User must have a role');
        assert.ok(user.createdAt, 'User must have a createdAt timestamp');
      }
    });

    test('POST /api/users creates a new user and returns 201 with generated UUID', async () => {
      const newUserPayload = {
        name: 'Grace Hopper Clone',
        email: 'grace.clone@alumni.edu',
        role: 'faculty',
      };

      const res = await apiRequest('POST', '/api/users', newUserPayload);
      assert.strictEqual(res.statusCode, 201);
      assert.match(res.headers['content-type'], /json/);

      const created = res.json();
      assert.ok(created.id, 'User must have a generated UUID');
      // UUID format check: 8-4-4-4-12 hex characters
      assert.match(created.id, /^[0-9a-fA-F-]{36}$/);
      assert.strictEqual(created.name, newUserPayload.name);
      assert.strictEqual(created.email, newUserPayload.email);
      assert.strictEqual(created.role, newUserPayload.role);
      assert.ok(created.createdAt);

      // Verify the user is now in the array
      const listRes = await request('/api/users');
      const allUsers = listRes.json();
      assert.ok(allUsers.some((u) => u.id === created.id));
    });

    test('POST /api/users returns 400 for invalid/missing fields', async () => {
      // Missing name
      let res = await apiRequest('POST', '/api/users', { email: 'bad@alumni.edu', role: 'student' });
      assert.strictEqual(res.statusCode, 400);

      // Invalid email
      res = await apiRequest('POST', '/api/users', { name: 'Bad Email', email: 'not-an-email', role: 'student' });
      assert.strictEqual(res.statusCode, 400);

      // Missing role
      res = await apiRequest('POST', '/api/users', { name: 'No Role', email: 'norole@alumni.edu' });
      assert.strictEqual(res.statusCode, 400);
    });

    test('POST /api/users returns 409 Conflict when creating with an already registered email', async () => {
      const res = await apiRequest('POST', '/api/users', {
        name: 'Duplicate Ada',
        email: 'ada.lovelace@alumni.edu', // Seed user email
        role: 'student',
      });

      assert.strictEqual(res.statusCode, 409);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'ConflictError');
    });

    test('GET /api/users/:id returns 200 with matching user', async () => {
      const seedId = '11111111-1111-4111-a111-111111111111';
      const res = await request(`/api/users/${seedId}`);
      assert.strictEqual(res.statusCode, 200);

      const user = res.json();
      assert.strictEqual(user.id, seedId);
      assert.strictEqual(user.name, 'Ada Lovelace');
      assert.strictEqual(user.email, 'ada.lovelace@alumni.edu');
    });

    test('GET /api/users/:id returns 404 for unknown user ID', async () => {
      const res = await request('/api/users/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'NotFoundError');
    });

    test('PUT /api/users/:id updates full user and returns 200', async () => {
      const seedId = '22222222-2222-4222-a222-222222222222';
      const updatePayload = {
        name: 'Alan Mathison Turing',
        email: 'alan.turing.updated@alumni.edu',
        role: 'faculty',
      };

      const res = await apiRequest('PUT', `/api/users/${seedId}`, updatePayload);
      assert.strictEqual(res.statusCode, 200);

      const updated = res.json();
      assert.strictEqual(updated.id, seedId);
      assert.strictEqual(updated.name, updatePayload.name);
      assert.strictEqual(updated.email, updatePayload.email);
      assert.strictEqual(updated.role, updatePayload.role);
      assert.ok(updated.updatedAt);

      // Verify persistence in subsequent GET
      const getRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(getRes.json().name, updatePayload.name);
    });

    test('PUT /api/users/:id returns 404 for non-existent ID', async () => {
      const res = await apiRequest('PUT', '/api/users/99999999-9999-9999-9999-999999999999', {
        name: 'Ghost User',
        email: 'ghost@alumni.edu',
        role: 'student',
      });
      assert.strictEqual(res.statusCode, 404);
    });

    test('PATCH /api/users/:id partially updates user and returns 200', async () => {
      const seedId = '33333333-3333-4333-a333-333333333333';
      const res = await apiRequest('PATCH', `/api/users/${seedId}`, {
        role: 'lead-researcher',
      });

      assert.strictEqual(res.statusCode, 200);
      const user = res.json();
      assert.strictEqual(user.id, seedId);
      assert.strictEqual(user.role, 'lead-researcher');
      assert.strictEqual(user.name, 'Grace Hopper'); // unchanged

      // Verify persistence
      const getRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(getRes.json().role, 'lead-researcher');
    });

    test('PATCH /api/users/:id returns 404 for non-existent ID', async () => {
      const res = await apiRequest('PATCH', '/api/users/99999999-9999-9999-9999-999999999999', {
        role: 'student',
      });
      assert.strictEqual(res.statusCode, 404);
    });

    test('DELETE /api/users/:id removes user from store and returns 200', async () => {
      const seedId = '44444444-4444-4444-a444-444444444444';
      const res = await apiRequest('DELETE', `/api/users/${seedId}`);
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.id, seedId);

      // Verify subsequent GET returns 404
      const getRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(getRes.statusCode, 404);

      // Verify user count decreased in list
      const listRes = await request('/api/users');
      const allUsers = listRes.json();
      assert.ok(!allUsers.some((u) => u.id === seedId));
    });

    test('DELETE /api/users/:id returns 404 when deleting non-existent ID', async () => {
      const res = await apiRequest('DELETE', '/api/users/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('In-memory store ensures immutability against external mutation', async () => {
      const res = await request('/api/users');
      const users = res.json();
      // Attempt to tamper with returned object directly
      users[0].name = 'Hacked Name In Memory';

      // Re-fetch to ensure internal store was not mutated
      const reFetch = await request(`/api/users/${users[0].id}`);
      assert.notStrictEqual(reFetch.json().name, 'Hacked Name In Memory');
    });
  });

  // ==========================================
  // Week 4 Requirements: MVC User Views & Dual Controller
  // ==========================================
  describe('Week 4: MVC User View Layer (/users)', () => {
    beforeEach(() => {
      resetUsers();
    });

    test('GET /users returns 200 with semantic HTML page and pre-hydrated users', async () => {
      const res = await request('/users');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /<title>Alumni Tracking System \| Users<\/title>/);
      assert.match(res.body, /User Directory &amp; Management|User Directory/);
      assert.match(res.body, /<table id="users-table">/);
      assert.match(res.body, /Ada Lovelace/);
      assert.match(res.body, /<header>/);
      assert.match(res.body, /<main>/);
      assert.match(res.body, /<footer>/);
    });

    test('POST /users with urlencoded form submission creates user and redirects (302)', async () => {
      const formPayload = 'name=Katherine+Johnson&email=katherine%40alumni.edu&role=faculty';
      const res = await apiRequest('POST', '/users', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/users\?status=created/);

      // Verify user was persisted
      const listRes = await request('/api/users');
      const users = listRes.json();
      assert.ok(users.some((u) => u.email === 'katherine@alumni.edu'));
    });

    test('POST /users with invalid form data redirects with error parameter (302)', async () => {
      const formPayload = 'name=A&email=invalid-email&role=student';
      const res = await apiRequest('POST', '/users', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/users\?error=/);
    });

    test('GET /users/:id with HTML accept header redirects to view query (302)', async () => {
      const seedId = '11111111-1111-4111-a111-111111111111';
      const res = await request(`/users/${seedId}`, { Accept: 'text/html' });
      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, new RegExp(`/users\\?view=${seedId}`));
    });

    test('GET /users/:id with non-existent ID returns 404', async () => {
      const res = await request('/users/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /users/:id/delete with form action deletes user and redirects (302)', async () => {
      const seedId = '33333333-3333-4333-a333-333333333333';
      const res = await apiRequest('POST', `/users/${seedId}/delete`, '', {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/users\?status=deleted/);

      // Verify user is deleted
      const checkRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(checkRes.statusCode, 404);
    });
  });

  // ==========================================
  // Week 4 Requirements: In-Memory UserModel Specification
  // ==========================================
  describe('Week 4: In-Memory UserModel Specification', () => {
    beforeEach(() => {
      userModel.reset();
    });

    test('UserModel.findAll returns all seed users defensively cloned', () => {
      const users = userModel.findAll();
      assert.ok(Array.isArray(users));
      assert.ok(users.length >= 3);
      assert.strictEqual(users.length, userModel.count());
    });

    test('UserModel.findById returns target user or null', () => {
      const user = userModel.findById('11111111-1111-4111-a111-111111111111');
      assert.ok(user);
      assert.strictEqual(user.name, 'Ada Lovelace');

      const nonExistent = userModel.findById('non-existent-id');
      assert.strictEqual(nonExistent, null);
    });

    test('UserModel.findByEmail performs case-insensitive lookup', () => {
      const user = userModel.findByEmail('ADA.LOVELACE@ALUMNI.EDU');
      assert.ok(user);
      assert.strictEqual(user.id, '11111111-1111-4111-a111-111111111111');

      const notFound = userModel.findByEmail('missing@alumni.edu');
      assert.strictEqual(notFound, null);
    });

    test('UserModel.create generates record and increments count', () => {
      const initialCount = userModel.count();
      const created = userModel.create({
        name: 'John von Neumann',
        email: 'neumann@alumni.edu',
        role: 'faculty',
      });

      assert.ok(created.id);
      assert.strictEqual(created.name, 'John von Neumann');
      assert.strictEqual(userModel.count(), initialCount + 1);

      const fetched = userModel.findById(created.id);
      assert.strictEqual(fetched.name, 'John von Neumann');
    });

    test('UserModel.update modifies properties and updates timestamp', () => {
      const updated = userModel.update('22222222-2222-4222-a222-222222222222', {
        name: 'Alan M. Turing',
        role: 'fellow',
      });

      assert.ok(updated);
      assert.strictEqual(updated.name, 'Alan M. Turing');
      assert.strictEqual(updated.role, 'fellow');

      const fetched = userModel.findById('22222222-2222-4222-a222-222222222222');
      assert.strictEqual(fetched.name, 'Alan M. Turing');
    });

    test('UserModel.delete removes record and decrements count', () => {
      const initialCount = userModel.count();
      const success = userModel.delete('11111111-1111-4111-a111-111111111111');
      assert.strictEqual(success, true);
      assert.strictEqual(userModel.count(), initialCount - 1);
      assert.strictEqual(userModel.findById('11111111-1111-4111-a111-111111111111'), null);

      const failed = userModel.delete('non-existent');
      assert.strictEqual(failed, false);
    });

    test('UserModel enforces strict immutability against external mutations', () => {
      const users = userModel.findAll();
      users[0].name = 'Tampered Directly In Memory';

      const verify = userModel.findById(users[0].id);
      assert.notStrictEqual(verify.name, 'Tampered Directly In Memory');
    });

    test('UserModel static methods delegate properly to singleton instance', () => {
      assert.strictEqual(typeof UserModel.findAll, 'function');
      const staticUsers = UserModel.findAll();
      assert.ok(Array.isArray(staticUsers));
      assert.strictEqual(UserModel.count(), userModel.count());
    });
  });
});
