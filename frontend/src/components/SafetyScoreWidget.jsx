import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { api } from '../utils/api';
import { getCachedData, setCachedData } from '../utils/db';

export default function SafetyScoreWidget() {
  const [score, setScore] = useState(100);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigate = useNavigate();

  const fetchScore = async () => {
    setLoading(true);
    const storedId = localStorage.getItem('shield_id');
    const userData = storedId ? JSON.parse(storedId) : null;
    const userId = userData?.publicKey?.slice(0, 8) || 'Anonymous';

    try {
      const response = await axios.get(api(`/api/safety-score?userId=${userId}`));
      const data = response.data;
      if (data.success) {
        setScore(data.score);
        setRiskLevel(data.riskLevel);
        setIsOfflineMode(false);
        // Cache the latest score details
        await setCachedData('latest_safety_score', {
          score: data.score,
          riskLevel: data.riskLevel,
          componentScores: data.componentScores,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.warn('SafetyScoreWidget: Failed to fetch live score, retrieving from IndexedDB cache...', err.message);
      const cached = await getCachedData('latest_safety_score');
      if (cached) {
        setScore(cached.score);
        setRiskLevel(cached.riskLevel);
        setIsOfflineMode(true);
      } else {
        // Fallback local score
        setScore(85);
        setRiskLevel('LOW');
        setIsOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const getColor = (s) => {
    if (s >= 61) return 'text-emerald-400';
    if (s >= 31) return 'text-amber-400';
    return 'text-rose-500';
  };

  const getBorderColor = (s) => {
    if (s >= 61) return 'border-emerald-500/20 hover:bg-emerald-500/5';
    if (s >= 31) return 'border-amber-500/20 hover:bg-amber-500/5';
    return 'border-rose-500/20 hover:bg-rose-500/5';
  };

  const getIcon = () => {
    if (riskLevel === 'LOW') return <ShieldCheck className="text-emerald-400" size={24} />;
    if (riskLevel === 'MEDIUM') return <Shield className="text-amber-400" size={24} />;
    return <ShieldAlert className="text-rose-500" size={24} />;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glass-card p-6 border ${getBorderColor(score)} flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group w-full min-h-[180px]`}
      onClick={() => navigate('/safety-center')}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Rakshan Safety Index</span>
          <h4 className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
            {getIcon()}
            {riskLevel} RISK
          </h4>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            fetchScore();
          }}
          disabled={loading}
          className="p-1.5 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
          aria-label="Refresh safety index"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex items-center gap-6 z-10">
        <div className="relative">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={163.3}
              strokeDashoffset={163.3 - (163.3 * score) / 100}
              strokeLinecap="round"
              className={`${getColor(score)} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-black ${getColor(score)}`}>{score}</span>
          </div>
        </div>

        <div className="flex-grow">
          <p className="text-xs text-white/60 font-semibold leading-relaxed">
            {isOfflineMode ? '⚠️ Operating offline. Viewing cached safety status.' : 'Live threat monitoring active.'}
          </p>
          <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-0.5 mt-1 group-hover:text-indigo-300 transition-colors">
            Safety Center details <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
