from django.urls import path

from . import views

urlpatterns = [
    path('auth/csrf/', views.csrf, name='auth_csrf'),
    path('auth/me/', views.me, name='auth_me'),
    path('auth/register/', views.register, name='auth_register'),
    path('auth/login/', views.login_view, name='auth_login'),
    path('auth/logout/', views.logout_view, name='auth_logout'),
    path('me/favourites/', views.favourites, name='favourites'),
    path('me/favourites/<int:favourite_id>/', views.favourite_detail, name='favourite_detail'),
    path('me/searches/', views.searches, name='searches'),
    path('me/searches/<int:search_id>/', views.search_detail, name='search_detail'),
]
