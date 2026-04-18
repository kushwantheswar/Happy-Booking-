from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Movie, Theater, Screen, Show, Seat, Booking, BookingSeat

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'password')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'is_admin', 'date_joined')


class MovieSerializer(serializers.ModelSerializer):
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = '__all__'

    def get_poster_url(self, obj):
        request = self.context.get('request')
        if obj.poster and request:
            return request.build_absolute_uri(obj.poster.url)
        return None


class TheaterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theater
        fields = '__all__'


class ScreenSerializer(serializers.ModelSerializer):
    theater_name = serializers.CharField(source='theater.name', read_only=True)

    class Meta:
        model = Screen
        fields = '__all__'


class ShowSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    movie_poster = serializers.SerializerMethodField()
    theater_name = serializers.CharField(source='screen.theater.name', read_only=True)
    theater_city = serializers.CharField(source='screen.theater.city', read_only=True)
    screen_name = serializers.CharField(source='screen.name', read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Show
        fields = '__all__'

    def get_movie_poster(self, obj):
        request = self.context.get('request')
        if obj.movie.poster and request:
            return request.build_absolute_uri(obj.movie.poster.url)
        return None

    def get_available_seats(self, obj):
        return obj.seats.filter(status='available').count()


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ('id', 'row', 'number', 'status')


class BookingSeatSerializer(serializers.ModelSerializer):
    row = serializers.CharField(source='seat.row', read_only=True)
    number = serializers.IntegerField(source='seat.number', read_only=True)

    class Meta:
        model = BookingSeat
        fields = ('id', 'row', 'number')


class BookingSerializer(serializers.ModelSerializer):
    seats = BookingSeatSerializer(source='booking_seats', many=True, read_only=True)
    movie_title = serializers.CharField(source='show.movie.title', read_only=True)
    movie_poster = serializers.SerializerMethodField()
    show_time = serializers.DateTimeField(source='show.start_time', read_only=True)
    theater_name = serializers.CharField(source='show.screen.theater.name', read_only=True)
    theater_city = serializers.CharField(source='show.screen.theater.city', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

    def get_movie_poster(self, obj):
        request = self.context.get('request')
        if obj.show.movie.poster and request:
            return request.build_absolute_uri(obj.show.movie.poster.url)
        return None
