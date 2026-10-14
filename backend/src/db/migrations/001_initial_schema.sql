-- =============================================================================
-- Migration: 001_initial_schema.sql
-- Week 5: Database Integration, Persistence & Migration
-- Entities: users, announcements
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive unique index and role filter index
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(TRIM(email)));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- -----------------------------------------------------------------------------
-- Table: announcements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes defined in ddd.md
CREATE INDEX IF NOT EXISTS idx_announcements_created_at_desc ON announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category_created_at ON announcements (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements (priority);
