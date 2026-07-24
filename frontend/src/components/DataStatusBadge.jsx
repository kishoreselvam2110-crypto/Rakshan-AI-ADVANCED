import React from "react";
import { ShieldCheck, Database, Radio, Sparkles, HelpCircle } from "lucide-react";

/**
 * DataStatusBadge
 * Displays clear indicators distinguishing between:
 * • Live Data (Green)
 * • Cached Offline Data (Amber)
 * • Predicted Data (Blue)
 * • Simulated Demo Data (Purple)
 */
export default function DataStatusBadge({ status = "LIVE", confidence = null, source = null }) {
  let badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let icon = <Radio size={12} className="animate-pulse" />;
  let label = "LIVE DATA";

  switch (status.toUpperCase()) {
    case "CACHED":
    case "OFFLINE":
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      icon = <Database size={12} />;
      label = "CACHED OFFLINE DATA";
      break;
    case "PREDICTED":
    case "PREDICTION":
      badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      icon = <Sparkles size={12} />;
      label = "PREDICTED DATA";
      break;
    case "DEMO":
    case "SIMULATED":
      badgeStyle = "bg-purple-500/10 text-purple-400 border-purple-500/20";
      icon = <HelpCircle size={12} />;
      label = "SIMULATED DEMO DATA";
      break;
    case "UNAVAILABLE":
      badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20";
      icon = <HelpCircle size={12} />;
      label = "DATA UNAVAILABLE";
      break;
    default:
      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      icon = <ShieldCheck size={12} />;
      label = "VERIFIED LIVE DATA";
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${badgeStyle}`}
      >
        {icon}
        <span>{label}</span>
      </span>

      {confidence !== null && confidence !== undefined && (
        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/80">
          Confidence: <span className="text-emerald-400 font-black">{confidence}%</span>
        </span>
      )}

      {source && (
        <span className="hidden sm:inline-block text-[9px] text-white/40 font-mono">
          Source: {source}
        </span>
      )}
    </div>
  );
}
