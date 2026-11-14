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
            self._add_missing_columns(cursor)

        self.stdout.write(self.style.SUCCESS(f'Applied {schema.name}'))

    @staticmethod
    def _add_missing_columns(cursor):
        """CREATE TABLE IF NOT EXISTS won't add columns introduced after a
        table already exists, so add those to older local databases here."""
        existing = {row[1] for row in cursor.execute('PRAGMA table_info(demand_snapshots)')}
        for column in ('avg_salary', 'salary_samples'):
            if column not in existing:
                cursor.execute(f'ALTER TABLE demand_snapshots ADD COLUMN {column} INTEGER')
