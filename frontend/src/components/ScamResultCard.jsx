import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default function ScamResultCard({ riskScore, riskLevel, analysis, recommendation }) {
  const getBadgeStyles = () => {
    switch (riskLevel?.toUpperCase()) {
      case "HIGH":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "MEDIUM":
        return "bg-orange-500/10 border-orange-500/20 text-orange-400";
      case "LOW":
      default:
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    }
  };

  const getIcon = () => {
    switch (riskLevel?.toUpperCase()) {
      case "HIGH":
        return <ShieldAlert className="text-red-400 w-8 h-8" />;
      case "MEDIUM":
        return <AlertTriangle className="text-orange-400 w-8 h-8" />;
      case "LOW":
      default:
        return <ShieldCheck className="text-emerald-400 w-8 h-8" />;
    }
  };

  const getMeterColor = () => {
    if (riskScore >= 75) return "stroke-red-500";
    if (riskScore >= 40) return "stroke-orange-500";
    return "stroke-emerald-500";
  };

  // SVG Circular progress radius is 40, circumference is 2 * PI * 40 = 251.2
  const strokeDashoffset = 251.2 - (251.2 * (riskScore || 0)) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="p-6 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[50px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        {/* Left Side: Score & Badge */}
        <div className="flex flex-col items-center text-center space-y-4 min-w-[150px]">
          <div className="relative w-32 h-32">
            {/* Background circle */}
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
              <span className="text-3xl font-black font-mono text-white">{riskScore}%</span>
              <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">SCAM RISK</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 border rounded-full text-xs font-black uppercase tracking-wider ${getBadgeStyles()}`}>
            {riskLevel} RISK
          </div>
        </div>

        {/* Right Side: Analysis & Recommendations */}
        <div className="flex-grow space-y-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-white/5 rounded-2xl shrink-0">
              {getIcon()}
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-1">AI SCAM ANALYSIS</h4>
              <p className="text-white/80 text-sm leading-relaxed font-medium">
                {analysis || "Our security nodes are reviewing your details."}
              </p>
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
            <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-black mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              RECOMMENDED TRAVEL SECURITY ACTION
            </h4>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              {recommendation || "Maintain general situational awareness."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
