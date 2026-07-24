import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import MapView from "../components/MapView";
import ExplainableAIPanel from "../components/ExplainableAIPanel";
import DataStatusBadge from "../components/DataStatusBadge";
import { api } from "../utils/api";
import { Shield, Navigation, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function Planner() {
  const { setItinerary } = useApp();
  const [form, setForm] = useState({
    destination: "",
    days: 3,
    budget: "Medium",
    language: "English",
  });
  const [itinerary, setLocalItinerary] = useState(null);
  const [safeRoutes, setSafeRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState("");

  const phases = [
    "Establishing Uplink...",
    "Scanning Telemetry...",
    "Analyzing Risk Metrics...",
    "Optimizing Safe Vectors...",
    "Finalizing Itinerary..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase(p => (p < 4 ? p + 1 : p));
      }, 1200);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(api("/api/smart-trip"), form);
      if (data && data.itinerary) {
        setLocalItinerary(data);
        setItinerary(data);

        // Fetch Multi-factor Safe Routes for destination
        try {
          const firstAct = data.itinerary[0]?.activities[0];
          const lastAct = data.itinerary[0]?.activities[1] || firstAct;
          if (firstAct && firstAct.lat) {
            const routeRes = await axios.post(api("/api/routing/safe-route"), {
              startLat: firstAct.lat,
              startLon: firstAct.lon,
              endLat: lastAct.lat,
              endLon: lastAct.lon,
              timeOfDay: "DAY"
            });
            if (routeRes.data && routeRes.data.routes) {
              setSafeRoutes(routeRes.data.routes);
              setSelectedRoute(routeRes.data.routes[0]);
            }
          }
        } catch (routeErr) {
          console.warn("Safe route calculation fallback:", routeErr);
        }

        setTimeout(() => {
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Tactical telemetry failed. Please provide a more specific destination.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:p-8 space-y-8 md:space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Smart Safe Trip Planner</h2>
            <p className="text-indigo-400/80 font-medium mt-1">Multi-factor safe routing & verified itinerary engine</p>
          </div>
          <DataStatusBadge status="LIVE" confidence={95} source="OSM & AI Routing Engine" />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label htmlFor="destination" className="text-[10px] uppercase tracking-widest text-indigo-400 font-black ml-1">Destination</label>
            <input
              id="destination"
              name="destination"
              placeholder="e.g. Goa, India"
              value={form.destination}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 md:py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="days" className="text-[10px] uppercase tracking-widest text-indigo-400 font-black ml-1">Days</label>
            <input
              id="days"
              name="days"
              type="number"
              min={1}
              value={form.days}
              onChange={handleChange}
              className="w-full px-4 py-4 md:py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="budget" className="text-[10px] uppercase tracking-widest text-indigo-400 font-black ml-1">Budget</label>
            <select
              id="budget"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full px-4 py-4 md:py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-white"
            >
              <option className="bg-gray-900">Low</option>
              <option className="bg-gray-900">Medium</option>
              <option className="bg-gray-900">High</option>
              <option className="bg-gray-900">Luxury</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-4 md:py-3 rounded-2xl font-black transition-all shadow-xl flex justify-center items-center gap-3 overflow-hidden relative ${loading ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-[10px] tracking-[0.2em] uppercase font-black">{phases[loadingPhase]}</span>
              </div>
            ) : "Initialize Safe Routing Protocol"}
          </motion.button>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-center text-sm font-bold">
            {error}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {itinerary && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 md:space-y-12"
          >
            {/* Tactical Route Visualization Map */}
            <div className="relative h-[400px] md:h-[580px] w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-3 shadow-2xl overflow-hidden">
              <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 px-4 md:px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                    Smart Safe Route Engine Active
                  </span>
                </div>
              </div>
              <div className="h-full w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
                <MapView itinerary={itinerary.itinerary} safeRoutes={safeRoutes} />
              </div>
            </div>

            {/* Safe Route Selector & Multi-Factor Options */}
            {safeRoutes.length > 0 && (
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Navigation size={18} className="text-emerald-400" />
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">Evaluated Safe Routes</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeRoutes.map((route) => (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        selectedRoute?.id === route.id
                          ? "bg-indigo-600/10 border-indigo-500 text-white shadow-lg"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                          {route.isSafest ? <CheckCircle size={16} className="text-emerald-400" /> : <Navigation size={16} className="text-amber-400" />}
                          {route.name}
                        </span>
                        <DataStatusBadge status={route.dataStatus || "LIVE"} confidence={route.confidence} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/10">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Safety Score</span>
                          <span className="text-lg font-black text-emerald-400">{route.safetyScore}/100</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Distance</span>
                          <span className="text-lg font-black text-white">{route.distanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Est. Time</span>
                          <span className="text-lg font-black text-indigo-300">{route.estimatedTimeMinutes} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explainable AI Panel */}
            <ExplainableAIPanel
              score={selectedRoute?.safetyScore || 88}
              confidence={selectedRoute?.confidence || 92}
              dataStatus={selectedRoute?.dataStatus || "LIVE"}
              reasons={selectedRoute?.reasoning || []}
            />

            {/* Itinerary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {(itinerary.itinerary || []).map((day, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 3) * 0.1 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] flex flex-col shadow-xl border-b-4 border-b-indigo-500/30"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/30 text-white">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">Day {day.day}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">{day.theme || "Exploration"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1 relative">
                    {(day.activities || []).map((act, aIdx) => (
                      <div key={aIdx} className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">{act.time}</span>
                          <h4 className="font-bold text-sm text-indigo-100">{act.name}</h4>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{act.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
