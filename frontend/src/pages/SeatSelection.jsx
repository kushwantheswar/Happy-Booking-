import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Armchair, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SeatSelection = () => {
  const { showId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
    
    const fetchData = async () => {
      try {
        const [showRes, seatsRes] = await Promise.all([
          api.get(`/shows/${showId}/`),
          api.get(`/seats/?show_id=${showId}`)
        ]);
        setShow(showRes.data);
        setSeats(seatsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Poll for seat updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [showId, user, navigate]);

  const toggleSeat = (seat) => {
    if (seat.status !== 'available') return;
    
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 10) return;
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);
    setError(null);
    
    try {
      // First try to lock
      await api.post('/seats/lock/', { seat_ids: selectedSeats.map(s => s.id) });
      
      // Then book
      const res = await api.post('/bookings/', {
        show_id: showId,
        seat_ids: selectedSeats.map(s => s.id)
      });
      
      navigate(`/booking-success/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed. Some seats might have been taken.");
      // Refresh seats
      const seatsRes = await api.get(`/seats/?show_id=${showId}`);
      setSeats(seatsRes.data);
      setSelectedSeats([]);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh] text-primary">Initializing Hall...</div>;

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const totalPrice = selectedSeats.length * (show?.price || 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left: Seat Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-black mb-2">{show?.movie_title}</h1>
              <p className="text-gray-400">{show?.theater_name} • {show?.screen_name} • {new Date(show?.start_time).toLocaleString()}</p>
            </div>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-dark-700 rounded shadow-inner border border-white/5"></div>
                <span className="text-xs text-gray-400 uppercase font-bold">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-primary rounded shadow-lg shadow-primary/20"></div>
                <span className="text-xs text-gray-400 uppercase font-bold">Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-dark-600 rounded flex items-center justify-center opacity-50">
                  <Armchair size={10} className="text-gray-500" />
                </div>
                <span className="text-xs text-gray-400 uppercase font-bold">Booked</span>
              </div>
            </div>
          </div>

          {/* Screen area */}
          <div className="relative mb-24 px-12">
            <div className="w-full h-2 bg-primary/40 rounded-full blur-sm mb-4"></div>
            <div className="w-full h-1 bg-gradient-to-b from-primary/20 to-transparent rounded-full transform perspective-1000 rotateX-45 h-32 absolute -top-4 left-0"></div>
            <p className="text-center text-[10px] uppercase font-bold tracking-[1em] text-gray-500 relative z-10">All eyes this way</p>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col items-center space-y-4">
            {Object.keys(rows).sort().map(rowName => (
              <div key={rowName} className="flex items-center space-x-4">
                <span className="w-6 text-sm font-bold text-gray-600">{rowName}</span>
                <div className="flex space-x-3">
                  {rows[rowName].map(seat => {
                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                    const isBooked = seat.status === 'booked';
                    const isLocked = seat.status === 'locked';
                    
                    return (
                      <motion.button
                        key={seat.id}
                        whileHover={!isBooked && !isLocked ? { scale: 1.2 } : {}}
                        whileTap={!isBooked && !isLocked ? { scale: 0.9 } : {}}
                        onClick={() => toggleSeat(seat)}
                        disabled={isBooked || isLocked}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                          ${isBooked ? 'bg-dark-600 cursor-not-allowed opacity-40' : 
                            isLocked ? 'bg-yellow-600 cursor-not-allowed opacity-60' :
                            isSelected ? 'bg-primary shadow-lg shadow-primary/40 text-white' : 
                            'bg-dark-700 hover:bg-dark-600 border border-white/5 text-gray-500'}
                        `}
                      >
                        <Armchair size={14} className={isSelected ? 'text-white' : ''} />
                      </motion.button>
                    );
                  })}
                </div>
                <span className="w-6 text-sm font-bold text-gray-600">{rowName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-dark-800 rounded-3xl p-8 border border-white/5 sticky top-32">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-start space-x-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Movie</p>
                  <p className="font-bold">{show?.movie_title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Time</p>
                  <p className="font-bold">{new Date(show?.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Selected Seats ({selectedSeats.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.length > 0 ? selectedSeats.map(s => (
                    <span key={s.id} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-md text-sm font-bold">
                      {s.row}{s.number}
                    </span>
                  )) : <span className="text-gray-500 italic text-sm">No seats selected</span>}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-primary font-black text-2xl">
                <span>Total</span>
                <span>₹{(totalPrice + (selectedSeats.length > 0 ? 30 : 0)).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || bookingLoading}
              className={`
                w-full py-4 rounded-xl flex items-center justify-center space-x-3 font-bold transition-all
                ${selectedSeats.length > 0 ? 'btn-primary' : 'bg-dark-700 text-gray-500 cursor-not-allowed'}
              `}
            >
              {bookingLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                <>
                  <span>Confirm Booking</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500">
              <Info size={14} />
              <span className="text-[10px] uppercase tracking-wider font-bold">Taxes & fees included at checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
