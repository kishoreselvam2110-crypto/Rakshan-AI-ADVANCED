import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DeadZoneOverlay from './DeadZoneOverlay';
import ConnectivityLegend from './ConnectivityLegend';

export default function ConnectivityHeatmap({ timeFilter }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/connectivity/heatmap?timeFilter=${timeFilter}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error('Heatmap load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [timeFilter]);

  const getColor = (quality) => {
    if (quality > 70) return '#10b981'; // Green (Excellent)
    if (quality > 40) return '#eab308'; // Yellow (Moderate)
    if (quality > 15) return '#f97316'; // Orange (Weak)
    return '#ef4444'; // Red (Dead Zone)
  };

  const center = data.length > 0 ? [data[0].latitude, data[0].longitude] : [12.9716, 77.5946];

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <MapContainer center={center} zoom={13} className="h-full w-full bg-slate-900" zoomControl={false}>
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Render standard connectivity points */}
        {data.map((point, i) => (
          point.signal_quality > 15 && (
            <CircleMarker
              key={i}
              center={[point.latitude, point.longitude]}
              radius={8}
              pathOptions={{
                color: getColor(point.signal_quality),
                fillColor: getColor(point.signal_quality),
                fillOpacity: 0.6,
                weight: 0
              }}
            >
              <Popup className="bg-slate-800 text-white border-none">
                Signal: {point.signal_quality}%
              </Popup>
            </CircleMarker>
          )
        ))}
        
        {/* Render Dead Zones as a dedicated layer overlay */}
        <DeadZoneOverlay data={data.filter(p => p.signal_quality <= 15)} />
      </MapContainer>
      
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm text-emerald-400">
          Loading telemetry...
        </div>
      )}
      <ConnectivityLegend />
    </div>
  );
}
