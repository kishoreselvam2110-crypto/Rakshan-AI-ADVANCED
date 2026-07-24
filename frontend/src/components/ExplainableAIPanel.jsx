import React from "react";
import { CheckCircle2, AlertTriangle, Shield, Info, Lightbulb } from "lucide-react";
import DataStatusBadge from "./DataStatusBadge";

/**
 * ExplainableAIPanel
 * Transparently renders AI safety reasoning, positive & negative factors,
 * data freshness, confidence meters, and actionable recommendations.
 */
export default function ExplainableAIPanel({
  score = 84,
  confidence = 91,
  dataStatus = "LIVE",
  reasons = [],
  recommendations = [],
  dataSources = ["GPS Telemetry", "Cached Maps", "Weather API", "Battery Level", "Network Tower Sync", "Geofence Engine"]
}) {
  const defaultReasons = [
    { type: "positive", text: "Proximity to 24/7 Tertiary Emergency Hospital (< 2 km)" },
    { type: "positive", text: "Strong 5G Cellular Signal & High Telemetry Density" },
    { type: "positive", text: "Daylight Hours: High Ambient Lighting & Visibility" },
    { type: "negative", text: "Approaching Low Coverage Terrain Zone in 3.5 km" }
  ];

  const defaultRecommendations = [
    "Pre-download offline maps for target destination",
    "Maintain battery saver mode if signal drops below 2 bars",
    "Share live itinerary with designated emergency guardian"
  ];

  const activeReasons = reasons.length > 0 ? reasons : defaultReasons;
  const activeRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations;

  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-indigo-400" />
            <h3 className="text-lg font-black tracking-tight text-white uppercase">Explainable AI Safety Panel</h3>
          </div>
          <p className="text-xs text-white/60">
            Real-time transparent decision evaluation based on empirical telemetry
          </p>
        </div>

        <DataStatusBadge status={dataStatus} confidence={confidence} />
      </div>

      {/* Safety Score & Confidence Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1">
              Safety Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">{score}</span>
              <span className="text-xs text-white/40 font-bold">/ 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-black text-xs text-emerald-400">
            {score}%
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1">
              Confidence Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-400">{confidence}%</span>
              <span className="text-xs text-indigo-300 font-bold">Verified</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-400 flex items-center justify-center font-black text-xs text-indigo-400">
            {confidence}%
          </div>
        </div>
      </div>

      {/* Reasoning List */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-white/60 flex items-center gap-2">
          <Info size={14} className="text-indigo-400" />
          AI Decision Factors
        </h4>
        <div className="space-y-2">
          {activeReasons.map((item, index) => {
            const isPos = item.type === "positive" || (typeof item === "string" && !item.startsWith("−"));
            const text = typeof item === "string" ? item : item.text;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-medium ${
                  isPos
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/5 border-amber-500/20 text-amber-300"
                }`}
              >
                {isPos ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
          Active Data Sources & Telemetry Inputs
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dataSources.map((src, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg"
            >
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="truncate">{src}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations */}
      {activeRecommendations.length > 0 && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Lightbulb size={14} className="text-indigo-400" />
            AI Safety Recommendations
          </h4>
          <ul className="space-y-1.5 text-xs text-white/80">
            {activeRecommendations.map((rec, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
