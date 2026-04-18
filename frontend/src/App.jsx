import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import BookingSuccess from './pages/BookingSuccess';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/book/:showId" element={<SeatSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/booking-success/:id" element={<BookingSuccess />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          
          <footer className="py-12 border-t border-white/5 mt-20 text-center text-gray-500 text-sm">
            <p>&copy; 2024 HAPPYBOOKING. Built with passion for cinema.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
