import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, Calendar, Star, Languages, Info, MapPin } from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${id}/`),
          api.get(`/shows/?movie_id=${id}`)
        ]);
        setMovie(movieRes.data);
        setShows(showsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-[80vh] animate-pulse text-primary font-bold">LOADING CINEMA...</div>;
  if (!movie) return <div className="text-center mt-20 text-2xl font-bold">Movie not found</div>;

  // Group shows by theater
  const showsByTheater = shows.reduce((acc, show) => {
    const tId = show.screen_name + show.theater_name; // unique key
    if (!acc[tId]) {
      acc[tId] = {
        theater_name: show.theater_name,
        theater_city: show.theater_city,
        screen_name: show.screen_name,
        times: []
      };
    }
    acc[tId].times.push(show);
    return acc;
  }, {});

  return (
    <div className="pb-20">
      {/* Backdrop Header */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent z-10"></div>
        <img 
          src={movie.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070"} 
          alt={movie.title} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 max-w-7xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end space-y-6 md:space-y-0 md:space-x-12">
          <div className="w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 hidden md:block transform -rotate-2">
            <img 
              src={movie.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070"} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-primary px-3 py-1 rounded text-xs font-bold uppercase">{movie.genre}</span>
              <div className="flex items-center space-x-1 text-yellow-500">
                <Star size={18} fill="currentColor" />
                <span className="font-bold">{movie.rating}</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">{movie.title}</h1>
            <div className="flex flex-wrap gap-6 text-gray-300 font-medium">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-primary" />
                <span>{movie.duration} Minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Languages size={20} className="text-primary" />
                <span>{movie.language}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={20} className="text-primary" />
                <span>{movie.release_date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* About the movie */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <Info className="text-primary" />
            <span>Synopsis</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12">
            {movie.description}
          </p>

          <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
            <Calendar className="text-primary" />
            <span>Available Showtime</span>
          </h2>

          <div className="space-y-8">
            {Object.values(showsByTheater).length > 0 ? Object.values(showsByTheater).map((theater, idx) => (
              <div key={idx} className="bg-dark-800 rounded-2xl p-8 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{theater.theater_name}</h3>
                    <div className="flex items-center text-gray-400 space-x-2">
                      <MapPin size={16} className="text-primary" />
                      <span>{theater.theater_city} • {theater.screen_name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {theater.times.map((show) => (
                    <Link 
                      key={show.id}
                      to={`/book/${show.id}`}
                      className="group relative"
                    >
                      <div className="bg-dark-700 hover:bg-primary transition-all duration-300 px-8 py-4 rounded-xl border border-white/5 flex flex-col items-center min-w-[120px]">
                        <span className="text-xl font-bold group-hover:text-white transition-colors">
                          {new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400 group-hover:text-white/80 transition-colors uppercase font-bold tracking-widest mt-1">
                          ₹{show.price}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        {show.available_seats} LEFT
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )) : (
              <div className="bg-dark-800 p-12 rounded-2xl text-center border border-dashed border-white/10">
                <p className="text-gray-400 text-lg">No shows available for this movie yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div>
          <div className="bg-dark-800 rounded-3xl p-8 border border-white/5 sticky top-32">
            <h3 className="text-xl font-bold mb-6">Booking Information</h3>
            <ul className="space-y-6">
              <li className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                <span className="text-gray-400">Standard Price</span>
                <span className="font-bold text-primary">₹250.00</span>
              </li>
              <li className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                <span className="text-gray-400">Convenience Fee</span>
                <span className="font-bold text-primary">₹30.00</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Ticket Limit</span>
                <span className="font-bold">10 per user</span>
              </li>
            </ul>
            <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-primary font-medium leading-relaxed">
                * Cancellation is allowed up to 4 hours before the show start time. Refund will be processed in 3-5 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
