-- =============================================================================
-- Seed: 001_seed_data.sql
-- Week 5: Database Integration, Persistence & Migration
-- Baseline Seed Data for users and announcements
-- =============================================================================

INSERT INTO users (id, name, email, role, created_at, updated_at)
VALUES
    ('11111111-1111-4111-a111-111111111111', 'Ada Lovelace', 'ada.lovelace@alumni.edu', 'admin', '2024-01-15T08:00:00.000Z', '2024-01-15T08:00:00.000Z'),
    ('22222222-2222-4222-a222-222222222222', 'Alan Turing', 'alan.turing@alumni.edu', 'alumni', '2024-02-20T10:30:00.000Z', '2024-02-20T10:30:00.000Z'),
    ('33333333-3333-4333-a333-333333333333', 'Grace Hopper', 'grace.hopper@alumni.edu', 'alumni', '2024-03-10T14:15:00.000Z', '2024-03-10T14:15:00.000Z'),
    ('44444444-4444-4444-a444-444444444444', 'Margaret Hamilton', 'margaret.hamilton@alumni.edu', 'student', '2024-04-05T09:45:00.000Z', '2024-04-05T09:45:00.000Z')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = EXCLUDED.updated_at;

INSERT INTO announcements (id, title, content, category, author, priority, created_at, updated_at)
VALUES
    (
        'a1111111-1111-4111-a111-111111111111',
        'Annual Alumni Homecoming 2026',
        'Join us for the Annual Alumni Homecoming Gala on campus. Reconnect with fellow graduates, explore our new research centers, and enjoy keynote speeches from prominent alumni.',
        'social',
        'Alumni Relations Office',
        'urgent',
        '2026-09-01T10:00:00.000Z',
        '2026-09-01T10:00:00.000Z'
    ),
    (
        'b2222222-2222-4222-a222-222222222222',
        'Fall Tech & Engineering Career Fair 2026',
        'Over 80 partner engineering and technology firms will be hiring on-site for internship, graduate, and experienced alumni roles. Register your portfolio in advance.',
        'career',
        'Career Development Center',
        'normal',
        '2026-09-15T14:30:00.000Z',
        '2026-09-15T14:30:00.000Z'
    ),
    (
        'c3333333-3333-4333-a333-333333333333',
        'Distinguished Guest Speaker Series: Quantum Computing',
        'Keynote lecture on Quantum Algorithms and Next-Generation Cloud Systems delivered by Turing Award laureates in the main auditorium and streamed worldwide.',
        'academic',
        'School of Computing & Engineering',
        'normal',
        '2026-10-01T09:15:00.000Z',
        '2026-10-01T09:15:00.000Z'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    category = EXCLUDED.category,
    author = EXCLUDED.author,
    priority = EXCLUDED.priority,
    updated_at = EXCLUDED.updated_at;
