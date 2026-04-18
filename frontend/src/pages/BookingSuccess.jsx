import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingSuccess = () => {
  const { id } = useParams();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-800 p-12 rounded-3xl border border-white/5 shadow-2xl text-center max-w-lg w-full"
      >
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        
        <h1 className="text-4xl font-black mb-4">Booking Confirmed!</h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          Your tickets have been successfully booked. You can find your digital ticket in the My Bookings section.
        </p>

        <div className="bg-dark-700/50 rounded-2xl p-6 mb-10 border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Ticket size={24} className="text-primary" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Booking ID</p>
              <p className="font-mono font-bold text-white">#HB-{id?.padStart(6, '0')}</p>
            </div>
          </div>
          <CheckCircle size={20} className="text-green-500" />
        </div>

        <div className="flex flex-col space-y-4">
          <Link to="/my-bookings" className="btn-primary flex items-center justify-center space-x-2 py-4">
            <span>View My Tickets</span>
            <ArrowRight size={20} />
          </Link>
          <Link to="/" className="text-gray-400 hover:text-white font-bold text-sm transition-colors">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;
