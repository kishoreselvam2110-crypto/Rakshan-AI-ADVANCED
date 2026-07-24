import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SafetyScoreHistory({ historyData = [] }) {
  const formattedData = historyData.map((d) => ({
    date: new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: d.score,
    risk: d.risk_level
  })).reverse(); // Oldest to newest

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/95 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{data.date}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-black text-indigo-400">Score: {data.score}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border uppercase ${
              data.risk === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              data.risk === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}>
              {data.risk}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border border-white/5 w-full flex flex-col gap-4"
    >
      <div>
        <h3 className="text-xl font-black text-white">Safety Index Trend</h3>
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Historical timeline score logs</p>
      </div>

      <div className="w-full h-[220px] mt-2">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/40 text-sm font-semibold">No historical safety data logged yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                fontWeight="bold"
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                fontWeight="bold"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#scoreColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
