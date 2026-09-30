# Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B%20LTS-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-lightgrey.svg)](https://expressjs.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D.svg)](https://swagger.io/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2%2B-blue.svg)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-336791.svg)](https://www.postgresql.org/)

An enterprise-ready, clean-room implementation of the **Alumni Tracking System** coursework project. Built from first principles with a modular layered architecture, OpenAPI 3.0 Swagger interactive documentation, thread-safe in-memory user CRUD operations, parametric routing, strict validation, and containerized zero-touch deployment.

---

## 📖 Table of Contents

- [Project Philosophy](#-project-philosophy)
- [Architecture & Layering](#-architecture--layering)
- [Directory Structure](#-directory-structure)
- [Quick Start: The One-Command Rule](#-quick-start-the-one-command-rule)
- [Swagger & Interactive API Documentation](#-swagger--interactive-api-documentation)
- [API Reference & Contract](#-api-reference--contract)
  - [1. Health Check (`GET /api/health`)](#1-health-check)
  - [2. In-Memory User CRUD (`/api/users`)](#2-in-memory-user-management-crud)
  - [3. Parametric Greeting (`GET /hello/:name`)](#3-parametric-greeting)
  - [4. Calculation Endpoint (`GET /sum/:num1/:num2`)](#4-calculation-summation)
  - [5. Semantic HTML Views](#5-semantic-html-views)
- [Local Development & Testing](#-local-development--testing)
- [Environment Configuration](#-environment-configuration)
- [Containerization Details](#-containerization-details)

---

## 🎯 Project Philosophy

1. **Clean-Room Implementation**: Fully crafted from scratch, adhering to software engineering best practices without relying on external boilerplate or peer codebases.
2. **The "One-Command Rule"**: Zero manual pre-configuration required. The entire stack boots deterministically with:
   ```bash
   docker compose up --build
   ```
3. **Instructor Milestone Isolation (Week 3)**: As required by the instructor (*"don't use any database yet"*), all User Management CRUD operations utilize a dedicated thread-safe in-memory data store with deep cloning immutability and pre-seeded sample data, strictly decoupled from persistent tables.
4. **Layered Separation of Concerns**: Strict decoupling across Routes, Controllers, Services, Repositories, and Config layers.
5. **Interactive OpenAPI 3.0 Documentation**: Fully interactive Swagger UI exposed at `/api/swagger` and `/api/docs` allowing instant endpoint discovery and browser testing.

---

## 🏛️ Architecture & Layering

The backend follows an enterprise modular 5-tier architecture:

```
[ HTTP Client / Browser / Swagger UI ]
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ Express Application (src/app.js)             │
│ - Helmet Security Headers & Content Security │
│ - CORS & HTTP Request Logging (Morgan)       │
│ - Static Asset Serving (public/)             │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Route Layer (src/routes/)                    │
│ - Main Aggregator (src/routes/index.js)      │
│ - /api Subrouter (src/routes/api.routes.js)  │
│ - User Routes with OpenAPI JSDoc specs       │
│ - Swagger UI & OpenAPI Specification routes  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Controller Layer (src/controllers/)          │
│ - HTTP request parameter parsing & dispatch  │
│ - REST status responses (200, 201, 400, 404) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Service Layer (src/services/)                │
│ - Input validation (RFC email regex, schema) │
│ - Business logic & conflict detection (409)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ In-Memory Repository (src/repositories/)     │
│ - Thread-safe operations & defensive cloning │
│ - Seed dataset (Ada, Turing, Hopper, etc.)   │
│ - CRUD: findAll, findById, create, update... │
└──────────────────────────────────────────────┘
```

---

## 📂 Directory Structure

```text
.
├── .env                  # Default environment values for instant execution
├── .env.example          # Documented template for configuration variables
├── .gitignore            # Git exclusion rules for node_modules, logs, volumes
├── docker-compose.yml    # Root-level multi-container orchestration
├── README.md             # Architecture, API & deployment documentation
└── backend/
    ├── Dockerfile        # Production multi-stage Alpine Node.js 20 image
    ├── .dockerignore     # Docker build context exclusions
    ├── package.json      # NPM dependencies, scripts, and metadata
    ├── package-lock.json # Deterministic dependency lockfile
    ├── public/           # Static assets (stylesheets, branding)
    │   └── css/
    │       └── style.css
    ├── src/
    │   ├── app.js        # Express application configuration & middlewares
    │   ├── server.js     # Server bootstrap & graceful shutdown handler
    │   ├── config/
    │   │   ├── db.js     # PostgreSQL connection pool & health ping
    │   │   ├── env.js    # Centralized environment variable validator
    │   │   └── swagger.js # OpenAPI 3.0 specification definition
    │   ├── controllers/
    │   │   ├── greeting.controller.js
    │   │   ├── health.controller.js
    │   │   ├── info.controller.js
    │   │   ├── math.controller.js
    │   │   └── user.controller.js
    │   ├── middlewares/
    │   │   ├── errorHandler.js
    │   │   └── notFoundHandler.js
    │   ├── repositories/
    │   │   └── inMemoryUser.repository.js # Thread-safe in-memory store
    │   ├── routes/
    │   │   ├── api.routes.js    # Aggregates /api routes (Week 3)
    │   │   ├── greeting.routes.js
    │   │   ├── health.routes.js # GET /health & GET /api/health
    │   │   ├── index.js         # Main router
    │   │   ├── info.routes.js
    │   │   ├── math.routes.js
    │   │   ├── swagger.routes.js # Swagger UI (/api/swagger, /api/docs)
    │   │   └── user.routes.js   # In-memory User CRUD endpoints
    │   ├── services/
    │   │   ├── greeting.service.js
    │   │   ├── health.service.js
    │   │   ├── math.service.js
    │   │   └── user.service.js
    │   ├── utils/
    │   │   ├── logger.js
    │   │   └── responseFormatter.js
    │   └── views/
    │       ├── about.html # Semantic HTML view
    │       └── home.html  # Modern landing page with API explorer
    └── tests/
        └── api.test.js   # 31 automated integration tests (100% pass)
```

---

## 🚀 Quick Start: The One-Command Rule

To run the complete system with all networking and services configured:

```bash
docker compose up --build
```

Once running:
- **Interactive Swagger Documentation**: [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger) (also [http://localhost:3000/api/docs](http://localhost:3000/api/docs))
- **Web Interface**: [http://localhost:3000/home](http://localhost:3000/home)
- **API Health**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Users API**: [http://localhost:3000/api/users](http://localhost:3000/api/users)
- **About / Architecture**: [http://localhost:3000/about](http://localhost:3000/about)

---

## 📖 Swagger & Interactive API Documentation

Interactive OpenAPI 3.0 documentation is exposed at:
- **Swagger UI**: `http://localhost:3000/api/swagger` and `http://localhost:3000/api/docs`
- **Raw OpenAPI JSON**: `http://localhost:3000/api/swagger.json` and `http://localhost:3000/api/docs.json`

Users can inspect all request models, response schemas, and execute live API calls directly from their browser.

---

## 📡 API Reference & Contract

### 1. Health Check
Returns operational status, uptime, ISO timestamp, and platform diagnostics.

- **Route**: `GET /api/health` (also legacy `GET /health` and `GET /`)
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "Alumni Tracking System",
  "environment": "production",
  "uptime": 60,
  "uptimeHuman": "1m 0s",
  "timestamp": "2026-10-01T01:00:00.000Z",
  "system": {
    "platform": "linux",
    "nodeVersion": "v20.x.x",
    "memoryUsageMB": 62
  },
  "database": {
    "connected": true
  }
}
```

```bash
curl -X GET http://localhost:3000/api/health
```

---

### 2. In-Memory User Management CRUD

#### User Model
```json
{
  "id": "11111111-1111-4111-a111-111111111111",
  "name": "Ada Lovelace",
  "email": "ada.lovelace@alumni.edu",
  "role": "admin",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

#### Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users in in-memory store | `200 OK` |
| `POST` | `/api/users` | Create user `{ name, email, role }` | `201 Created` |
| `GET` | `/api/users/:id` | Get user by UUID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/users/:id` | Full update of existing user | `200 OK` / `404 Not Found` |
| `PATCH`| `/api/users/:id` | Partial update of existing user | `200 OK` / `404 Not Found` |
| `DELETE`| `/api/users/:id` | Delete user from in-memory store | `200 OK` / `404 Not Found` |

#### Example Usage

**1. Create User**:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Donald Knuth", "email": "knuth@alumni.edu", "role": "faculty"}'
```
*Response (`201 Created`)*:
```json
{
  "id": "813a235b-d40f-4098-b6f3-39f8c2c6a2cb",
  "name": "Donald Knuth",
  "email": "knuth@alumni.edu",
  "role": "faculty",
  "createdAt": "2026-10-01T01:05:35.951Z",
  "updatedAt": "2026-10-01T01:05:35.951Z"
}
```

**2. List All Users**:
```bash
curl -X GET http://localhost:3000/api/users
```

**3. Get by ID**:
```bash
curl -X GET http://localhost:3000/api/users/11111111-1111-4111-a111-111111111111
```

**4. Update User (PUT / PATCH)**:
```bash
curl -X PATCH http://localhost:3000/api/users/11111111-1111-4111-a111-111111111111 \
  -H "Content-Type: application/json" \
  -d '{"role": "dean"}'
```

**5. Delete User**:
```bash
curl -X DELETE http://localhost:3000/api/users/11111111-1111-4111-a111-111111111111
```

---

### 3. Parametric Greeting
Accepts a name in the URL path and returns a personalized greeting.

- **Route**: `GET /hello/:name`
- **Response**: `200 OK`
```json
{
  "status": "success",
  "name": "Alice",
  "message": "Hello, Alice! Welcome to the Alumni Tracking System.",
  "timestamp": "2026-10-01T01:00:00.000Z"
}
```

---

### 4. Calculation (Summation)
Performs strict arithmetic addition with input validation and error diagnostics.

- **Route**: `GET /sum/:number1/:number2`
- **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "operation": "sum",
    "number1": 15,
    "number2": 27,
    "result": 42
  }
  ```

---

### 5. Semantic HTML Views
Render modern, responsive, styled user interfaces.

- **`GET /home`**: Platform landing view, feature highlights, and interactive API links.
- **`GET /about`**: Technical specifications, system architecture, and coursework details.

---

## 🧪 Local Development & Testing

Run automated tests directly on your machine:

```bash
cd backend
npm test
```

**Test Results**:
```text
✔ Alumni Tracking System API Test Suite (31 tests passed, 0 failures)
  ✔ Health Check Endpoints (Legacy Root) (2 tests)
  ✔ Parametric Greeting Endpoint (2 tests)
  ✔ Calculation Endpoint (6 tests)
  ✔ Static & Info Views (2 tests)
  ✔ 404 Handling (1 test)
  ✔ Week 3: Health Check Endpoint (/api/health) (1 test)
  ✔ Week 3: Swagger / OpenAPI Documentation (4 tests)
  ✔ Week 3: In-Memory User CRUD Operations (/api/users) (13 tests)
```

---

## ⚙️ Environment Configuration

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Runtime mode (`development`, `production`, `test`) |
| `PORT` | `3000` | Port on which the Express server listens |
| `HOST` | `0.0.0.0` | Host binding interface |
| `APP_NAME` | `Alumni Tracking System` | Application display name |
| `DB_HOST` | `database` | PostgreSQL host (`database` in Docker network) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `alumni_user` | PostgreSQL database user |
| `DB_PASSWORD` | `alumni_secure_pass` | PostgreSQL password |
| `DB_NAME` | `alumni_db` | PostgreSQL target database name |

---

## 🐳 Containerization Details

- **Backend Dockerfile**: Multi-stage Alpine container (`node:20-alpine`), non-root `node` user, deterministic `npm ci --omit=dev`, internal healthcheck.
- **PostgreSQL Database**: Isolated container running on Alpine 16, health check configured.
- **Zero-Touch Startup**: `docker compose up --build` launches both services cleanly in dependency order.
