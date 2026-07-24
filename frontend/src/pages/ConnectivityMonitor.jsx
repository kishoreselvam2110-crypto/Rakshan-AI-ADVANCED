import { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { ShieldAlert, Compass, Wifi, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import ConnectivityStatusWidget from "../components/ConnectivityStatusWidget";
import ConnectivityCard from "../components/ConnectivityCard";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function ConnectivityMonitor() {
  const [location, setLocation] = useState({ lat: 13.0827, lon: 80.2707 }); // Fallback: Chennai
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  const getSystemSpecs = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      networkType: conn?.effectiveType || "4g",
      signalQuality: conn ? Math.round(conn.downlink * 10) : 80 // Simulated signal index
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocation({ lat, lon });
          await fetchPrediction(lat, lon);
        },
        async () => {
          toast.warning("GPS blocked or unavailable. Using default safety coordinates.");
          await fetchPrediction(13.0827, 80.2707);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchPrediction = async (lat, lon) => {
    try {
      const specs = getSystemSpecs();
      const storedId = localStorage.getItem("shield_id");
      const userData = storedId ? JSON.parse(storedId) : null;
      const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";

      const { data } = await axios.get(
        api(`/api/connectivity/prediction?lat=${lat}&lon=${lon}&signalQuality=${specs.signalQuality}&networkType=${specs.networkType}&userId=${userId}`)
      );

      if (data && data.success) {
        setPrediction(data);
        if (data.risk === "HIGH") {
          toast.error("⚠️ HIGH RISK OF NETWORK LOSS: Proceed with caution!", { duration: 5000 });
        } else {
          toast.success("Telemetry complete. Connectivity status stable.");
        }
      }
    } catch (err) {
      console.error("Prediction fetch failed:", err);
      toast.error("Failed to query signal telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deadZones = [
    { name: "Deep Forest Restricted Zone (Dead-Zone)", lat: 13.0827, lon: 80.2707, radius: 3000 },
    { name: "Hazardous Cave System (Dead-Zone)", lat: 15.2993, lon: 74.1240, radius: 1000 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:p-8 space-y-8 md:space-y-12">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <Wifi className="text-emerald-400 w-8 h-8 md:w-12 md:h-12" />
            Connectivity Prediction
          </h2>
          <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-black">
            Geospatial Telemetry and Network Loss Forecasting
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadData}
          disabled={loading}
          className="self-start md:self-auto px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 text-white transition-all focus:outline-none"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refreshed Telemetry
        </motion.button>
      </motion.div>

      {/* Connection Specs Widgets */}
      <ConnectivityStatusWidget />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Prediction Results */}
        <div className="lg:col-span-6 space-y-6">
          {loading ? (
            <div className="p-12 text-center bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Querying Satellite Telemetry...</p>
            </div>
          ) : (
            prediction && (
              <ConnectivityCard
                score={prediction.score}
                risk={prediction.risk}
                distance={prediction.distance}
                recommendations={prediction.recommendations}
              />
            )
          )}
          
          <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldAlert className="text-indigo-400" size={20} />
              Offline Security Protocol
            </h3>
            <p className="text-white/60 text-xs leading-relaxed font-medium">
              When entering high-risk dead zones, Rakshan AI automatically caches your digital traveler footprint, registers emergency offline tokens, and prepares local Bluetooth/mesh alerts to preserve safety lines.
            </p>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-6">
          <div className="w-full h-[400px] md:h-[500px] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={13}
              style={{ width: "100%", height: "100%", background: "#111" }}
              aria-label="Map displaying user location and dead zones"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <ChangeMapView center={[location.lat, location.lon]} />

              {/* User Marker */}
              <Marker position={[location.lat, location.lon]}>
                <Popup>
                  <div className="p-1">
                    <h5 className="m-0 font-bold text-xs uppercase tracking-widest text-indigo-400">Your Location</h5>
                    <p className="m-0 text-white font-black font-mono text-[10px] mt-1">
                      {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Dead Zones */}
              {deadZones.map((zone, idx) => (
                <Circle
                  key={idx}
                  center={[zone.lat, zone.lon]}
                  radius={zone.radius}
                  pathOptions={{
                    color: "#ef4444",
                    fillColor: "#ef4444",
                    fillOpacity: 0.15,
                    weight: 1.5,
                    dashArray: "5, 10"
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h5 className="m-0 font-black text-[9px] uppercase tracking-widest text-red-400">Expected Dead-Zone</h5>
                      <p className="m-0 text-white font-bold text-xs mt-1">{zone.name}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
            <div className="absolute bottom-4 left-4 z-[400] bg-black/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full flex items-center gap-2 shadow-lg">
              <Compass size={14} className="text-emerald-400 animate-spin" />
              <span className="text-[9px] uppercase tracking-widest text-white/80 font-black">Satellite Live Coverage Grid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
