from django.urls import path

from . import views

urlpatterns = [
    path('jobs/', views.job_search, name='job_search'),
    path('jobs/<str:external_id>/', views.job_detail, name='job_detail'),
    path('market-overview/', views.market_overview, name='market_overview'),
]
