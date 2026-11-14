import logging
import math

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .market import salary_by_skill, top_locations
from .models import DemandSnapshot, JobPosting
from .services import AdzunaError, save_jobs, search_adzuna_jobs
from .skills import TRACKED_SKILLS



logger = logging.getLogger(__name__)

RESULTS_PER_PAGE = 20


@require_GET
def job_search(request):
    """On-demand job search: serves from a short-lived cache, falling back to
    Adzuna on a cache miss, and to the last cached DB rows if Adzuna fails."""
    keyword = request.GET.get('q', '').strip()
    location = request.GET.get('location', '').strip()
    page = _parse_page(request.GET.get('page'))
    # If there is cached data for this query, return it immediately. Otherwise, call Adzuna API
    cache_key = f'jobs_search:{keyword.lower()}:{location.lower()}:{page}'
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse({**cached, 'cached': True})

    try:
        results, total_count = search_adzuna_jobs(
            keyword=keyword, location=location, page=page, results_per_page=RESULTS_PER_PAGE
        )
        save_jobs(results)
        jobs = [_serialize_search_result(job) for job in results]
    except AdzunaError as exc:
        logger.warning('Falling back to cached DB rows, Adzuna call failed: %s', exc)
        queryset = _query_cached_postings(keyword, location)
        total_count = queryset.count()
        offset = (page - 1) * RESULTS_PER_PAGE
        jobs = [_serialize_posting(posting) for posting in queryset[offset:offset + RESULTS_PER_PAGE]]

    payload = {
        'jobs': jobs,
        'page': page,
        'total_pages': max(1, math.ceil(total_count / RESULTS_PER_PAGE)),
        'total_count': total_count,
    }
    cache.set(cache_key, payload, settings.JOB_SEARCH_CACHE_TTL_SECONDS)
    return JsonResponse({**payload, 'cached': False})


def _parse_page(raw):
    try:
        page = int(raw)
    except (TypeError, ValueError):
        return 1
    return page if page > 0 else 1


def _query_cached_postings(keyword, location):
    queryset = JobPosting.objects.all()
    if keyword:
        queryset = queryset.filter(title__icontains=keyword)
    if location:
        queryset = queryset.filter(location__icontains=location)
    return queryset.order_by('-last_updated')


def _serialize_search_result(job):
    return {
        'id': job['external_id'],
        'source': 'adzuna',
        'title': job['title'],
        'company': job['company'],
        'location': job['location'],
        'salary_min': job['salary_min'],
        'salary_max': job['salary_max'],
        'url': job['url'],
        'posted_at': job['posted_at'],
        'category': job.get('category', ''),
    }


def _serialize_posting(posting):
    return {
        'id': posting.external_id,
        'source': posting.source,
        'title': posting.title,
        'company': posting.company,
        'location': posting.location,
        'salary_min': posting.salary_min,
        'salary_max': posting.salary_max,
        'url': posting.url,
        'posted_at': posting.posted_at.isoformat() if posting.posted_at else None,
        'category': posting.category or '',
    }


@require_GET
def job_detail(request, external_id):
    """Full details for a single job posting, read from the DB cache that
    job_search populates. A detail page is only reachable after a search, so a
    miss here means the id is stale or was never searched."""
    posting = JobPosting.objects.filter(external_id=external_id).order_by('-last_updated').first()
    if posting is None:
        return JsonResponse({'error': 'Job not found'}, status=404)
    
    return JsonResponse({'job': {
        **_serialize_posting(posting),
        'description': posting.description,
    }})

@require_GET
def market_overview(request):
    """Data for the market overview page, built from the cached postings and
    the daily demand snapshots recorded by `fetch_jobs`."""
    postings = list(
        JobPosting.objects.values('title', 'description', 'salary_min', 'salary_max', 'location')
    )

    demand_rows = (
        DemandSnapshot.objects
        .order_by('skill', 'captured_at')
        .values('skill', 'count', 'captured_at', 'avg_salary', 'salary_samples')
    )

    demand_by_skill = {}
    latest_salary = {}
    for row in demand_rows:
        if row['avg_salary']:
            # Rows are ordered by date, so the last one seen per skill is the latest.
            latest_salary[row['skill']] = {
                'skill': row['skill'],
                'salary': row['avg_salary'],
                'count': row['salary_samples'] or 0,
            }
        demand_by_skill.setdefault(row['skill'], []).append({
            'date': row['captured_at'].isoformat() if row['captured_at'] else None,
            'count': row['count'] or 0,
        })

    if latest_salary:
        salaries = sorted(latest_salary.values(), key=lambda row: row['salary'], reverse=True)
    else:
        # No snapshot has salary data yet (fetch_jobs hasn't run since this was
        # added), so estimate from whichever cached postings mention each skill.
        salaries = salary_by_skill(postings, TRACKED_SKILLS)

    return JsonResponse({
        'skills': TRACKED_SKILLS,
        'salary_by_skill': salaries,
        'demand_by_skill': demand_by_skill,
        'top_locations': top_locations(p['location'] for p in postings),
        'posting_count': len(postings),
    })
