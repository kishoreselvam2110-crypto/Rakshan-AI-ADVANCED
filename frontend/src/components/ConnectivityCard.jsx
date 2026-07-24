import { motion } from "framer-motion";
import { Signal, Wifi, WifiOff } from "lucide-react";

export default function ConnectivityCard({ score, risk, distance, recommendations = [] }) {
  const getRiskStyles = () => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "MEDIUM":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "LOW":
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const getMeterColor = () => {
    if (score <= 30) return "stroke-red-500";
    if (score <= 60) return "stroke-orange-500";
    return "stroke-emerald-500";
  };

  const strokeDashoffset = 251.2 - (251.2 * (score || 0)) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        {/* Left Side: Score Wheel */}
        <div className="flex flex-col items-center text-center space-y-4 min-w-[150px]">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="40"
                className="stroke-white/10 fill-transparent"
                strokeWidth="10"
              />
              <circle
                cx="64"
                cy="64"
                r="40"
                className={`${getMeterColor()} fill-transparent transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-white">{score || 0}/100</span>
              <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">Signal Health</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 border rounded-full text-xs font-black uppercase tracking-wider ${getRiskStyles()}`}>
            {risk} Loss Risk
          </div>
        </div>

        {/* Right Side: recommendations & distance */}
        <div className="flex-grow space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black">Estimated Dead-Zone Distance</h4>
              <p className="text-2xl font-black text-white mt-1">{distance || "N/A"}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
              {score <= 30 ? (
                <WifiOff className="text-red-400 w-8 h-8 animate-pulse" />
              ) : (
                <Wifi className="text-emerald-400 w-8 h-8" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-black">Suggested Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-white/80 flex items-center gap-2">
                  <Signal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
