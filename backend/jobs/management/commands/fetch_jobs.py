import datetime

from django.core.management.base import BaseCommand

from jobs.market import posting_salary
from jobs.models import DemandSnapshot
from jobs.services import AdzunaError, save_jobs, search_adzuna_jobs
from jobs.skills import TRACKED_SKILLS

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
        parser.add_argument(
            '--date',
            default=None,
            help='Date (YYYY-MM-DD) to record the snapshot under (default: today). '
                 'Adzuna only exposes current listings, so this backdates the label, '
                 'not the underlying data.',
        )

    def handle(self, *args, **options):
        location = options['location']
        captured_at = (
            datetime.date.fromisoformat(options['date']) if options['date'] else datetime.date.today()
        )

        for skill in TRACKED_SKILLS:
            try:
                results, total_count = search_adzuna_jobs(keyword=skill, location=location, results_per_page=50)
            except AdzunaError as exc:
                self.stderr.write(self.style.WARNING(f'Skipping "{skill}": {exc}'))
                continue

            save_jobs(results)

            salaries = [
                s for s in (posting_salary(job['salary_min'], job['salary_max']) for job in results)
                if s is not None
            ]
            DemandSnapshot.objects.update_or_create(
                skill=skill,
                captured_at=captured_at,
                defaults={
                    'count': total_count,
                    'avg_salary': round(sum(salaries) / len(salaries)) if salaries else None,
                    'salary_samples': len(salaries),
                },
            )
            self.stdout.write(self.style.SUCCESS(
                f'{skill}: {total_count} jobs matching ({len(results)} saved, '
                f'{len(salaries)} with a usable salary)'
            ))
