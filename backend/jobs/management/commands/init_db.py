from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    """Create the unmanaged job-market tables from schema.sql (safe to re-run)."""

    help = 'Apply backend/schema.sql (job_postings, demand_snapshots and their indexes).'

    def handle(self, *args, **options):
        schema = Path(settings.BASE_DIR) / 'schema.sql'
        sql = schema.read_text(encoding='utf-8')

        with connection.cursor() as cursor:
            cursor.connection.executescript(sql)

        self.stdout.write(self.style.SUCCESS(f'Applied {schema.name}'))
