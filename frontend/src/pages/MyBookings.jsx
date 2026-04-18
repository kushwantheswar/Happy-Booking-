import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my/');
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.post(`/bookings/${id}/cancel/`);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh] text-primary">Fetching your tickets...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black mb-12 flex items-center space-x-4">
        <Ticket size={40} className="text-primary" />
        <span>My Bookings</span>
      </h1>

      {bookings.length === 0 ? (
        <div className="bg-dark-800 rounded-3xl p-20 text-center border border-dashed border-white/10">
          <Ticket size={64} className="text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">No bookings found</h2>
          <p className="text-gray-400">You haven't booked any movies yet. Go grab some popcorn!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {bookings.map((booking, index) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-dark-800 rounded-3xl overflow-hidden border border-white/5 flex flex-col md:flex-row transition-all hover:border-primary/20 shadow-xl ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}
            >
              <div className="w-full md:w-64 aspect-[2/3] md:aspect-auto overflow-hidden">
                <img 
                  src={booking.movie_poster || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070"} 
                  alt={booking.movie_title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Ref: {booking.booking_reference}</span>
                      <h2 className="text-3xl font-black">{booking.movie_title}</h2>
                    </div>
                    <div className={`px-4 py-2 rounded-full flex items-center space-x-2 border ${
                      booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {booking.status === 'confirmed' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span className="text-xs font-bold uppercase tracking-tighter">{booking.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</p>
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="font-bold text-sm">{new Date(booking.show_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</p>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-primary" />
                        <span className="font-bold text-sm">{new Date(booking.show_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Theater</p>
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-primary" />
                        <span className="font-bold text-sm truncate">{booking.theater_name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Seats</p>
                      <div className="flex items-center space-x-2">
                        <Ticket size={14} className="text-primary" />
                        <span className="font-bold text-sm">{booking.seats.map(s => `${s.row}${s.number}`).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-2xl font-black text-white">₹{booking.total_amount}</p>
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="text-gray-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-red-500 transition-all pb-1"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
