import React, { useState } from 'react';
import { Navigation, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

export default function TripForm({ onSubmit, onLoadSample, isLoading }) {
  const [currentLocation, setCurrentLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [currentCycleUsed, setCurrentCycleUsed] = useState(0);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!currentLocation.trim()) newErrors.currentLocation = 'Current location is required';
    if (!pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!dropoffLocation.trim()) newErrors.dropoffLocation = 'Dropoff location is required';
    
    const cycle = Number(currentCycleUsed);
    if (isNaN(cycle) || cycle < 0 || cycle > 70) {
      newErrors.currentCycleUsed = 'Cycle must be a number between 0 and 70 hours';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      current_location: currentLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      current_cycle_used: Number(currentCycleUsed),
    });
  };

  const handleSampleClick = () => {
    setCurrentLocation('Chicago, IL');
    setPickupLocation('St. Louis, MO');
    setDropoffLocation('Dallas, TX');
    setCurrentCycleUsed(20);
    setErrors({});
    onLoadSample();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" /> Trip Details
        </h2>
        <button
          type="button"
          onClick={handleSampleClick}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
        >
          Load Sample Trip
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Current Location (Origin)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. Chicago, IL"
              className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.currentLocation ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.currentLocation && <p className="text-xs text-rose-500 mt-1">{errors.currentLocation}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Pickup Location (Pickup)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. St. Louis, MO"
              className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.pickupLocation ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.pickupLocation && <p className="text-xs text-rose-500 mt-1">{errors.pickupLocation}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Dropoff Location (Dropoff)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="e.g. Dallas, TX"
              className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.dropoffLocation ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.dropoffLocation && <p className="text-xs text-rose-500 mt-1">{errors.dropoffLocation}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            70-Hour Cycle Used (HOS)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="70"
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(e.target.value)}
              placeholder="Cycle used in hours"
              className={`w-full px-4 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.currentCycleUsed ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.currentCycleUsed && <p className="text-xs text-rose-500 mt-1">{errors.currentCycleUsed}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Generate Trip Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}