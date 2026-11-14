-- Tables for the job-market data. These are NOT created by Django migrations
-- (the jobs models are managed = False); apply this file with:
--
--     python manage.py init_db
--
-- It is safe to run repeatedly. Users, sessions, favourite jobs and saved
-- searches are ordinary Django models and are created by `python manage.py migrate`.

CREATE TABLE IF NOT EXISTS demand_snapshots (
    demand_snapshots_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    skill                 TEXT,
    count                 INTEGER,
    captured_at           DATE,
    last_updated          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avg_salary            INTEGER,  -- average annual salary of the salaried postings in that day's search
    salary_samples        INTEGER   -- how many postings that average is based on
);

CREATE TABLE IF NOT EXISTS job_postings (
    job_postings_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    source            TEXT,
    external_id       TEXT,
    title             TEXT,
    company           TEXT,
    salary_min        INTEGER,
    salary_max        INTEGER,
    location          TEXT,
    description       TEXT,
    url               TEXT,
    category          TEXT,
    posted_at         DATETIME,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- save_jobs() upserts on (source, external_id); job_detail() looks up by external_id.
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_postings_source_external
    ON job_postings (source, external_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_external_id ON job_postings (external_id);
CREATE INDEX IF NOT EXISTS idx_demand_snapshots_skill_date ON demand_snapshots (skill, captured_at);
