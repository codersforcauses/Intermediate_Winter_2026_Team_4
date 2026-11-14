import json
from functools import wraps

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import FavouriteJob, SavedSearch

User = get_user_model()


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def _json_body(request):
    """Parse the request body as a JSON object, or return None if it isn't one."""
    try:
        data = json.loads(request.body or b'{}')
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def _bad_request(message, status=400, **extra):
    return JsonResponse({'error': message, **extra}, status=status)


def _text(value, limit=2000):
    return value.strip()[:limit] if isinstance(value, str) else ''


def _int_or_none(value):
    if isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _user_payload(user):
    return {
        'id': user.pk,
        'name': user.first_name or user.email.split('@')[0],
        'email': user.email,
    }


def api_login_required(view):
    """Like login_required, but answers with JSON 401 instead of redirecting."""

    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return _bad_request('Authentication required', status=401)
        return view(request, *args, **kwargs)

    return wrapper


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------

@require_GET
@ensure_csrf_cookie
def csrf(request):
    """Sets the csrftoken cookie so the frontend can send X-CSRFToken on writes."""
    return JsonResponse({'ok': True})


@require_GET
@ensure_csrf_cookie
def me(request):
    user = request.user
    return JsonResponse({'user': _user_payload(user) if user.is_authenticated else None})


@require_POST
def register(request):
    data = _json_body(request)
    if data is None:
        return _bad_request('Invalid JSON body')

    name = _text(data.get('name'), 150)
    email = _text(data.get('email'), 150).lower()
    password = data.get('password') if isinstance(data.get('password'), str) else ''

    errors = {}
    try:
        validate_email(email)
    except ValidationError:
        errors['email'] = 'Enter a valid email address.'
    else:
        if User.objects.filter(username=email).exists():
            errors['email'] = 'An account with this email already exists.'

    try:
        validate_password(password)
    except ValidationError as exc:
        errors['password'] = ' '.join(exc.messages)

    if errors:
        return _bad_request(next(iter(errors.values())), errors=errors)

    user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
    login(request, user)
    return JsonResponse({'user': _user_payload(user)}, status=201)


@require_POST
def login_view(request):
    data = _json_body(request)
    if data is None:
        return _bad_request('Invalid JSON body')

    email = _text(data.get('email'), 150).lower()
    password = data.get('password') if isinstance(data.get('password'), str) else ''

    user = authenticate(request, username=email, password=password)
    if user is None:
        return _bad_request('Incorrect email or password.', status=401)

    login(request, user)
    return JsonResponse({'user': _user_payload(user)})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'ok': True})


# --------------------------------------------------------------------------
# Favourite jobs
# --------------------------------------------------------------------------

def _serialize_favourite(fav):
    return {
        'favourite_jobs_id': fav.favourite_jobs_id,
        'adzuna_id': fav.adzuna_id,
        'title': fav.title,
        'company': fav.company,
        'location': fav.location,
        'salary_min': fav.salary_min,
        'salary_max': fav.salary_max,
        'redirect_url': fav.redirect_url,
        'saved_at': fav.saved_at.isoformat(),
    }


@api_login_required
@require_http_methods(['GET', 'POST'])
def favourites(request):
    if request.method == 'GET':
        items = request.user.favourite_jobs.all()
        return JsonResponse({'favourite_jobs': [_serialize_favourite(f) for f in items]})

    data = _json_body(request)
    if data is None:
        return _bad_request('Invalid JSON body')

    adzuna_id = _text(data.get('adzuna_id'), 200)
    if not adzuna_id:
        return _bad_request('adzuna_id is required')

    favourite, created = FavouriteJob.objects.get_or_create(
        user=request.user,
        adzuna_id=adzuna_id,
        defaults={
            'title': _text(data.get('title'), 500),
            'company': _text(data.get('company'), 500),
            'location': _text(data.get('location'), 500),
            'salary_min': _int_or_none(data.get('salary_min')),
            'salary_max': _int_or_none(data.get('salary_max')),
            'redirect_url': _text(data.get('redirect_url'), 2000),
        },
    )
    return JsonResponse(
        {'favourite_job': _serialize_favourite(favourite)}, status=201 if created else 200
    )


@api_login_required
@require_http_methods(['DELETE'])
def favourite_detail(request, favourite_id):
    deleted, _ = request.user.favourite_jobs.filter(pk=favourite_id).delete()
    if not deleted:
        return _bad_request('Not found', status=404)
    return HttpResponse(status=204)


# --------------------------------------------------------------------------
# Saved searches
# --------------------------------------------------------------------------

def _serialize_search(search):
    return {
        'saved_searches_id': search.saved_searches_id,
        'keyword': search.keyword,
        'location': search.location,
        'sort_by': search.sort_by,
        'alert_enabled': search.alert_enabled,
        'created_at': search.created_at.isoformat(),
    }


@api_login_required
@require_http_methods(['GET', 'POST'])
def searches(request):
    if request.method == 'GET':
        items = request.user.saved_searches.all()
        return JsonResponse({'saved_searches': [_serialize_search(s) for s in items]})

    data = _json_body(request)
    if data is None:
        return _bad_request('Invalid JSON body')

    keyword = _text(data.get('keyword'), 200)
    location = _text(data.get('location'), 200)
    if not keyword and not location:
        return _bad_request('Enter a keyword or location before saving a search.')

    search, created = SavedSearch.objects.get_or_create(
        user=request.user, keyword=keyword, location=location
    )
    return JsonResponse({'saved_search': _serialize_search(search)}, status=201 if created else 200)


@api_login_required
@require_http_methods(['PATCH', 'DELETE'])
def search_detail(request, search_id):
    search = request.user.saved_searches.filter(pk=search_id).first()
    if search is None:
        return _bad_request('Not found', status=404)

    if request.method == 'DELETE':
        search.delete()
        return HttpResponse(status=204)

    data = _json_body(request)
    if data is None or not isinstance(data.get('alert_enabled'), bool):
        return _bad_request('alert_enabled (true/false) is required')
    search.alert_enabled = data['alert_enabled']
    search.save()
    return JsonResponse({'saved_search': _serialize_search(search)})
