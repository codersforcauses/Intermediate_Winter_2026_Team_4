# JobRader

Job market insights for job seekers — search live listings and see how demand and salaries move across skills.

JobRader pulls job listings from the [Adzuna API](https://developer.adzuna.com/), caches them locally, and records a daily snapshot of how many postings match each tracked skill. That history is what powers the market overview charts — Adzuna only exposes current listings, so the trend data has to be accumulated over time by our own scheduled job.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Django 4.2 |
| Database | SQLite — Django migrations for users/favourites, `schema.sql` for the job-market tables |
| External data | Adzuna Jobs API |

---

## Features

- **Market overview** (`/Market-Overview`) — average salary by skill, a demand-over-time line chart (axes, dates and a legend; it shows the latest counts as bars until two days of snapshots exist) and the top job locations, filterable by skill.
- **Job listings** (`/dashboard`) — free-text keyword and location search with paginated results, backed by a 30-minute cache so we don't burn through the Adzuna rate limit.
- **Job detail** (`/jobs/[id]`) — full description for a single posting, read from the local cache.
- **Me** (`/me`) — your saved jobs and saved searches (with an alerts on/off flag). Requires sign-in.
- **Login / Register** (`/login`) — email + password accounts using Django sessions. Signing in lets you save jobs (the ☆ on listings and job pages) and save searches (the **Save search** button on the listings page).

---

## Project structure

```
.
├── backend/                     # Django project
│   ├── config/                  # settings, urls, wsgi/asgi
│   ├── accounts/                # auth + saved jobs / searches
│   │   ├── models.py            # FavouriteJob, SavedSearch (Django migrations)
│   │   ├── views.py             # register / login / logout / me, favourites, searches
│   │   └── tests.py
│   ├── jobs/                    # job-market data
│   │   ├── models.py            # JobPosting, DemandSnapshot (managed = False)
│   │   ├── services.py          # Adzuna client + normalisation + upsert
│   │   ├── views.py             # job_search, job_detail, market_overview
│   │   └── management/commands/
│   │       ├── fetch_jobs.py    # scheduled batch fetch + daily snapshot
│   │       └── init_db.py       # applies schema.sql
│   ├── schema.sql               # job_postings + demand_snapshots tables
│   ├── .env.example
│   └── requirements.txt
└── frontend/                    # Next.js app
    └── app/
        ├── api/jobs/            # route handlers proxying the Django API
        ├── components/Sidebar.tsx
        ├── lib/                 # api.ts (fetch + CSRF), auth.tsx, favourites.ts
        ├── Market-Overview/
        ├── dashboard/
        ├── jobs/[id]/
        ├── login/
        └── me/
```

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- An Adzuna API account (free) for an `app_id` and `app_key`

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (see `backend/.env.example` for every option):

```env
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
ADZUNA_COUNTRY=au
```

Create the database. The `jobs` models are declared `managed = False`, so `migrate` will **not** create `job_postings` or `demand_snapshots` — `init_db` applies `schema.sql` for those. Users, sessions, saved jobs and saved searches are normal Django models created by `migrate`:

```bash
python manage.py migrate          # auth, sessions, saved jobs/searches, admin
python manage.py init_db          # job_postings + demand_snapshots (safe to re-run; also adds new columns to older databases)
python manage.py test             # optional: run the backend tests
python manage.py runserver        # http://127.0.0.1:8000
```

> **Upgrading an older local database?** Earlier versions of `schema.sql` also created `users`, `favourite_jobs` and `saved_searches`. If `migrate` fails with "table favourite_jobs already exists", drop those (empty) tables — or delete `db.sqlite3` and start again.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

The browser never calls Django directly. Job search goes through the route handlers in `app/api/jobs/`, and everything else (auth, saved jobs/searches, market overview) goes through a same-origin `/django/...` rewrite defined in `next.config.ts`. This keeps the session and CSRF cookies on one origin. If your backend isn't at `http://127.0.0.1:8000`, set `DJANGO_ORIGIN` and `DJANGO_API_URL` in `frontend/.env.local`.

### 3. Seed the trend data

The market overview needs at least one snapshot to render anything:

```bash
cd backend
python manage.py fetch_jobs
python manage.py fetch_jobs --location "Perth" --date 2026-07-01
```

| Flag | Default | Notes |
| --- | --- | --- |
| `--location` | `Western Australia` | Passed to Adzuna for every tracked skill |
| `--date` | today | Labels the snapshot; Adzuna only returns current listings, so this backdates the label, not the data |

Tracked skills live in `TRACKED_SKILLS` in `backend/jobs/skills.py`; the skill pills on the market page come from that same list. Each run also stores the average salary of that skill's salaried postings on the snapshot (`avg_salary`, `salary_samples`). In production this should run once a day on cron or Celery beat — never on a page load. Trend lines need snapshots from at least two different days.

> **Data quality:** Adzuna lists a salary on only a minority of IT postings, so salary averages often rest on a handful of postings (the chart shows the count and flags low samples). Searching "Western Australia" also matches Washington State ("WA"), and Adzuna files those US jobs under the WA locality "Marbelup"; `jobs/services.py` drops them before they are cached.

---

## Environment variables

| Variable | Where | Required | Default |
| --- | --- | --- | --- |
| `ADZUNA_APP_ID` | `backend/.env` | Yes | `''` |
| `ADZUNA_APP_KEY` | `backend/.env` | Yes | `''` |
| `ADZUNA_COUNTRY` | `backend/.env` | No | `au` |
| `DJANGO_DEBUG` | `backend/.env` | No | `true` |
| `DJANGO_SECRET_KEY` | `backend/.env` | In production | insecure dev key |
| `DJANGO_ALLOWED_HOSTS` | `backend/.env` | In production | empty |
| `CORS_ALLOWED_ORIGINS` | `backend/.env` | No | `http://localhost:3000,http://127.0.0.1:3000` |
| `CSRF_TRUSTED_ORIGINS` | `backend/.env` | No | same as above |
| `DJANGO_ORIGIN` | `frontend/.env.local` | No | `http://127.0.0.1:8000` |
| `DJANGO_API_URL` | `frontend/.env.local` | No | `http://127.0.0.1:8000/api/jobs/` |

---

## API reference

All endpoints return JSON. The job-market endpoints are `GET` only. Account endpoints use Django session cookies; every non-`GET` request must send the `X-CSRFToken` header (call `GET /api/auth/csrf/` once to receive the `csrftoken` cookie). Endpoints under `/api/me/` return `401` when not signed in. Paths end in a slash when calling Django directly.

### `GET /api/jobs/`

Search jobs. Serves from an in-memory cache first, then Adzuna, then falls back to whatever rows are already in `job_postings` if Adzuna is unreachable.

| Query param | Default | Description |
| --- | --- | --- |
| `q` | `''` | Keyword |
| `location` | `''` | Location |
| `page` | `1` | 20 results per page |

```json
{
  "jobs": [
    {
      "id": "5312345678",
      "source": "adzuna",
      "title": "Junior Software Engineer",
      "company": "Example Pty Ltd",
      "location": "Perth, WA",
      "salary_min": 75000,
      "salary_max": 90000,
      "url": "https://www.adzuna.com.au/...",
      "posted_at": "2026-07-28T09:14:00Z",
      "category": "IT Jobs"
    }
  ],
  "page": 1,
  "total_pages": 12,
  "total_count": 231,
  "cached": false
}
```

### `GET /api/jobs/<external_id>/`

Full detail for one posting, including `description`. Reads only from the local cache, so it 404s for an id that was never returned by a search.

### `GET /api/market-overview/`

Aggregates for the charts.

```json
{
  "skills": ["Python", "Java", "..."],
  "salary_by_skill": [{ "skill": "SQL", "salary": 114770, "count": 5 }],
  "demand_by_skill": {
    "Python": [{ "date": "2026-07-29", "count": 412 }]
  },
  "top_locations": [{ "location": "Perth", "count": 165 }],
  "posting_count": 293
}
```

- `skills` is the tracked-skills list (drives the filter pills).
- `salary_by_skill` is each skill's average annual salary from its latest snapshot, highest first; `count` is how many salaried postings it is based on. Salaries outside $30k–$400k are ignored as bad data. If no snapshot has salary data yet (`fetch_jobs` hasn't run since this was added), it falls back to matching skills against the cached postings' title and description.
- `demand_by_skill` is the accumulated `demand_snapshots` history, grouped by skill and ordered by date.
- `top_locations` are the most common locations among cached postings, grouped by city/region; `posting_count` is how many postings that covers.

