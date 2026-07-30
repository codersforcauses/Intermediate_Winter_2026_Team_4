# JobRader

Job market insights for job seekers — search live listings and see how demand and salaries move across skills.

Built for **Coders for Causes — Intermediate Winter 2026, Team 4**.

JobRader pulls job listings from the [Adzuna API](https://developer.adzuna.com/), caches them locally, and records a daily snapshot of how many postings match each tracked skill. That history is what powers the market overview charts — Adzuna only exposes current listings, so the trend data has to be accumulated over time by our own scheduled job.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Django 4.2 |
| Database | SQLite, schema managed by hand via `schema.sql` |
| External data | Adzuna Jobs API |

---

## Features

- **Market overview** (`/Market-Overview`) — average salary by skill and a demand-over-time line chart, filterable by skill.
- **Job listings** (`/dashboard`) — free-text keyword and location search with paginated results, backed by a 30-minute cache so we don't burn through the Adzuna rate limit.
- **Job detail** (`/jobs/[id]`) — full description for a single posting, read from the local cache.
- **Me** (`/me`) — favourited jobs and saved searches.
- **Login / Register** (`/login`) — UI is in place; not yet wired to a backend auth endpoint.

---

## Project structure

```
.
├── backend/                     # Django project
│   ├── config/                  # settings, urls, wsgi/asgi
│   ├── jobs/                    # the only app
│   │   ├── models.py            # JobPosting, DemandSnapshot (managed = False)
│   │   ├── services.py          # Adzuna client + normalisation + upsert
│   │   ├── views.py             # job_search, job_detail, market_overview
│   │   └── management/commands/
│   │       └── fetch_jobs.py    # scheduled batch fetch + daily snapshot
│   ├── schema.sql               # source of truth for the DB schema
│   └── requirements.txt
└── frontend/                    # Next.js app
    └── app/
        ├── api/jobs/            # route handlers proxying the Django API
        ├── components/Sidebar.tsx
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
pip install django-cors-headers # not yet pinned in requirements.txt, but settings.py needs it
```

Create `backend/.env`:

```env
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
ADZUNA_COUNTRY=au
```

Create the database. The `jobs` models are declared `managed = False`, so `migrate` will **not** create `job_postings` or `demand_snapshots` — `schema.sql` does:

```bash
sqlite3 db.sqlite3 < schema.sql   # app tables
python manage.py migrate          # Django's own tables (auth, sessions, admin)
python manage.py runserver        # http://127.0.0.1:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

The Next.js route handlers proxy to Django at `http://127.0.0.1:8000/api/jobs/` by default. Override with `DJANGO_API_URL` in `frontend/.env.local` if your backend runs elsewhere.

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

Tracked skills live in `TRACKED_SKILLS` at the top of `fetch_jobs.py`. In production this should run once a day on cron or Celery beat — never on a page load.

---

## Environment variables

| Variable | Where | Required | Default |
| --- | --- | --- | --- |
| `ADZUNA_APP_ID` | `backend/.env` | Yes | `''` |
| `ADZUNA_APP_KEY` | `backend/.env` | Yes | `''` |
| `ADZUNA_COUNTRY` | `backend/.env` | No | `au` |
| `DJANGO_API_URL` | `frontend/.env.local` | No | `http://127.0.0.1:8000/api/jobs/` |

---

## API reference

All endpoints are `GET` only and return JSON.

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
  "salary_by_skill": [{ "skill": "IT Jobs", "salary": 105000 }],
  "demand_by_skill": {
    "Python": [{ "date": "2026-07-29", "count": 412 }]
  }
}
```

`salary_by_skill` averages the midpoint of `salary_min`/`salary_max` grouped by Adzuna category. `demand_by_skill` is the accumulated `demand_snapshots` history, grouped by skill and ordered by date.

---

## Data model

Defined in `schema.sql`. `users`, `favourite_jobs`, and `saved_searches` exist in the schema but aren't wired to Django models yet.

| Table | Purpose |
| --- | --- |
| `job_postings` | Cached listings, upserted on `(source, external_id)` |
| `demand_snapshots` | One row per skill per day: `count` of matching postings |
| `users` | Email + password hash |
| `favourite_jobs` | Saved jobs per user |
| `saved_searches` | Saved keyword/location filters, with an alert flag |


---

## Team members

| Name | GitHub | Responsible for |
| --- | --- | --- |
| Soyeon Kim | [@soyeonkim00](https://github.com/soyeonkim00) | Sidebar navigation, login / register page |
| Lee Jon | [@LeeJon94](https://github.com/LeeJon94) | Me page — favourites and saved searches |
| Yupei | [@zyp-gamer](https://github.com/zyp-gamer) | Market overview page — salary and demand charts |
| Angie Lee | [@dldmewl2970](https://github.com/dldmewl2970) | Job search page — search, filters, pagination |

