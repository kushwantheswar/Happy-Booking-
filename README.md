# 🎬 HappyBooking - Premium Movie Booking Platform

HappyBooking is a high-end, full-stack movie ticket booking application designed with a focus on premium aesthetics and seamless user experience. Built with a robust Django backend and a dynamic React frontend, it offers a real-world cinematic booking flow.

---

## ✨ Key Features

### 🍿 For Users
*   **Modern UI/UX:** Stunning dark-themed interface with glassmorphism and smooth animations.
*   **Live Seat Selection:** Interactive 3D seat map with real-time availability updates.
*   **Seat Locking:** Automatic 8-minute seat lock mechanism to prevent double bookings.
*   **Booking Management:** View your ticket history and booking references in "My Tickets".
*   **Responsive Design:** Fully optimized for desktops and mobile devices.

### 🛡️ For Administrators
*   **Admin Dashboard:** Real-time statistics on total revenue, movies, and user bookings.
*   **Show Management:** Add and manage movie showtimes across different theaters and screens.
*   **Theater Control:** Manage theater details, cities, and screen configurations.
*   **Automated Seat Generation:** Intelligent row-wise seat generation based on screen capacity.

---

## 🛠️ Technology Stack

**Frontend:**
*   React 19 + Vite
*   Tailwind CSS v4 (Ultra-fast styling)
*   Lucide React (Iconography)
*   Framer Motion (Smooth transitions)
*   Axios (API communication)

**Backend:**
*   Django + Django REST Framework
*   SimpleJWT (Secure Token Authentication)
*   SQLite3 (Database)
*   CORS Headers (Cross-origin support)

---

## 🚀 Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   Git

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kushwantheswar/Happy-Booking-.git
   cd Happy-Booking-
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
   python manage.py migrate
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

The easiest way to run the project is using the provided startup script:

1.  Run `start_system.bat` from the root directory.
2.  The Frontend will be available at [http://127.0.0.1:5173](http://127.0.0.1:5173).
3.  The Backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@happybooking.com` | `admin123` |
| **Test User** | `test@test.com` | `password123` |

---

## 📂 Project Structure

```text
Happy-Booking-/
├── backend/            # Django REST API
│   ├── api/            # App logic (models, views, serializers)
│   ├── config/         # Project settings
│   └── seed.py         # Sample data generator
├── frontend/           # React Application
│   ├── src/            # Components, Pages, Context, Services
│   └── index.css       # Global styles (Tailwind 4)
└── start_system.bat    # One-click startup script
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by [Kushwanth Eswar](https://github.com/kushwantheswar)**
