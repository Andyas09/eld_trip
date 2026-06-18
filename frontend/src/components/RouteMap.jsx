import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapBoundsController({ coordinates, points }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, points, map]);

  return null;
}

const createCustomMarker = (color, char) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md text-white font-bold text-xs" style="background-color: ${color};">
            <span>${char}</span>
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const icons = {
  current: createCustomMarker('#3b82f6', 'C'), 
  pickup: createCustomMarker('#10b981', 'P'),  
  dropoff: createCustomMarker('#ef4444', 'D'), 
  delivery: createCustomMarker('#ef4444', 'D'), 
  fuel: createCustomMarker('#f59e0b', 'F'),    
  rest: createCustomMarker('#6366f1', 'R'),    
  break: createCustomMarker('#64748b', 'B'),   
};

export default function RouteMap({ locations, routeGeometry, stops }) {
  
  const defaultCenter = [39.8283, -98.5795]; 
  const defaultZoom = 4;

  const hasRoute = routeGeometry && routeGeometry.length > 0;

  const points = [];
  if (locations?.current) points.push(locations.current);
  if (locations?.pickup) points.push(locations.pickup);
  if (locations?.dropoff) points.push(locations.dropoff);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-800">Trip Route Map</h2>
        
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">
            <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">C</span>
            Current Location
          </span>
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">P</span>
            Pickup
          </span>
          <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-lg border border-rose-100">
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">D</span>
            Dropoff
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">F</span>
            Fuel Stop
          </span>
          <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">R</span>
            Rest Stop
          </span>
          <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
            <span className="w-4 h-4 rounded-full bg-slate-500 text-white flex items-center justify-center text-[10px]">B</span>
            Break
          </span>
        </div>
      </div>
      <div className="h-[450px] w-full rounded-xl overflow-hidden border border-slate-200 relative">
        <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasRoute && (
            <Polyline
              positions={routeGeometry}
              pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }}
            />
          )}

          {(hasRoute || points.length > 0) && (
            <MapBoundsController coordinates={routeGeometry} points={points} />
          )}

          {locations?.current && (
            <Marker position={[locations.current.lat, locations.current.lng]} icon={icons.current}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-blue-600">Current Location</p>
                  <p>{locations.current.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {locations?.pickup && (
            <Marker position={[locations.pickup.lat, locations.pickup.lng]} icon={icons.pickup}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-emerald-600">Pickup Location</p>
                  <p>{locations.pickup.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {locations?.dropoff && (
            <Marker position={[locations.dropoff.lat, locations.dropoff.lng]} icon={icons.dropoff}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-rose-600">Dropoff Location</p>
                  <p>{locations.dropoff.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {stops && stops.map((stop, idx) => {
            
            let position = null;
            if (stop.type === 'pickup' && locations?.pickup) {
              position = [locations.pickup.lat, locations.pickup.lng];
            } else if (stop.type === 'delivery' && locations?.dropoff) {
              position = [locations.dropoff.lat, locations.dropoff.lng];
            } else {
              
              if (routeGeometry && routeGeometry.length > 2) {
                
                const fraction = (idx + 1) / (stops.length + 1);
                const coordIdx = Math.floor(routeGeometry.length * fraction);
                position = routeGeometry[coordIdx] || [locations.pickup.lat, locations.pickup.lng];
              } else {
                position = [locations.pickup.lat, locations.pickup.lng];
              }
            }

            if (!position) return null;

            const icon = icons[stop.type] || icons.break;

            return (
              <Marker key={idx} position={position} icon={icon}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-wider text-slate-800">{stop.label}</p>
                    <p className="mt-0.5 text-slate-600">{stop.location}</p>
                    <p className="mt-1 font-semibold text-slate-500">
                      Time: {stop.time} ({stop.duration_minutes} min)
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>
      </div>
    </div>
  );
}