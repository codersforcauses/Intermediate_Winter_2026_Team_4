import logging

import requests
from django.conf import settings

from .models import JobPosting

logger = logging.getLogger(__name__)

ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs'
ADZUNA_SOURCE = 'adzuna'


class AdzunaError(Exception):
    """Raised when the Adzuna API request fails or credentials are missing."""

def search_adzuna_jobs(keyword='', location='', page=1, results_per_page=20):
    """Call the Adzuna search API and return a list of normalized job dicts."""
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        raise AdzunaError('ADZUNA_APP_ID / ADZUNA_APP_KEY are not configured')

    url = f'{ADZUNA_BASE_URL}/{settings.ADZUNA_COUNTRY}/search/{page}'
    params = {
        'app_id': settings.ADZUNA_APP_ID,
        'app_key': settings.ADZUNA_APP_KEY,
        'results_per_page': results_per_page,
        'content-type': 'application/json',
    }
    if keyword:
        params['what'] = keyword
    if location:
        params['where'] = location

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error('Adzuna request failed: %s', exc)
        raise AdzunaError(str(exc)) from exc

    payload = response.json()
    results = [_normalize_adzuna_result(item) for item in payload.get('results', [])]
    total_count = payload.get('count', len(results))
    return results, total_count


def _normalize_adzuna_result(item):
    salary_min = item.get('salary_min')
    salary_max = item.get('salary_max')
    return {
        'external_id': str(item.get('id', '')),
        'title': item.get('title', ''),
        'company': (item.get('company') or {}).get('display_name', ''),
        'salary_min': int(salary_min) if salary_min else None,
        'salary_max': int(salary_max) if salary_max else None,
        'location': (item.get('location') or {}).get('display_name', ''),
        'description': item.get('description', ''),
        'url': item.get('redirect_url', ''),
        'posted_at': item.get('created'),
        'category': (item.get('category') or {}).get('label', ''),
    }


def save_jobs(jobs, source=ADZUNA_SOURCE):
    """Upsert normalized job dicts into job_postings, keyed by (source, external_id)."""
    saved = []
    for job in jobs:
        posting, _created = JobPosting.objects.update_or_create(
            source=source,
            external_id=job['external_id'],
            defaults={
                'title': job['title'],
                'company': job['company'],
                'salary_min': job['salary_min'],
                'salary_max': job['salary_max'],
                'location': job['location'],
                'description': job['description'],
                'url': job['url'],
                'category': job['category'],
                'posted_at': job['posted_at'],
            },
        )
        saved.append(posting)
    return saved
