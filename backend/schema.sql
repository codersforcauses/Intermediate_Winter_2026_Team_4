PRAGMA foreign_keys = ON;

CREATE TABLE users (
    users_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favourite_jobs (
    favourite_jobs_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    users_id            INTEGER NOT NULL,
    adzuna_id           TEXT,
    title               TEXT,
    company             TEXT,
    salary_min          INTEGER,
    salary_max          INTEGER,
    location            TEXT,
    redirect_url        TEXT,
    saved_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (users_id) REFERENCES users (users_id) ON DELETE CASCADE
);

CREATE TABLE saved_searches (
    saved_searches_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    users_id            INTEGER NOT NULL,
    keyword             TEXT,
    location             TEXT,
    sort_by              TEXT,
    alert_enabled        BOOLEAN NOT NULL DEFAULT 0,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (users_id) REFERENCES users (users_id) ON DELETE CASCADE
);

CREATE TABLE demand_snapshots (
    demand_snapshots_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    skill                 TEXT,
    count                 INTEGER,
    captured_at           DATE,
    last_updated          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_postings (
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
    posted_at         DATETIME,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_favourite_jobs_users_id ON favourite_jobs (users_id);
CREATE INDEX idx_saved_searches_users_id ON saved_searches (users_id);
