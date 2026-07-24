import React from 'react';

export default function ConnectivityLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <h4 className="text-white font-semibold mb-2">Network Quality</h4>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
        <span className="text-slate-300">Excellent (&gt;70%)</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
        <span className="text-slate-300">Moderate (40-70%)</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
        <span className="text-slate-300">Weak (15-40%)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full border-2 border-dashed border-red-500 bg-red-500/30"></span>
        <span className="text-red-400 font-medium">Dead Zone (&lt;15%)</span>
      </div>
    </div>
  );
}
