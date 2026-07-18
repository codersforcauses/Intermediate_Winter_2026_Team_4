import datetime

from django.core.management.base import BaseCommand

from jobs.models import DemandSnapshot
from jobs.services import AdzunaError, save_jobs, search_adzuna_jobs

# Skills tracked for the market overview page. Extend as needed.
TRACKED_SKILLS = [
    'Python',
    'Java',
    'JavaScript',
    'React',
    'SQL',
    'Data Analyst',
    'DevOps',
    'Cloud',
    'Machine Learning',
    '.NET',
]


class Command(BaseCommand):
    """Batch-fetch jobs for tracked skills and record daily demand snapshots.

    Intended to run on a schedule (cron / Celery beat), not on every page
    load — see jobs/views.py for the on-demand, cached search path used by
    the dashboard's free-text search.
    """

    help = 'Fetch Adzuna jobs for tracked skills and store a daily demand snapshot per skill.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--location',
            default='Western Australia',
            help='Location passed to Adzuna for every tracked skill (default: "Western Australia").',
        )

    def handle(self, *args, **options):
        location = options['location']
        today = datetime.date.today()

        for skill in TRACKED_SKILLS:
            try:
                results, _ = search_adzuna_jobs(keyword=skill, location=location, results_per_page=50)
            except AdzunaError as exc:
                self.stderr.write(self.style.WARNING(f'Skipping "{skill}": {exc}'))
                continue

            save_jobs(results)
            DemandSnapshot.objects.update_or_create(
                skill=skill,
                captured_at=today,
                defaults={'count': len(results)},
            )
            self.stdout.write(self.style.SUCCESS(f'{skill}: {len(results)} jobs saved'))
