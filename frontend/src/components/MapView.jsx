import { useEffect, useRef, useState, useMemo, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import axios from "axios";
import { api } from "../utils/api";
import RiskMapOverlay from "./RiskMapOverlay";
import DataStatusBadge from "./DataStatusBadge";
import { Layers, Shield, Crosshair, AlertTriangle, Navigation, MapPin } from "lucide-react";

// Fix default Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Layer Marker Icons
const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const policeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const fuelIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const atmIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function FitBounds({ points }) {
  const map = useMap();
  const lastPoints = useRef("");
  const [autoFollow, setAutoFollow] = useState(true);

  useEffect(() => {
    const stopFollow = () => setAutoFollow(false);
    map.on("dragstart", stopFollow);
    map.on("zoomstart", stopFollow);
    return () => {
      map.off("dragstart", stopFollow);
      map.off("zoomstart", stopFollow);
    };
  }, [map]);

  useEffect(() => {
    if (!autoFollow) return;
    if (points && points.length > 0) {
      const currentPointsStr = JSON.stringify(points);
      if (currentPointsStr === lastPoints.current) return;

      try {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], animate: true });
          lastPoints.current = currentPointsStr;
        }
      } catch (e) {
        console.warn("FitBounds failed:", e);
      }
    }
  }, [map, points, autoFollow]);
  return null;
}

