import React, { useState, useEffect } from 'react';
import ScamTrendChart from './ScamTrendChart';
import TopScamsWidget from './TopScamsWidget';
import { motion } from 'framer-motion';

export default function ScamAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token"); // Simulated frontend JWT acquisition
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/scam/analytics', { headers });
        const json = await res.json();
        if (json.success) setAnalytics(json);
      } catch (err) {
        console.error('Failed to load scam analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-6 bg-slate-900/50 animate-pulse rounded-2xl border border-white/10 h-64"></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-white mb-1">Scam Threat Intelligence</h3>
      <p className="text-sm text-slate-400 mb-6">{analytics?.summary || "Analyzing local threat vectors."}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-slate-950/50 p-4 rounded-xl border border-white/5">
          <h4 className="text-sm text-slate-300 font-medium mb-2">Report Frequency by Category</h4>
          <ScamTrendChart data={analytics?.topScamTypes} />
        </div>
        
        <div className="col-span-1">
          <h4 className="text-sm text-slate-300 font-medium">Highest Risk Types</h4>
          <TopScamsWidget scams={analytics?.topScamTypes} />
          
          {analytics?.highRiskAreas && analytics.highRiskAreas.length > 0 && (
             <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
               <div className="text-xs text-rose-400 font-bold mb-1">DANGER ZONES</div>
               <div className="text-sm text-rose-200">
                 {analytics.highRiskAreas.join(", ")}
               </div>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
