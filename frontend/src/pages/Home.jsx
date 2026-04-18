import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Play, Star, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies/');
        setMovies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden mb-16 group">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070" 
          alt="Featured" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-2xl">
          <div className="flex items-center space-x-2 text-primary mb-4">
            <Star size={20} fill="currentColor" />
            <span className="font-bold uppercase tracking-widest text-sm">Now Showing</span>
          </div>
          <h1 className="text-6xl font-black mb-6 leading-tight">EXPERIENCE MOVIES <br/>LIKE NEVER BEFORE</h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Book tickets for the latest blockbusters in premium theaters near you. 
            Enjoy seamless booking and the best cinematic experience.
          </p>
          <div className="flex items-center space-x-4">
            <button className="btn-primary flex items-center space-x-2 py-3 px-8">
              <Play size={20} fill="currentColor" />
              <span>Watch Trailer</span>
            </button>
            <button className="btn-outline py-3 px-8">Browse All</button>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <h2 className="text-3xl font-bold mb-10 flex items-center space-x-3">
        <div className="w-2 h-8 bg-primary rounded-full"></div>
        <span>Recommended Movies</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group"
          >
            <Link to={`/movie/${movie.id}`}>
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={movie.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070"} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-primary p-3 rounded-full mb-4">
                    <Ticket size={24} />
                  </div>
                  <span className="font-bold text-lg">Book Now</span>
                </div>
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center space-x-1">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  <span className="text-xs font-bold">{movie.rating}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold truncate pr-2">{movie.title}</h3>
                </div>
                <div className="flex items-center text-gray-400 text-sm space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{movie.duration}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{movie.language}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-1 bg-dark-700 rounded border border-white/5">{movie.genre}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