### Auth

| Method & path | Body | Result |
| --- | --- | --- |
| `GET /api/auth/csrf/` | — | Sets the `csrftoken` cookie |
| `GET /api/auth/me/` | — | `{ "user": { id, name, email } }`, or `{ "user": null }` |
| `POST /api/auth/register/` | `{ name, email, password }` | `201` with the new user, and signs them in. `400` with `error` / `errors` for a bad email, a weak password (min 8 chars, not common or all-numeric) or a duplicate email |
| `POST /api/auth/login/` | `{ email, password }` | `200` with the user, or `401` |
| `POST /api/auth/logout/` | — | `{ "ok": true }` |

Emails are lower-cased and used as the Django `username`; `name` is stored in `first_name`.

### Saved jobs and searches (sign-in required)

| Method & path | Body | Result |
| --- | --- | --- |
| `GET /api/me/favourites/` | — | `{ "favourite_jobs": [...] }`, newest first |
| `POST /api/me/favourites/` | `{ adzuna_id, title, company, location, salary_min, salary_max, redirect_url }` | `201` (or `200` if already saved) with `favourite_job` |
| `DELETE /api/me/favourites/<id>/` | — | `204`, or `404` if it isn't yours |
| `GET /api/me/searches/` | — | `{ "saved_searches": [...] }`, newest first |
| `POST /api/me/searches/` | `{ keyword, location }` (at least one) | `201` (or `200` if already saved) with `saved_search` |
| `PATCH /api/me/searches/<id>/` | `{ "alert_enabled": true }` or `false` | The updated `saved_search` |
| `DELETE /api/me/searches/<id>/` | — | `204`, or `404` if it isn't yours |

> `alert_enabled` is stored but nothing sends alerts yet.

---

## Data model

| Table | Created by | Purpose |
| --- | --- | --- |
| `job_postings` | `schema.sql` (`init_db`) | Cached listings, upserted on `(source, external_id)` |
| `demand_snapshots` | `schema.sql` (`init_db`) | One row per skill per day: `count` of matching postings, plus `avg_salary` / `salary_samples` |
| `auth_user` | Django `migrate` | Accounts (email as username) |
| `favourite_jobs` | Django `migrate` | Saved jobs per user (unique per user + Adzuna id) |
| `saved_searches` | Django `migrate` | Saved keyword/location filters, with an alert flag |


---

## Team members

| Name | GitHub | Responsible for |
| --- | --- | --- |
| Soyeon Kim | [@soyeonkim00](https://github.com/soyeonkim00) | Sidebar navigation, login / register page |
| Lee Jon | [@LeeJon94](https://github.com/LeeJon94) | Me page — favourites and saved searches |
| Yupei | [@zyp-gamer](https://github.com/zyp-gamer) | Market overview page — salary and demand charts |
| Angie Lee | [@dldmewl2970](https://github.com/dldmewl2970) | Job search page — search, filters, pagination |

