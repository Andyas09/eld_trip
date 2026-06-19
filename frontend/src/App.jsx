import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Truck, Shield, Route } from 'lucide-react';

import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import TripSummary from './components/TripSummary';
import StopsTimeline from './components/StopsTimeline';
import RouteInstructions from './components/RouteInstructions';
import HOSSummary from './components/HOSSummary';
import DailyLogSheet from './components/DailyLogSheet';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import backgroundImage from './assets/background.png';
import logoImage from './assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`;

const OFFLINE_SAMPLE_DATA = {
  "summary": {
    "total_miles": 925.4,
    "total_duration_hours": 37.3,
    "current_cycle_used": 20.0,
    "remaining_cycle": 31.7,
    "estimated_days": 2,
    "hos_status": "Compliant"
  },
  "locations": {
    "current": {
      "name": "Chicago, IL, USA",
      "lat": 41.8781,
      "lng": -87.6298
    },
    "pickup": {
      "name": "St. Louis, MO, USA",
      "lat": 38.6270,
      "lng": -90.1994
    },
    "dropoff": {
      "name": "Dallas, TX, USA",
      "lat": 32.7767,
      "lng": -96.7970
    }
  },
  "route_geometry": [
    [41.8781, -87.6298],
    [40.0, -89.0],
    [38.6270, -90.1994],
    [36.0, -93.0],
    [34.0, -95.0],
    [32.7767, -96.7970]
  ],
  "stops": [
    {
      "type": "pickup",
      "label": "Pickup",
      "location": "St. Louis, MO, USA",
      "time": "Day 1 13:40",
      "duration_minutes": 60,
      "status": "on_duty_not_driving"
    },
    {
      "type": "fuel",
      "label": "Fuel Stop",
      "location": "St. Louis, MO, USA",
      "time": "Day 2 08:30",
      "duration_minutes": 30,
      "status": "on_duty_not_driving"
    },
    {
      "type": "delivery",
      "label": "Delivery",
      "location": "Dallas, TX, USA",
      "time": "Day 2 13:00",
      "duration_minutes": 60,
      "status": "on_duty_not_driving"
    }
  ],
  "instructions": [
    "Start trip from Chicago, IL, USA.",
    "Driving to pickup location at St. Louis, MO, USA (297.0 miles).",
    "Performing pickup for 1 hour.",
    "Driving to dropoff location at Dallas, TX, USA (628.4 miles).",
    "Performing fueling for 30 minutes after 1000 miles.",
    "Performing delivery for 1 hour."
  ],
  "daily_logs": [
    {
      "day": 1,
      "date": "2026-06-16",
      "from": "Chicago, IL, USA",
      "to": "St. Louis, MO, USA",
      "total_miles": 297.0,
      "totals": {
        "off_duty": 17.6,
        "sleeper_berth": 0.0,
        "driving": 5.4,
        "on_duty_not_driving": 1.0
      },
      "activities": [
        { "start": "00:00", "end": "08:00", "status": "off_duty", "label": "Off Duty", "location": "Chicago, IL, USA", "description": "Pre-trip rest period", "start_min": 0, "end_min": 480 },
        { "start": "08:00", "end": "13:24", "status": "driving", "label": "Driving to Pickup", "location": "Chicago, IL, USA", "description": "Driving segment (297.0 miles)", "start_min": 480, "end_min": 804 },
        { "start": "13:24", "end": "13:40", "status": "off_duty", "label": "30-Minute Break", "location": "Chicago, IL, USA", "description": "Mandatory 8-hour driving limit break", "start_min": 804, "end_min": 820 },
        { "start": "13:40", "end": "14:40", "status": "on_duty_not_driving", "label": "Pickup", "location": "St. Louis, MO, USA", "description": "Loading cargo (1 hour)", "start_min": 820, "end_min": 880 },
        { "start": "14:40", "end": "24:00", "status": "off_duty", "label": "Off Duty", "location": "St. Louis, MO, USA", "description": "End of day rest", "start_min": 880, "end_min": 1440 }
      ],
      "remarks": [
        "08:00 Started trip from Chicago, IL, USA",
        "13:40 Pickup at St. Louis, MO, USA"
      ]
    },
    {
      "day": 2,
      "date": "2026-06-17",
      "from": "St. Louis, MO, USA",
      "to": "Dallas, TX, USA",
      "total_miles": 628.4,
      "totals": {
        "off_duty": 11.1,
        "sleeper_berth": 0.0,
        "driving": 11.4,
        "on_duty_not_driving": 1.5
      },
      "activities": [
        { "start": "00:00", "end": "08:00", "status": "off_duty", "label": "Off Duty", "location": "St. Louis, MO, USA", "description": "Pre-trip rest period", "start_min": 0, "end_min": 480 },
        { "start": "08:00", "end": "14:00", "status": "driving", "label": "Driving to Dropoff", "location": "St. Louis, MO, USA", "description": "Driving segment (330.0 miles)", "start_min": 480, "end_min": 840 },
        { "start": "14:00", "end": "14:30", "status": "on_duty_not_driving", "label": "Fuel Stop", "location": "St. Louis, MO, USA", "description": "Fueling vehicle (30 min)", "start_min": 840, "end_min": 870 },
        { "start": "14:30", "end": "19:54", "status": "driving", "label": "Driving to Dropoff", "location": "St. Louis, MO, USA", "description": "Driving segment (298.4 miles)", "start_min": 870, "end_min": 1194 },
        { "start": "19:54", "end": "20:54", "status": "on_duty_not_driving", "label": "Delivery", "location": "Dallas, TX, USA", "description": "Unloading cargo (1 hour)", "start_min": 1194, "end_min": 1254 },
        { "start": "20:54", "end": "24:00", "status": "off_duty", "label": "Off Duty", "location": "Dallas, TX, USA", "description": "End of trip rest", "start_min": 1254, "end_min": 1440 }
      ],
      "remarks": [
        "14:00 Fuel Stop at St. Louis, MO, USA",
        "19:54 Delivery at Dallas, TX, USA"
      ]
    }
  ],
  "warnings": []
};

