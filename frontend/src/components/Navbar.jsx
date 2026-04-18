import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center space-x-2">
        <div className="bg-primary p-2 rounded-lg">
          <Film size={24} className="text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tighter text-white">HAPPY<span className="text-primary">BOOKING</span></span>
      </Link>

      <div className="flex items-center space-x-6">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Movies</Link>
        
        {user ? (
          <div className="flex items-center space-x-6">
            <Link to="/my-bookings" className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
              <Ticket size={18} />
              <span>My Tickets</span>
            </Link>
            
            {user.is_admin && (
              <Link to="/admin" className="flex items-center space-x-1 text-primary hover:text-primary-hover transition-colors font-medium">
                <LayoutDashboard size={18} />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="flex items-center space-x-3 bg-dark-700 px-4 py-2 rounded-full border border-white/5">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <span className="text-sm font-medium">{user.username}</span>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors pl-2 border-l border-white/10"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
