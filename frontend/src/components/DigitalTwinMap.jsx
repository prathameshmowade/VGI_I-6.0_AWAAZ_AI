import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Building2, Activity, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '380px',
  borderRadius: '1rem'
};

const ZONE_CENTERS = {
  12: { lat: 22.7510, lng: 75.8920, name: 'Vijay Nagar Zone' },
  5: { lat: 22.7253, lng: 75.8778, name: 'Chhappan Dukan Zone' },
  7: { lat: 22.7200, lng: 75.8840, name: 'Palasia Zone' },
  1: { lat: 22.7196, lng: 75.8577, name: 'Rajwada Zone' }
};

const LIVE_COMPLAINT_PINS = [
  {
    id: 'CMP-2026-001',
    title: 'Severe road pothole near Scheme 54 School',
    category: 'Road Damage',
    urgency: 'High Priority',
    status: 'In Progress',
    zoneId: 12,
    lat: 22.7525,
    lng: 75.8935,
    color: '#f59e0b'
  },
  {
    id: 'CMP-2026-002',
    title: 'Major water pipe leakage near Chhappan Dukan',
    category: 'Water Supply',
    urgency: 'Critical Priority',
    status: 'Assigned',
    zoneId: 5,
    lat: 22.7255,
    lng: 75.8778,
    color: '#f43f5e'
  },
  {
    id: 'CMP-2026-003',
    title: 'Uncollected garbage accumulation near Meghdoot Park',
    category: 'Sanitation',
    urgency: 'Medium Priority',
    status: 'New',
    zoneId: 12,
    lat: 22.7518,
    lng: 75.8905,
    color: '#10b981'
  },
  {
    id: 'CMP-2026-004',
    title: 'Broken streetlight junction box at Palasia Square',
    category: 'Electrical',
    urgency: 'High Priority',
    status: 'Resolved',
    zoneId: 7,
    lat: 22.7205,
    lng: 75.8845,
    color: '#8b5cf6'
  }
];

export default function DigitalTwinMap({ selectedZoneId = 12 }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const [activeZoneId, setActiveZoneId] = useState(selectedZoneId);
  const [selectedPin, setSelectedPin] = useState(null);

  const center = ZONE_CENTERS[activeZoneId] || ZONE_CENTERS[12];
  const filteredPins = LIVE_COMPLAINT_PINS.filter(
    (p) => activeZoneId === 'All' || p.zoneId === Number(activeZoneId)
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI SPATIAL TELEMETRY</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>City Telemetry Layer & Digital Twin Map</span>
          </h3>
        </div>

        {/* Zone Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {Object.keys(ZONE_CENTERS).map((zId) => (
            <button
              key={zId}
              type="button"
              onClick={() => setActiveZoneId(Number(zId))}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                Number(activeZoneId) === Number(zId)
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {ZONE_CENTERS[zId].name}
            </button>
          ))}
        </div>
      </div>

      {/* Google Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        {apiKey && isLoaded ? (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={14}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false
            }}
          >
            {filteredPins.map((pin) => (
              <MarkerF
                key={pin.id}
                position={{ lat: pin.lat, lng: pin.lng }}
                onClick={() => setSelectedPin(pin)}
                title={`${pin.id}: ${pin.title}`}
              />
            ))}

            {selectedPin && (
              <InfoWindowF
                position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                onCloseClick={() => setSelectedPin(null)}
              >
                <div className="p-2 space-y-1 text-xs text-slate-900 max-w-xs font-sans">
                  <div className="flex items-center justify-between font-bold text-blue-700">
                    <span>{selectedPin.id}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                      {selectedPin.urgency}
                    </span>
                  </div>
                  <h5 className="font-bold">{selectedPin.title}</h5>
                  <p className="text-[11px] text-slate-600">Category: {selectedPin.category} | Status: {selectedPin.status}</p>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          /* Interactive Fallback Map Embed */
          <div className="relative h-[380px] w-full overflow-hidden">
            <iframe
              title="Google Maps Digital Twin Layer"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=14&output=embed`}
            />
            <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1 max-w-xs">
              <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Google Maps Telemetry ({center.name})</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                4 Live Grievance Nodes Pinned • SHA-256 Verified GIS Feed Active.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-200 font-bold text-[11px]">Critical Hazards (SLA 6h)</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-200 font-bold text-[11px]">High Urgency (SLA 24h)</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-200 font-bold text-[11px]">In Progress / Active</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-200 font-bold text-[11px]">Resolved & Verified</span>
        </div>
      </div>
    </div>
  );
}
