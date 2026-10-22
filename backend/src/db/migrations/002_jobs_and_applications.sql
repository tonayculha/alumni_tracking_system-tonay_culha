-- =============================================================================
-- Migration: 002_jobs_and_applications.sql
-- Week 6: Relational Schema, One-to-Many & Many-to-Many Associations
-- Entities: job_postings (1:N from users), applications (N:M join entity)
-- =============================================================================

-- Ensure cryptographic extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helper Function: update_updated_at_column
-- Automatically updates updated_at timestamp on row mutation
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Table: job_postings (One-to-Many with users)
-- Represents job opportunities posted by alumni / recruiters / admins.
-- ON DELETE CASCADE ensures user removal cascades to posted vacancies.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: applications (Many-to-Many join entity between users & job_postings)
-- Represents job applications submitted by candidates/students.
-- ON DELETE CASCADE ensures candidate removal or job removal cleans up join records.
-- CONSTRAINT uq_user_job_application guarantees single application per user per job.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_job_application UNIQUE (user_id, job_posting_id)
);

-- -----------------------------------------------------------------------------
-- Performance Indexes
-- -----------------------------------------------------------------------------

-- job_postings foreign key and feed sorting indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON job_postings (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at_desc ON job_postings (created_at DESC);

-- applications foreign key and status filtering indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications (job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

-- -----------------------------------------------------------------------------
-- Triggers for automated updated_at timestamp maintenance
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_job_postings_updated_at ON job_postings;
CREATE TRIGGER trigger_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
