import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CloudOff, AlertOctagon, Download, CheckCircle, WifiOff } from 'lucide-react';

export default function OfflineKitCard({ 
  isOfflineMode = false, 
  isKitCached = false, 
  onToggleOfflineMode, 
  onSyncOfflineKit, 
  isSyncing = false 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-6 border ${
        isOfflineMode 
          ? 'bg-rose-500/10 border-rose-500/30' 
          : 'bg-indigo-500/10 border-indigo-500/20'
      } flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden`}
    >
      <div className="flex items-center gap-4 z-10">
        <div className={`p-4 rounded-3xl ${isOfflineMode ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
          {isOfflineMode ? <WifiOff size={32} /> : <CloudOff size={32} />}
        </div>
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            Offline Emergency Kit
            {isKitCached && <CheckCircle size={16} className="text-emerald-400" />}
          </h3>
          <p className="text-xs text-white/60 font-semibold tracking-wide mt-1 max-w-md">
            {isOfflineMode 
              ? '🚨 OFFLINE EMERGENCY MODE IS ACTIVE. App is utilizing locally stored safety databases.' 
              : 'Keep safety resources ready when entering cellular dead zones. Sync kit data locally.'}
          </p>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto z-10">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSyncOfflineKit}
          disabled={isSyncing}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold w-full sm:w-[160px] transition-all border ${
            isKitCached 
              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
          }`}
        >
          <Download size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : isKitCached ? 'Kit Synchronized' : 'Sync Offline Kit'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleOfflineMode}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-black w-full sm:w-[160px] transition-all ${
            isOfflineMode 
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50' 
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {isOfflineMode ? 'Deactivate Offline' : 'Activate Offline'}
        </motion.button>
      </div>
    </motion.div>
  );
}
