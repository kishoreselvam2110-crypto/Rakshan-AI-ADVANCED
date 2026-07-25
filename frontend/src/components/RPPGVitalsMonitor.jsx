import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, ShieldAlert, Sparkles, CheckCircle2, RefreshCw, Lock, Zap } from "lucide-react";
import { useRPPGVitals } from "../hooks/useRPPGVitals";
import { setStoredTier, TIERS } from "../utils/entitlements";
import { toast } from "sonner";

export default function RPPGVitalsMonitor() {
  const {
    videoRef,
    isScanning,
    progress,
    vitals,
    signalBuffer,
    error,
    startScan,
    stopScan,
    userTier,
    isPro
  } = useRPPGVitals();

  const [currentTier, setCurrentTier] = useState(userTier);

  const toggleTier = (newTier) => {
    setStoredTier(newTier);
    setCurrentTier(newTier);
    toast.success(`Switched Active Entitlement Tier to ${newTier}`);
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header & Tier Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Heart className="text-rose-500 animate-pulse w-8 h-8" />
              Optical rPPG Vital Telemetry
            </h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              currentTier === TIERS.PRO ? 'bg-indigo-500 text-white' : 
              currentTier === TIERS.ENTERPRISE ? 'bg-amber-500 text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {currentTier} TIER
            </span>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-black mt-1">
            Privacy-First On-Device Photoplethysmography • No Video Leaves Device
          </p>
        </div>

        {/* Entitlement Tier Switcher */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => toggleTier(TIERS.FREE)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              currentTier === TIERS.FREE ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            FREE
          </button>
          <button
            onClick={() => toggleTier(TIERS.PRO)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              currentTier === TIERS.PRO ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            PRO
          </button>
          <button
            onClick={() => toggleTier(TIERS.ENTERPRISE)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              currentTier === TIERS.ENTERPRISE ? 'bg-amber-500 text-black shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            ENTERPRISE
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Preview & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative w-full h-72 bg-black border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${isScanning ? 'opacity-90' : 'opacity-20'}`}
            />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm">
                <Heart size={48} className="text-rose-500/40 mb-3 animate-bounce" />
                <p className="text-xs uppercase tracking-widest text-white/60 font-bold max-w-xs">
                  Place face in well-lit area & remain still for 5 seconds
                </p>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none border-4 border-rose-500/50 rounded-[2.5rem] animate-pulse">
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/40 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Processing Green Wave...</span>
                </div>
              </div>
            )}

            {/* Scan Progress Bar */}
            {isScanning && (
              <div className="absolute bottom-0 inset-x-0 h-2 bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold flex items-center gap-2">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-4">
            {!isScanning ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startScan}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 hover:from-rose-500 hover:to-pink-500 transition-all"
              >
                <Zap size={18} />
                Start Optical Vitals Scan
              </motion.button>
            ) : (
              <button
                onClick={stopScan}
                className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-sm text-white hover:bg-white/20 transition-all"
              >
                Cancel Scan
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Vitals Telemetry Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vitals Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Free Tier: Heart Rate */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Heart Rate (BPM)</span>
              <div className="text-4xl font-black text-white font-mono">
                {vitals.heartRate ? `${vitals.heartRate}` : "--"}
                <span className="text-xs font-normal text-white/40 ml-1">bpm</span>
              </div>
              <p className="text-[10px] text-white/40 font-medium">Free Tier • On-device PPG</p>
            </div>

            {/* Free Tier: SpO2 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Blood Oxygen (SpO2)</span>
              <div className="text-4xl font-black text-white font-mono">
                {vitals.spo2 ? `${vitals.spo2}%` : "--"}
              </div>
              <p className="text-[10px] text-white/40 font-medium">Free Tier • Red/Green Ratio</p>
            </div>

            {/* Pro Tier: HRV */}
            <div className={`p-6 border rounded-[2rem] space-y-2 relative overflow-hidden ${
              isPro ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'
            }`}>
              {!isPro && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest">
                  <Lock size={14} /> Pro Tier Required
                </div>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">HRV (RMSSD)</span>
              <div className="text-3xl font-black text-white font-mono">
                {vitals.hrv ? `${vitals.hrv} ms` : "--"}
              </div>
              <p className="text-[10px] text-white/40 font-medium">Pro Tier • Beat Variability</p>
            </div>

            {/* Pro Tier: Stress Index */}
            <div className={`p-6 border rounded-[2rem] space-y-2 relative overflow-hidden ${
              isPro ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'
            }`}>
              {!isPro && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest">
                  <Lock size={14} /> Pro Tier Required
                </div>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Physiological Stress</span>
              <div className="text-3xl font-black text-white font-mono">
                {vitals.stressIndex ? `${vitals.stressIndex}/100` : "--"}
              </div>
              <p className="text-[10px] text-white/40 font-medium">Pro Tier • Stress Inversion</p>
            </div>
          </div>

          {/* Anomaly Detection Banner (Pro Tier) */}
          {isPro && vitals.anomalyDetected && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-rose-500/20 border-2 border-rose-500/40 rounded-[2rem] space-y-2 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-rose-400 w-6 h-6 animate-bounce" />
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Physiological Anomaly Alert</h4>
              </div>
              <p className="text-xs text-rose-200 font-medium leading-relaxed">
                {vitals.anomalyReason || "Abnormal vital telemetry metrics detected by client-side anomaly models."}
              </p>
            </motion.div>
          )}

          {/* Privacy Footnote */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <p className="text-[11px] text-white/60 font-medium">
              Zero-Cloud Privacy Guarantee: Facial video frames are analyzed entirely inside your browser's RAM memory and discarded instantly. No raw imagery is ever transmitted or stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