function MapView({ itinerary = [], safeRoutes = [], mapStyle = "dark" }) {
  const { tourists, alerts, socket } = useApp();
  const [globalZones, setGlobalZones] = useState([]);
  const [pois, setPois] = useState({
    hospitals: [],
    police: [],
    fuel: [],
    shelter: [],
    atm: []
  });
  const [poiDataStatus, setPoiDataStatus] = useState("CACHED");
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Active Layer Visibility Controls
  const [layers, setLayers] = useState({
    liveLocation: true,
    hospitals: true,
    police: true,
    fuel: false,
    shelter: true,
    atm: false,
    dangerZones: true,
    routes: true,
    riskHeatmap: true,
    sosEvents: true
  });

  // Fetch Global Danger Zones
  useEffect(() => {
    axios.get(api("/api/zones"))
      .then(res => setGlobalZones(res.data))
      .catch(err => console.error("Failed to load intelligence zones", err));
  }, []);

  // Fetch POIs around current center location (defaulting to Chennai center if unavailable)
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const centerLat = 13.0827;
        const centerLon = 80.2707;
        const categories = ["hospitals", "police", "fuel", "shelter", "atm"];
        const poiResults = {};

        for (const cat of categories) {
          try {
            const res = await axios.get(api(`/api/osm/pois?lat=${centerLat}&lon=${centerLon}&radius=10000&category=${cat}`));
            poiResults[cat] = res.data.pois || [];
            if (res.data.dataStatus === "LIVE") setPoiDataStatus("LIVE");
          } catch {
            poiResults[cat] = [];
          }
        }
        setPois(poiResults);
      } catch (err) {
        console.warn("POI fetch fallback:", err);
      }
    };
    fetchPOIs();
  }, []);

  // Track Live Location
  useEffect(() => {
    if (!navigator.geolocation || !socket) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("track-location", {
          userId: "me",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
      },
      (err) => console.warn("Geolocation watch warning:", err.message),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket]);

  // Extract markers
  const itineraryMarkers = useMemo(() => (itinerary || [])
    .flatMap((day) => day.activities || [])
    .filter(a => a.lat && a.lon)
    .map((a) => [a.lat, a.lon]), [itinerary]);

  const touristPoints = useMemo(() => Object.values(tourists).map((t) => [t.lat, t.lon]), [tourists]);
  const sosAlerts = useMemo(() => alerts.filter(a => a.type === 'SOS' && a.lat && a.lon), [alerts]);
  const sosPoints = useMemo(() => sosAlerts.map(a => [a.lat, a.lon]), [sosAlerts]);

  const allPoints = useMemo(() => {
    if (itineraryMarkers.length > 0) return itineraryMarkers;
    return [...touristPoints, ...sosPoints];
  }, [itineraryMarkers, touristPoints, sosPoints]);

  const breachedZoneNames = alerts.filter(a => a.type === "GEOFENCE").map(a => a.zoneName);

  const defaultCenter = itineraryMarkers.length > 0 ? itineraryMarkers[0] : [13.0827, 80.2707];
  const defaultZoom = itineraryMarkers.length > 0 ? 12 : 11;

  const toggleLayer = (layerName) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[580px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 z-0 bg-[#050505]"
    >
      {/* Floating GIS Intelligence & Layer Controller */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="bg-black/70 backdrop-blur-xl border border-white/20 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-all shadow-xl"
        >
          <Layers size={16} className="text-indigo-400" />
          <span>GIS Layers ({Object.values(layers).filter(Boolean).length})</span>
        </button>

        <AnimatePresence>
          {showLayerMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 w-64 shadow-2xl space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Toggle Intelligence Layers
                </span>
                <DataStatusBadge status={poiDataStatus} />
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {[
                  { id: "liveLocation", label: "Live GPS Telemetry", icon: "🛰️" },
                  { id: "hospitals", label: "Hospitals & Medical", icon: "🏥" },
                  { id: "police", label: "Police Stations", icon: "👮" },
                  { id: "shelter", label: "Emergency Shelters", icon: "🏠" },
                  { id: "fuel", label: "Fuel Stations", icon: "⛽" },
                  { id: "atm", label: "ATMs & Banking", icon: "💳" },
                  { id: "dangerZones", label: "Geofence Danger Zones", icon: "⚠️" },
                  { id: "routes", label: "Smart Safe Routes", icon: "🛣️" },
                  { id: "riskHeatmap", label: "Risk Density Heatmap", icon: "🔥" },
                  { id: "sosEvents", label: "Active SOS Alerts", icon: "🚨" }
                ].map(l => (
                  <label
                    key={l.id}
                    className="flex items-center justify-between text-xs font-bold text-white/80 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.icon}</span>
                      <span>{l.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={layers[l.id]}
                      onChange={() => toggleLayer(l.id)}
                      className="accent-indigo-500 rounded"
                    />
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leaflet Map Engine */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%", background: "#050505" }}
        scrollWheelZoom={true}
        preferCanvas={true}
        zoomControl={false}
      >
        <FitBounds points={allPoints} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          updateWhenIdle={true}
        />

        {/* Smart Safe Routes */}
        {layers.routes && safeRoutes.map((route, rIdx) => (
          <Polyline
            key={`route-${rIdx}`}
            positions={route.coordinates}
            pathOptions={{
              color: route.isSafest ? '#10b981' : '#f59e0b',
              weight: route.isSafest ? 5 : 3,
              dashArray: route.isSafest ? null : '6, 6',
              opacity: 0.8
            }}
          />
        ))}

        {/* POI Markers (Optimized to max 15 rendered nodes per active category) */}
        {layers.hospitals && pois.hospitals.slice(0, 15).map((p, i) => (
          <Marker key={`hosp-${i}`} position={[p.lat, p.lon]} icon={hospitalIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[9px] font-black uppercase text-red-500 block">🏥 Tertiary Hospital</span>
                <strong className="text-sm">{p.name}</strong>
                <p className="text-[10px] text-gray-600 mt-1">{p.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.police && pois.police.slice(0, 15).map((p, i) => (
          <Marker key={`pol-${i}`} position={[p.lat, p.lon]} icon={policeIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[9px] font-black uppercase text-blue-500 block">👮 Police Station</span>
                <strong className="text-sm">{p.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.fuel && pois.fuel.slice(0, 15).map((p, i) => (
          <Marker key={`fuel-${i}`} position={[p.lat, p.lon]} icon={fuelIcon}>
            <Popup><strong>{p.name}</strong></Popup>
          </Marker>
        ))}

        {layers.atm && pois.atm.slice(0, 15).map((p, i) => (
          <Marker key={`atm-${i}`} position={[p.lat, p.lon]} icon={atmIcon}>
            <Popup><strong>{p.name}</strong></Popup>
          </Marker>
        ))}

        {layers.shelter && pois.shelter.slice(0, 15).map((p, i) => (
          <Marker key={`shelt-${i}`} position={[p.lat, p.lon]} icon={shelterIcon}>
            <Popup><strong>{p.name}</strong></Popup>
          </Marker>
        ))}

        {/* Live Tourists & Assets */}
        {layers.liveLocation && Object.entries(tourists).map(([id, loc]) => {
          const touristIcon = L.divIcon({
            className: 'tourist-beacon',
            html: `<div class="relative"><div class="w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white shadow-[0_0_12px_rgba(99,102,241,1)]"></div><div class="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-60"></div></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          return (
            <Marker key={id} position={[loc.lat, loc.lon]} icon={touristIcon}>
              <Popup>
                <div className="p-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Live Asset Signal</p>
                  <p className="text-sm font-black uppercase">Tourist ID: {id.slice(0, 8)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Geofence Danger Zones */}
        {layers.dangerZones && globalZones.map((z, i) => {
          const isBreached = breachedZoneNames.includes(z.name);
          return (
            <Circle
              key={i}
              center={[z.lat, z.lon]}
              radius={z.radius || 2000}
              pathOptions={{
                color: isBreached ? "#ef4444" : "#f59e0b",
                fillOpacity: isBreached ? 0.45 : 0.1,
                weight: isBreached ? 3 : 1.5,
                dashArray: isBreached ? null : "4 4"
              }}
            >
              <Popup>
                <div>
                  <strong className="block text-sm">{z.name}</strong>
                  <span className={`text-[10px] font-black uppercase ${isBreached ? 'text-red-600' : 'text-amber-600'}`}>
                    {isBreached ? "⚠️ BREACH DETECTED" : "Monitored Geofence"}
                  </span>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Active SOS Events */}
        {layers.sosEvents && sosAlerts.map((sos, i) => (
          <div key={`sos-${i}`}>
            <Circle
              center={[sos.lat, sos.lon]}
              radius={800}
              pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.35, dashArray: '8, 8' }}
            />
            <Marker
              position={[sos.lat, sos.lon]}
              icon={hospitalIcon}
            >
              <Popup>
                <div className="text-center p-1">
                  <div className="text-[9px] font-black text-red-600 uppercase">🚨 ACTIVE SOS DISTRESS</div>
                  <strong>{sos.name || "Tourist Emergency"}</strong>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {layers.riskHeatmap && <RiskMapOverlay />}
        {allPoints.length > 0 && <FitBounds points={allPoints} />}
      </MapContainer>
    </motion.div>
  );
}

export default memo(MapView);
