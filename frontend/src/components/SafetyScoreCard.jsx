import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Wifi, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function SafetyScoreCard({ score = 100, riskLevel = 'LOW', componentScores = {} }) {
  const getColor = (s) => {
    if (s >= 61) return 'text-emerald-400';
    if (s >= 31) return 'text-amber-400';
    return 'text-rose-500';
  };

  const getBgColor = (s) => {
    if (s >= 61) return 'bg-emerald-500/10 border-emerald-500/20';
    if (s >= 31) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getProgressColor = (s) => {
    if (s >= 61) return 'stroke-emerald-400';
    if (s >= 31) return 'stroke-amber-400';
    return 'stroke-rose-500';
  };

  const getIcon = () => {
    if (riskLevel === 'LOW') return <ShieldCheck className="text-emerald-400" size={36} />;
    if (riskLevel === 'MEDIUM') return <Shield className="text-amber-400" size={36} />;
    return <ShieldAlert className="text-rose-500" size={36} />;
  };

  const labels = {
    connectivity: 'Connectivity',
    activeRisks: 'Threat Level',
    geofence: 'Geofence Warnings',
    scam: 'Scam Encounters',
    sos: 'SOS Triggers',
    lostItem: 'Lost Items',
    offlineKit: 'Offline Kit Status'
  };

  // Convert raw DB counts (fewer = better) to user-friendly status text
  const getComponentStatus = (key, val) => {
    // For connectivity, val is signal quality (0-100)
    if (key === 'connectivity') {
      if (val >= 70) return { text: 'Excellent', color: 'text-emerald-400' };
      if (val >= 35) return { text: 'Fair', color: 'text-amber-400' };
      return { text: 'Weak/Offline', color: 'text-rose-500' };
    }
    // For others, 100 is best (0 event count), 0 is worst (10+ events)
    if (val >= 90) return { text: 'Safe', color: 'text-emerald-400' };
    if (val >= 60) return { text: 'Moderate', color: 'text-amber-400' };
    return { text: 'Critical', color: 'text-rose-500' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border ${getBgColor(score)} relative overflow-hidden`}
    >
      {/* Circular Progress Gauge */}
      <div className="relative flex-shrink-0">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="60"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * score) / 100}
            strokeLinecap="round"
            className={`${getProgressColor(score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${getColor(score)} drop-shadow-[0_0_15px_currentColor]`}>
            {score}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider text-white/50 mt-1">
            Safety Score
          </span>
        </div>
      </div>

      {/* Score Summary & Component Breakdown */}
      <div className="flex-grow space-y-4 w-full">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-2xl font-black text-white">Status: {riskLevel} RISK</h3>
            <p className="text-xs text-white/60 font-semibold tracking-wide">
              {riskLevel === 'LOW' 
                ? 'Your travel environment is secure. Continue using normal caution.' 
                : riskLevel === 'MEDIUM' 
                ? 'Heightened alert recommended. Review geofences and offline tools.' 
                : 'Emergency precautions needed. Restrict movement and keep emergency lines open.'}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(componentScores).map(([key, val]) => {
            const status = getComponentStatus(key, val);
            return (
              <div key={key} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {labels[key] || key}
                </span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className={`text-sm font-black ${status.color}`}>
                    {status.text}
                  </span>
                  <span className="text-xs text-white/40 font-bold">
                    {Math.round(val)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
