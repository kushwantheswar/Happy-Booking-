from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return self.email


class Movie(models.Model):
    LANGUAGE_CHOICES = [
        ('Hindi', 'Hindi'), ('English', 'English'), ('Tamil', 'Tamil'),
        ('Telugu', 'Telugu'), ('Kannada', 'Kannada'), ('Malayalam', 'Malayalam'),
    ]
    GENRE_CHOICES = [
        ('Action', 'Action'), ('Comedy', 'Comedy'), ('Drama', 'Drama'),
        ('Horror', 'Horror'), ('Romance', 'Romance'), ('Thriller', 'Thriller'),
        ('Sci-Fi', 'Sci-Fi'), ('Animation', 'Animation'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration = models.IntegerField(help_text='Duration in minutes')
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='Hindi')
    genre = models.CharField(max_length=20, choices=GENRE_CHOICES, default='Action')
    release_date = models.DateField()
    poster = models.ImageField(upload_to='posters/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-release_date']


class Theater(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    total_screens = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.city}"


class Screen(models.Model):
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name='screens')
    name = models.CharField(max_length=50)
    total_seats = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.theater.name} - {self.name}"


class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='shows')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='shows')
    start_time = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.movie.title} at {self.start_time}"

    class Meta:
        ordering = ['start_time']


class Seat(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('locked', 'Locked'),
        ('booked', 'Booked'),
    ]
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=2)
    number = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    locked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='locked_seats')
    locked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('show', 'row', 'number')
        ordering = ['row', 'number']

    def __str__(self):
        return f"{self.row}{self.number} - Show {self.show_id}"

    def is_lock_expired(self):
        if self.status == 'locked' and self.locked_at:
            return timezone.now() > self.locked_at + timezone.timedelta(minutes=8)
        return False


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='bookings')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='confirmed')
    booking_reference = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.booking_reference} by {self.user.email}"

    class Meta:
        ordering = ['-created_at']


class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('booking', 'seat')
