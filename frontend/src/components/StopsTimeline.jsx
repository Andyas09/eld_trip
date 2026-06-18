import React from 'react';
import { MapPin, Coffee, Fuel, Moon, ShieldAlert } from 'lucide-react';

export default function StopsTimeline({ stops }) {
  if (!stops || stops.length === 0) return null;

  const getStopIcon = (type) => {
    switch (type) {
      case 'pickup':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'delivery':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-amber-600" />;
      case 'rest':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      default:
        return <Coffee className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStopColorClass = (type) => {
    switch (type) {
      case 'pickup':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'delivery':
        return 'bg-emerald-100 border-emerald-200 text-emerald-800';
      case 'fuel':
        return 'bg-amber-100 border-amber-200 text-amber-800';
      case 'rest':
        return 'bg-indigo-100 border-indigo-200 text-indigo-800';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Stops Timeline</h2>
      
      <div className="relative border-l border-slate-100 pl-6 space-y-6">
        {stops.map((stop, index) => (
          <div key={index} className="relative">
            
            <div className={`absolute -left-[35px] top-1 p-2 rounded-xl border ${getStopColorClass(stop.type)}`}>
              {getStopIcon(stop.type)}
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{stop.label}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {stop.time}
                </span>
                <span className="text-xs text-slate-400">({stop.duration_minutes} Mins)</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{stop.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}