export default function App() {
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const resultsRef = useRef(null);

  useEffect(() => {
    if (tripData && !isLoading) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tripData, isLoading]);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setUsingMock(false);

    try {
      const response = await axios.post(`${API_URL}/trip-plan/`, formData);
      setTripData(response.data);
    } catch (err) {
      console.error('API Error, falling back to local simulation:', err);

      setError('Failed to connect to the backend API. Using local simulation (offline fallback) to display results.');
      setTripData(OFFLINE_SAMPLE_DATA);
      setUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setTripData(OFFLINE_SAMPLE_DATA);
    setError(null);
    setUsingMock(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="ELD Trip Planner Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              <Shield className="w-3.5 h-3.5" /> FMCSA HOS Rules
            </span>
            {usingMock && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                Offline Mode
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <div 
        className="relative bg-slate-900 py-16 sm:py-24 bg-cover bg-center overflow-hidden border-b border-slate-200"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Semi-transparent dark overlay with subtle backdrop blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-[2px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-white text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25">
                <Shield className="w-3.5 h-3.5" /> FMCSA HOS & Route Compliance
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Plan Compliant Truck Routes & Generate Daily Logs
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Analyze hours of service compliance, optimize fuel and rest stops, and generate standardized daily log sheets automatically. Enter your route details to get started.
              </p>
            </div>
            <div className="lg:col-span-5 w-full">
              <TripForm
                onSubmit={handleFormSubmit}
                onLoadSample={handleLoadSample}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <ErrorState
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <LoadingState />
        </div>
      )}

      {/* Results Section */}
      {tripData && !isLoading && (
        <main ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Route className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Trip Analysis & Compliance Report</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-8">
              <TripSummary summary={tripData.summary} />
              <HOSSummary
                warnings={tripData.warnings}
                summary={tripData.summary}
              />
            </div>

            <div className="lg:col-span-7">
              <RouteMap
                locations={tripData.locations}
                routeGeometry={tripData.route_geometry}
                stops={tripData.stops}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StopsTimeline stops={tripData.stops} />
            <RouteInstructions instructions={tripData.instructions} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Driver's Daily Log Sheets</h2>
            </div>
            <div className="space-y-8">
              {tripData.daily_logs.map((log) => (
                <DailyLogSheet key={log.day} log={log} />
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}