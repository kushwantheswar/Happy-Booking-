from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/me/', views.me, name='me'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Movies
    path('movies/', views.movies_list, name='movies_list'),
    path('movies/<int:pk>/', views.movie_detail, name='movie_detail'),

    # Theaters
    path('theaters/', views.theaters_list, name='theaters_list'),
    path('theaters/<int:pk>/', views.theater_detail, name='theater_detail'),

    # Screens
    path('screens/', views.screens_list, name='screens_list'),

    # Shows
    path('shows/', views.shows_list, name='shows_list'),
    path('shows/<int:pk>/', views.show_detail, name='show_detail'),

    # Seats
    path('seats/', views.seats_list, name='seats_list'),
    path('seats/lock/', views.lock_seats, name='lock_seats'),
    path('seats/unlock/', views.unlock_seats, name='unlock_seats'),

    # Bookings
    path('bookings/', views.book_seats, name='book_seats'),
    path('bookings/my/', views.my_bookings, name='my_bookings'),
    path('bookings/<int:pk>/', views.booking_detail, name='booking_detail'),
    path('bookings/<int:pk>/cancel/', views.cancel_booking, name='cancel_booking'),

    # Admin
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/bookings/', views.admin_bookings, name='admin_bookings'),
    path('health/', views.health_check, name='health_check'),
]
