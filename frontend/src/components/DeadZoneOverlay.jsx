import React from 'react';
import { Circle, Popup } from 'react-leaflet';

export default function DeadZoneOverlay({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((point, i) => (
        <Circle
          key={`dz-${i}`}
          center={[point.latitude, point.longitude]}
          radius={500} // Represents a 500m dead zone radius visually
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 5'
          }}
        >
          <Popup>
            <div className="text-red-500 font-bold">⚠️ High Risk Dead Zone</div>
            <div className="text-slate-300 text-xs">No active network nodes detected within 500m. Offline Emergency Kit recommended.</div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}
