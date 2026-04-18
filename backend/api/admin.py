from django.contrib import admin
from .models import User, Movie, Theater, Screen, Show, Seat, Booking, BookingSeat

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_admin', 'is_active', 'date_joined')
    list_filter = ('is_admin', 'is_active')
    search_fields = ('email', 'username')

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'genre', 'language', 'release_date', 'is_active')
    list_filter = ('genre', 'language', 'is_active')
    search_fields = ('title',)

@admin.register(Theater)
class TheaterAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'total_screens', 'is_active')

@admin.register(Screen)
class ScreenAdmin(admin.ModelAdmin):
    list_display = ('name', 'theater', 'total_seats')

@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    list_display = ('movie', 'screen', 'start_time', 'price', 'is_active')
    list_filter = ('is_active',)

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('show', 'row', 'number', 'status')
    list_filter = ('status',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'user', 'show', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(BookingSeat)
class BookingSeatAdmin(admin.ModelAdmin):
    list_display = ('booking', 'seat')
