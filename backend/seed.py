#!/usr/bin/env python
"""
Seed script – creates admin user + sample data.
Run: python seed.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from api.models import User, Movie, Theater, Screen, Show

# ── Admin user ──
if not User.objects.filter(email='admin@happybooking.com').exists():
    User.objects.create_superuser(
        email='admin@happybooking.com',
        username='admin',
        password='admin123',
    )
    print('✓ Admin created  →  admin@happybooking.com / admin123')
else:
    print('  Admin already exists')

# ── Sample movies ──
movies_data = [
    dict(title='Kalki 2898 AD', description='A sci-fi epic set in the future of India, blending mythology and technology.', duration=181, language='Telugu', genre='Sci-Fi', release_date='2024-06-27', rating=8.2),
    dict(title='Fighter', description='The story of India\'s top air warriors and their quest for a victory.', duration=166, language='Hindi', genre='Action', release_date='2024-01-25', rating=7.4),
    dict(title='Animal', description='A son\'s obsession with his father leads to a series of violent events.', duration=204, language='Hindi', genre='Action', release_date='2023-12-01', rating=7.8),
    dict(title='Stree 2', description='The men of Chanderi face a new supernatural threat in this horror comedy.', duration=150, language='Hindi', genre='Horror', release_date='2024-08-15', rating=8.5),
    dict(title='Pushpa 2: The Rule', description='Pushpa Raj returns with even more dominance in the red sandalwood smuggling empire.', duration=220, language='Telugu', genre='Action', release_date='2024-12-05', rating=8.1),
    dict(title='Merry Christmas', description='A chance encounter between two strangers on Christmas Eve leads to a mystery.', duration=130, language='Hindi', genre='Thriller', release_date='2024-01-12', rating=7.2),
]

created_movies = []
for m in movies_data:
    movie, created = Movie.objects.get_or_create(title=m['title'], defaults=m)
    created_movies.append(movie)
    if created:
        print(f'✓ Movie: {movie.title}')

# ── Theater ──
theater, _ = Theater.objects.get_or_create(
    name='PVR Cinemas',
    defaults=dict(location='Connaught Place', city='New Delhi', total_screens=5)
)
theater2, _ = Theater.objects.get_or_create(
    name='INOX Multiplex',
    defaults=dict(location='Phoenix Mall', city='Mumbai', total_screens=4)
)
print('✓ Theaters ready')

# ── Screens ──
screen1, _ = Screen.objects.get_or_create(theater=theater, name='Audi 1', defaults={'total_seats': 100})
screen2, _ = Screen.objects.get_or_create(theater=theater, name='Audi 2', defaults={'total_seats': 80})
screen3, _ = Screen.objects.get_or_create(theater=theater2, name='Screen A', defaults={'total_seats': 120})
print('✓ Screens ready')

# ── Shows ──
from datetime import datetime, timedelta

def make_show(movie, screen, hour_offset, price):
    start = timezone.now().replace(hour=hour_offset, minute=0, second=0, microsecond=0) + timedelta(days=1)
    show, created = Show.objects.get_or_create(
        movie=movie, screen=screen, start_time=start,
        defaults={'price': price}
    )
    if created:
        # auto-create seats
        from api.models import Seat
        rows = ['A','B','C','D','E','F','G','H','I','J']
        seats_per_row = max(1, screen.total_seats // len(rows))
        Seat.objects.bulk_create([
            Seat(show=show, row=r, number=n)
            for r in rows for n in range(1, seats_per_row+1)
        ])
        print(f'  ✓ Show: {movie.title} @ {start.strftime("%H:%M")}')

make_show(created_movies[0], screen1, 10, 250)
make_show(created_movies[0], screen1, 14, 280)
make_show(created_movies[0], screen1, 18, 300)
make_show(created_movies[1], screen2, 11, 220)
make_show(created_movies[1], screen2, 16, 250)
make_show(created_movies[2], screen3, 13, 200)
make_show(created_movies[3], screen1, 15, 270)
make_show(created_movies[4], screen2, 19, 350)
make_show(created_movies[5], screen3, 12, 180)

print('\n🎬 Seed complete! Login: admin@happybooking.com / admin123')
