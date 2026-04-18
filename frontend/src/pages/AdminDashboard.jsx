import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Film, MapPin, Calendar, 
  TrendingUp, Plus, Trash2, Edit 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) navigate('/');
    
    const fetchAdminData = async () => {
      try {
        const [statsRes, moviesRes] = await Promise.all([
          api.get('/admin/stats/'),
          api.get('/movies/')
        ]);
        setStats(statsRes.data);
        setMovies(moviesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user, navigate]);

  if (loading) return <div className="p-12 text-primary font-bold">Accessing Admin Control...</div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.total_revenue}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Movies Active', value: stats?.total_movies, icon: Film, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Theaters', value: stats?.total_theaters, icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Registered Users', value: stats?.total_users, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your cinema empire from here</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-dark-800 p-8 rounded-3xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Movies Table */}
      <div className="bg-dark-800 rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Active Movies</h2>
          <span className="text-gray-500 text-sm font-bold">{movies.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-900/50 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                <th className="px-8 py-4">Movie</th>
                <th className="px-8 py-4">Release Date</th>
                <th className="px-8 py-4">Duration</th>
                <th className="px-8 py-4">Rating</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movies.map(movie => (
                <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                        <img src={movie.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{movie.title}</p>
                        <p className="text-xs text-gray-500">{movie.genre} • {movie.language}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-medium text-gray-300">{movie.release_date}</td>
                  <td className="px-8 py-6 font-medium text-gray-300">{movie.duration}m</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-1 text-yellow-500 font-bold">
                      <span>{movie.rating}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
