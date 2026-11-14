import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import FavouriteJob, SavedSearch

User = get_user_model()

GOOD_PASSWORD = 'correct-horse-battery'


def post_json(client, url, payload):
    return client.post(url, data=json.dumps(payload), content_type='application/json')


class AuthTests(TestCase):
    def register(self, **overrides):
        payload = {'name': 'Yeona Kim', 'email': 'Yeona@Example.com', 'password': GOOD_PASSWORD}
        payload.update(overrides)
        return post_json(self.client, reverse('auth_register'), payload)

    def test_register_creates_user_and_logs_in(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['user']['email'], 'yeona@example.com')
        self.assertEqual(response.json()['user']['name'], 'Yeona Kim')

        me = self.client.get(reverse('auth_me')).json()
        self.assertEqual(me['user']['email'], 'yeona@example.com')

    def test_register_rejects_duplicate_email_case_insensitively(self):
        self.register()
        response = self.register(email='YEONA@example.com')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json()['errors'])

    def test_register_rejects_bad_email_and_weak_password(self):
        self.assertEqual(self.register(email='not-an-email').status_code, 400)
        self.assertEqual(self.register(password='123').status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_register_rejects_invalid_json(self):
        response = self.client.post(
            reverse('auth_register'), data='nope', content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_login_logout_roundtrip(self):
        User.objects.create_user('a@example.com', 'a@example.com', GOOD_PASSWORD)

        bad = post_json(self.client, reverse('auth_login'), {'email': 'a@example.com', 'password': 'wrong'})
        self.assertEqual(bad.status_code, 401)

        good = post_json(self.client, reverse('auth_login'), {'email': 'A@example.com', 'password': GOOD_PASSWORD})
        self.assertEqual(good.status_code, 200)
        self.assertIsNotNone(self.client.get(reverse('auth_me')).json()['user'])

        self.assertEqual(self.client.post(reverse('auth_logout')).status_code, 200)
        self.assertIsNone(self.client.get(reverse('auth_me')).json()['user'])

    def test_me_sets_csrf_cookie(self):
        response = self.client.get(reverse('auth_csrf'))
        self.assertIn('csrftoken', response.cookies)


class FavouriteTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('a@example.com', 'a@example.com', GOOD_PASSWORD)
        self.other = User.objects.create_user('b@example.com', 'b@example.com', GOOD_PASSWORD)
        self.client.force_login(self.user)
        self.job = {
            'adzuna_id': '123',
            'title': 'Junior Dev',
            'company': 'Acme',
            'location': 'Perth',
            'salary_min': 70000,
            'salary_max': '90000',
            'redirect_url': 'https://example.com/job',
        }

    def test_requires_login(self):
        self.client.logout()
        self.assertEqual(self.client.get(reverse('favourites')).status_code, 401)
        self.assertEqual(post_json(self.client, reverse('favourites'), self.job).status_code, 401)

    def test_add_list_and_dedupe(self):
        first = post_json(self.client, reverse('favourites'), self.job)
        self.assertEqual(first.status_code, 201)
        again = post_json(self.client, reverse('favourites'), self.job)
        self.assertEqual(again.status_code, 200)

        listing = self.client.get(reverse('favourites')).json()['favourite_jobs']
        self.assertEqual(len(listing), 1)
        self.assertEqual(listing[0]['salary_max'], 90000)
        self.assertEqual(listing[0]['adzuna_id'], '123')

    def test_requires_adzuna_id(self):
        response = post_json(self.client, reverse('favourites'), {'title': 'x'})
        self.assertEqual(response.status_code, 400)

    def test_delete_own_only(self):
        mine = FavouriteJob.objects.create(user=self.user, adzuna_id='1')
        theirs = FavouriteJob.objects.create(user=self.other, adzuna_id='2')

        self.assertEqual(self.client.delete(reverse('favourite_detail', args=[theirs.pk])).status_code, 404)
        self.assertTrue(FavouriteJob.objects.filter(pk=theirs.pk).exists())

        self.assertEqual(self.client.delete(reverse('favourite_detail', args=[mine.pk])).status_code, 204)
        self.assertFalse(FavouriteJob.objects.filter(pk=mine.pk).exists())

    def test_list_only_shows_own(self):
        FavouriteJob.objects.create(user=self.other, adzuna_id='2')
        self.assertEqual(self.client.get(reverse('favourites')).json()['favourite_jobs'], [])


class SavedSearchTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('a@example.com', 'a@example.com', GOOD_PASSWORD)
        self.other = User.objects.create_user('b@example.com', 'b@example.com', GOOD_PASSWORD)
        self.client.force_login(self.user)

    def test_requires_login(self):
        self.client.logout()
        self.assertEqual(self.client.get(reverse('searches')).status_code, 401)

    def test_add_list_and_dedupe(self):
        url = reverse('searches')
        self.assertEqual(post_json(self.client, url, {'keyword': 'Python', 'location': 'Perth'}).status_code, 201)
        self.assertEqual(post_json(self.client, url, {'keyword': ' Python ', 'location': 'Perth'}).status_code, 200)
        self.assertEqual(len(self.client.get(url).json()['saved_searches']), 1)

    def test_rejects_empty_search(self):
        response = post_json(self.client, reverse('searches'), {'keyword': ' ', 'location': ''})
        self.assertEqual(response.status_code, 400)

    def test_toggle_alert_and_delete(self):
        search = SavedSearch.objects.create(user=self.user, keyword='Java')
        url = reverse('search_detail', args=[search.pk])

        response = self.client.patch(url, data=json.dumps({'alert_enabled': True}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        search.refresh_from_db()
        self.assertTrue(search.alert_enabled)

        bad = self.client.patch(url, data=json.dumps({'alert_enabled': 'yes'}), content_type='application/json')
        self.assertEqual(bad.status_code, 400)

        self.assertEqual(self.client.delete(url).status_code, 204)
        self.assertFalse(SavedSearch.objects.filter(pk=search.pk).exists())

    def test_cannot_touch_other_users_search(self):
        theirs = SavedSearch.objects.create(user=self.other, keyword='Go')
        url = reverse('search_detail', args=[theirs.pk])
        self.assertEqual(self.client.delete(url).status_code, 404)
        self.assertTrue(SavedSearch.objects.filter(pk=theirs.pk).exists())
