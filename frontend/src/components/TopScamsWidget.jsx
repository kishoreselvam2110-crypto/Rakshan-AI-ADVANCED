import React from 'react';

export default function TopScamsWidget({ scams }) {
  if (!scams || scams.length === 0) {
    return <div className="text-slate-400 text-sm p-4">No high-risk scams detected locally.</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {scams.map((scam, i) => (
        <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-slate-200 font-medium text-sm">{scam.type}</div>
            <div className="text-rose-400 text-xs mt-1 font-semibold">{scam.trend === 'UP' ? '↑ Trending Up' : '→ Stable'}</div>
          </div>
          <div className="text-xl font-bold text-slate-400">
            {scam.frequency} <span className="text-xs font-normal">reports</span>
          </div>
        </div>
      ))}
    </div>
  );
}
