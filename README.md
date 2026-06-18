# ELD Trip Planner

**ELD Trip Planner** is a modern full-stack web application built using **Django** (backend) and **React** (frontend). It helps logistics dispatchers and commercial truck drivers plan routes while automatically calculating compliance with **FMCSA Hours of Service (HOS)** regulations and dynamically generating **Driver’s Daily Log Sheets (Grid Logs)**.

---

## Key Features

- **Accurate Geocoding & Routing**: Resolves addresses to coordinates via Nominatim OSM and calculates routes, distance, and duration using the OSRM API.
- **Automated HOS Calculator**:
  - **11-Hour Driving Limit** monitoring.
  - **14-Hour Duty Window** monitoring.
  - **30-Minute Break** rule after 8 hours of cumulative driving.
  - **70-Hour / 8-Day Cycle** limit recap.
- **Fuel & Off-Duty Resets**: Automatically inserts fuel stops every 1,000 miles (30-minute duration) and schedules 10-hour Off-Duty resets if daily HOS limits are exceeded.
- **Dynamic Driver’s Daily Log Sheets**: Interactive SVG/HTML-based daily log grid that visually charts duty status changes (Off Duty, Sleeper, Driving, On Duty) matching physical paper logs.
- **Interactive Route Map**: Displays the trip route polyline and custom markers for every event (Pickup, Delivery, Fuel, Break, Rest) using Leaflet.

---

## Tech Stack

### Backend
- Python 3.14+
- Django & Django REST Framework (DRF)
- django-cors-headers
- requests

### Frontend
- React (Vite) & Tailwind CSS v4
- Leaflet & React Leaflet
- Axios
- Lucide React Icons

---

## HOS Rules Implemented (FMCSA Regulations)

1. **11-Hour Driving Limit**: Drivers may drive a maximum of 11 hours after 10 consecutive hours off duty.
2. **14-Hour Duty Window**: Drivers may not drive beyond the 14th consecutive hour after coming on duty, following 10 consecutive hours off duty (includes loading, pickup, delivery, and fueling times).
3. **30-Minute Break**: Drivers must take a 30-minute off-duty break after driving for 8 cumulative hours without at least a 30-minute interruption.
4. **70-Hour / 8-Day Cycle**: Drivers may not drive after spending 70 hours on duty in any 8 consecutive days. If the remaining cycle is insufficient, the system warns the driver and inserts a **34-hour restart**.

---

## Running the Application

### 1. Running the Backend (Django)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux/macOS**:
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python manage.py runserver
   ```
   *The Backend API will be available at: `http://127.0.0.1:8000`*

### 2. Running the Frontend (React + Vite)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend web app will be available at: `http://localhost:5173`*

---

## API Endpoint Documentation

### **POST /api/trip-plan/**

#### Request Body
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 20
}
```

#### Response Body (Abbreviated Example)
```json
{
  "summary": {
    "total_miles": 925.4,
    "total_duration_hours": 37.3,
    "current_cycle_used": 20.0,
    "remaining_cycle": 31.7,
    "estimated_days": 2,
    "hos_status": "Compliant"
  },
  "locations": {
    "current": { "name": "Chicago, IL, USA", "lat": 41.8781, "lng": -87.6298 },
    "pickup": { "name": "St. Louis, MO, USA", "lat": 38.627, "lng": -90.199 },
    "dropoff": { "name": "Dallas, TX, USA", "lat": 32.776, "lng": -96.797 }
  },
  "route_geometry": [ [41.8781, -87.6298], ... ],
  "stops": [ ... ],
  "instructions": [ ... ],
  "daily_logs": [ ... ],
  "warnings": []
}
```

---

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## MVP Limitations (Known Limitations)

- **Simplified HOS Cycle**: Uses `70 - current_cycle_used` at the beginning of the trip and does not perform a deep historical rolling 8-day recap calculation.
- **Fuel Stop Locations**: Fuel stops are placed using simple route geometry interpolation every 1,000 miles.
- **No Adverse Driving Conditions**: Assumes normal driving conditions along the calculated route.
- **No Authentication**: The application does not require logging in for demo purposes.
