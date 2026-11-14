from django.conf import settings
from django.db import models


class FavouriteJob(models.Model):
    """A job a user has saved. Fields are copied from the posting so the
    favourite still displays even if the cached posting is later refreshed."""

    favourite_jobs_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favourite_jobs'
    )
    adzuna_id = models.TextField()
    title = models.TextField(blank=True, default='')
    company = models.TextField(blank=True, default='')
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    location = models.TextField(blank=True, default='')
    redirect_url = models.TextField(blank=True, default='')
    saved_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'favourite_jobs'
        ordering = ['-saved_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'adzuna_id'], name='uniq_favourite_per_user'),
        ]


class SavedSearch(models.Model):
    """A keyword/location search a user wants to come back to."""

    saved_searches_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_searches'
    )
    keyword = models.TextField(blank=True, default='')
    location = models.TextField(blank=True, default='')
    sort_by = models.TextField(blank=True, default='')
    alert_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'saved_searches'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'keyword', 'location'], name='uniq_saved_search_per_user'
            ),
        ]
