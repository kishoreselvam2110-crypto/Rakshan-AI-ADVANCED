import { Circle, Popup } from "react-leaflet";

export default function DeadZoneLayer() {
  const deadZones = [
    { name: "Deep Forest Restricted Zone (Dead-Zone)", lat: 13.0827, lon: 80.2707, radius: 3000, type: "FOREST" },
    { name: "Hazardous Cave System (Dead-Zone)", lat: 15.2993, lon: 74.1240, radius: 1000, type: "CAVE" }
  ];

  return (
    <>
      {deadZones.map((zone, idx) => (
        <Circle
          key={idx}
          center={[zone.lat, zone.lon]}
          radius={zone.radius}
          pathOptions={{
            color: "#f87171",
            fillColor: "#ef4444",
            fillOpacity: 0.25,
            dashArray: "5, 10"
          }}
        >
          <Popup>
            <div className="p-3 font-sans">
              <h4 className="m-0 text-red-400 font-black text-[10px] uppercase tracking-widest">Network Dead Zone</h4>
              <p className="m-1 font-bold text-sm text-white">{zone.name}</p>
              <p className="m-0 text-xs text-white/60">Expected signal quality: 0% - No network access.</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}
