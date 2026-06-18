import React, { useState } from 'react';
import axios from 'axios';
import { Truck, Shield, Route, MapPin } from 'lucide-react';

import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import TripSummary from './components/TripSummary';
import StopsTimeline from './components/StopsTimeline';
import RouteInstructions from './components/RouteInstructions';
import HOSSummary from './components/HOSSummary';
import DailyLogSheet from './components/DailyLogSheet';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import heroImage from './assets/hero.png';
import img1 from './assets/1.png';
import img2 from './assets/2.png';
import img3 from './assets/3.png';
import img4 from './assets/4.png';
import img5 from './assets/5.png';

const showcaseTabs = [
  { label: 'Planning Form', img: img1, desc: 'Input your origin, pickup, and dropoff locations alongside current HOS cycle usage.' },
  { label: 'Interactive Map', img: img2, desc: 'Visualize your route polyline and custom stops (Pickup, Fuel, Rest, Delivery) dynamically.' },
  { label: 'HOS Compliance', img: img3, desc: 'Check automated HOS violations, warnings, and safety recommendations.' },
  { label: 'Stops & Instructions', img: img4, desc: 'View a timeline of stops and detailed step-by-step navigation instructions.' },
  { label: 'Daily Log Sheet', img: img5, desc: 'View standard 24-hour Driver Daily Logs with a visual activity grid.' },
];

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
  const [selectedTab, setSelectedTab] = useState(0);

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
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/10">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">ELD Trip Planner</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">HOS Compliance Platform</p>
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plan compliant routes and generate Driver’s Daily Logs.
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
            Commercial truck routing helper with automatic hours of service (HOS) calculation and standardized log generation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <TripForm
              onSubmit={handleFormSubmit}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <ErrorState
                message={error}
                onClose={() => setError(null)}
              />
            )}
            
            {isLoading ? (
              <LoadingState />
            ) : tripData ? (
              <div className="lg:sticky lg:top-20">
                <TripSummary summary={tripData.summary} />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Features Preview</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click through the tabs below to explore key features of the application.</p>
                  </div>
                  <button
                    onClick={handleLoadSample}
                    className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition self-start sm:self-center cursor-pointer"
                  >
                    Quick Load Sample
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {showcaseTabs.map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTab(idx)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        selectedTab === idx
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl leading-relaxed">
                    💡 <span className="font-bold text-slate-700">{showcaseTabs[selectedTab].label}:</span> {showcaseTabs[selectedTab].desc}
                  </p>
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50">
                    <img
                      src={showcaseTabs[selectedTab].img}
                      alt={showcaseTabs[selectedTab].label}
                      className="w-full h-auto object-cover max-h-[380px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {tripData && !isLoading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
            
            <RouteMap
              locations={tripData.locations}
              routeGeometry={tripData.route_geometry}
              stops={tripData.stops}
            />

            <HOSSummary
              warnings={tripData.warnings}
              summary={tripData.summary}
            />

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

          </div>
        )}

      </main>
    </div>
  );
}