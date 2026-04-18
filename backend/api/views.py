import uuid
import random
import string
from django.utils import timezone
from django.db import transaction
from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Movie, Theater, Screen, Show, Seat, Booking, BookingSeat
from .serializers import (
    RegisterSerializer, UserSerializer, MovieSerializer,
    TheaterSerializer, ScreenSerializer, ShowSerializer,
    SeatSerializer, BookingSerializer
)


def generate_booking_ref():
    chars = string.ascii_uppercase + string.digits
    return 'HB' + ''.join(random.choices(chars, k=8))


# ────────────────────────────────────────────
#  AUTH
# ────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Format errors for frontend
    errors = {}
    for field, messages in serializer.errors.items():
        errors[field] = messages[0]
    return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
    except User.DoesNotExist:
        pass

    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ────────────────────────────────────────────
#  MOVIES
# ────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def movies_list(request):
    if request.method == 'GET':
        qs = Movie.objects.filter(is_active=True)
        genre = request.query_params.get('genre')
        language = request.query_params.get('language')
        search = request.query_params.get('search')
        if genre:
            qs = qs.filter(genre=genre)
        if language:
            qs = qs.filter(language=language)
        if search:
            qs = qs.filter(title__icontains=search)
        serializer = MovieSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    # POST - admin only
    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    serializer = MovieSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def movie_detail(request, pk):
    try:
        movie = Movie.objects.get(pk=pk)
    except Movie.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(MovieSerializer(movie, context={'request': request}).data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ('PUT', 'PATCH'):
        serializer = MovieSerializer(movie, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        movie.is_active = False
        movie.save()
        return Response({'message': 'Movie deleted'})


# ────────────────────────────────────────────
#  THEATERS
# ────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def theaters_list(request):
    if request.method == 'GET':
        qs = Theater.objects.filter(is_active=True)
        serializer = TheaterSerializer(qs, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    serializer = TheaterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def theater_detail(request, pk):
    try:
        theater = Theater.objects.get(pk=pk)
    except Theater.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(TheaterSerializer(theater).data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = TheaterSerializer(theater, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    theater.is_active = False
    theater.save()
    return Response({'message': 'Theater deleted'})


# ────────────────────────────────────────────
#  SCREENS
# ────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def screens_list(request):
    if request.method == 'GET':
        theater_id = request.query_params.get('theater_id')
        qs = Screen.objects.all()
        if theater_id:
            qs = qs.filter(theater_id=theater_id)
        return Response(ScreenSerializer(qs, many=True).data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    serializer = ScreenSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ────────────────────────────────────────────
#  SHOWS
# ────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def shows_list(request):
    if request.method == 'GET':
        qs = Show.objects.filter(is_active=True)
        movie_id = request.query_params.get('movie_id')
        if movie_id:
            qs = qs.filter(movie_id=movie_id)
        return Response(ShowSerializer(qs, many=True, context={'request': request}).data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ShowSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        show = serializer.save()
        # auto-create seats
        screen = show.screen
        rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        seats_per_row = max(1, screen.total_seats // len(rows))
        seats_to_create = []
        for row in rows:
            for num in range(1, seats_per_row + 1):
                seats_to_create.append(Seat(show=show, row=row, number=num))
        Seat.objects.bulk_create(seats_to_create)
        return Response(ShowSerializer(show, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def show_detail(request, pk):
    try:
        show = Show.objects.get(pk=pk)
    except Show.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ShowSerializer(show, context={'request': request}).data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = ShowSerializer(show, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    show.is_active = False
    show.save()
    return Response({'message': 'Show deleted'})


# ────────────────────────────────────────────
#  SEATS
# ────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def seats_list(request):
    show_id = request.query_params.get('show_id')
    if not show_id:
        return Response({'error': 'show_id required'}, status=status.HTTP_400_BAD_REQUEST)

    # release expired locks first
    from django.utils import timezone
    expiry = timezone.now() - timezone.timedelta(minutes=8)
    Seat.objects.filter(status='locked', locked_at__lt=expiry).update(
        status='available', locked_by=None, locked_at=None
    )

    seats = Seat.objects.filter(show_id=show_id)
    return Response(SeatSerializer(seats, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lock_seats(request):
    seat_ids = request.data.get('seat_ids', [])
    if not seat_ids:
        return Response({'error': 'seat_ids required'}, status=status.HTTP_400_BAD_REQUEST)

    # release expired locks
    expiry = timezone.now() - timezone.timedelta(minutes=8)
    Seat.objects.filter(status='locked', locked_at__lt=expiry).update(
        status='available', locked_by=None, locked_at=None
    )

    with transaction.atomic():
        seats = Seat.objects.select_for_update().filter(id__in=seat_ids)
        unavailable = [s for s in seats if s.status != 'available']
        if unavailable:
            return Response({
                'error': 'Some seats are not available',
                'seats': [f"{s.row}{s.number}" for s in unavailable]
            }, status=status.HTTP_409_CONFLICT)

        seats.update(status='locked', locked_by=request.user, locked_at=timezone.now())

    return Response({'message': 'Seats locked', 'locked_until': timezone.now() + timezone.timedelta(minutes=8)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlock_seats(request):
    seat_ids = request.data.get('seat_ids', [])
    Seat.objects.filter(id__in=seat_ids, locked_by=request.user).update(
        status='available', locked_by=None, locked_at=None
    )
    return Response({'message': 'Seats unlocked'})


# ────────────────────────────────────────────
#  BOOKINGS
# ────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_seats(request):
    seat_ids = request.data.get('seat_ids', [])
    show_id = request.data.get('show_id')

    if not seat_ids or not show_id:
        return Response({'error': 'seat_ids and show_id required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        show = Show.objects.get(pk=show_id)
    except Show.DoesNotExist:
        return Response({'error': 'Show not found'}, status=status.HTTP_404_NOT_FOUND)

    with transaction.atomic():
        seats = Seat.objects.select_for_update().filter(id__in=seat_ids, show=show)

        if seats.count() != len(seat_ids):
            return Response({'error': 'Invalid seats'}, status=status.HTTP_400_BAD_REQUEST)

        for seat in seats:
            if seat.status == 'booked':
                return Response({'error': f'Seat {seat.row}{seat.number} already booked'}, status=status.HTTP_409_CONFLICT)
            if seat.status == 'locked' and seat.locked_by != request.user:
                return Response({'error': f'Seat {seat.row}{seat.number} is locked by another user'}, status=status.HTTP_409_CONFLICT)

        total = show.price * len(seat_ids)
        booking = Booking.objects.create(
            user=request.user,
            show=show,
            total_amount=total,
            booking_reference=generate_booking_ref(),
        )

        booking_seats = [BookingSeat(booking=booking, seat=seat) for seat in seats]
        BookingSeat.objects.bulk_create(booking_seats)
        seats.update(status='booked', locked_by=None, locked_at=None)

    return Response(BookingSerializer(booking, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bookings(request):
    bookings = Booking.objects.filter(user=request.user).select_related('show', 'show__movie', 'show__screen__theater')
    return Response(BookingSerializer(bookings, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_detail(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(BookingSerializer(booking, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if booking.status == 'cancelled':
        return Response({'error': 'Already cancelled'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        seat_ids = booking.booking_seats.values_list('seat_id', flat=True)
        Seat.objects.filter(id__in=seat_ids).update(status='available')
        booking.status = 'cancelled'
        booking.save()

    return Response({'message': 'Booking cancelled'})


# ────────────────────────────────────────────
#  ADMIN STATS
# ────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    stats = {
        'total_movies': Movie.objects.filter(is_active=True).count(),
        'total_theaters': Theater.objects.filter(is_active=True).count(),
        'total_shows': Show.objects.filter(is_active=True).count(),
        'total_bookings': Booking.objects.filter(status='confirmed').count(),
        'total_users': User.objects.filter(is_admin=False).count(),
        'total_revenue': str(Booking.objects.filter(status='confirmed').aggregate(
            total=models.Sum('total_amount'))['total'] or 0),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_bookings(request):
    if not request.user.is_admin:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    bookings = Booking.objects.all().select_related('user', 'show', 'show__movie', 'show__screen__theater')
    return Response(BookingSerializer(bookings, many=True, context={'request': request}).data)


# Import models for aggregate
from django.db import models
