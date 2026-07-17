from django.db import models


class JobPosting(models.Model):
    """Cached job listing, sourced from an external provider (e.g. Adzuna)."""

    job_postings_id = models.AutoField(primary_key=True)
    source = models.TextField(null=True, blank=True)
    external_id = models.TextField(null=True, blank=True)
    title = models.TextField(null=True, blank=True)
    company = models.TextField(null=True, blank=True)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    url = models.TextField(null=True, blank=True)
    category = models.TextField(null=True, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        # The table is created by schema.sql, not Django migrations.
        managed = False
        db_table = 'job_postings'


class DemandSnapshot(models.Model):
    """Daily count of job postings matching a tracked skill, for market overview trends."""

    demand_snapshots_id = models.AutoField(primary_key=True)
    skill = models.TextField(null=True, blank=True)
    count = models.IntegerField(null=True, blank=True)
    captured_at = models.DateField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        # The table is created by schema.sql, not Django migrations.
        managed = False
        db_table = 'demand_snapshots'
