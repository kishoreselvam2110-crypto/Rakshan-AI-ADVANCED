import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../utils/api";
import { motion } from "framer-motion";
import { Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getCachedData, setCachedData } from "../utils/db";
import OfflineEmergencyKit from "../components/OfflineEmergencyKit";

export default function OfflineKit() {
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const loadKit = async () => {
    setLoading(true);
    const offlineFlag = localStorage.getItem("shield_offline_mode") === "true";
    setIsOffline(offlineFlag);

    const storedId = localStorage.getItem("shield_id");
    const userData = storedId ? JSON.parse(storedId) : null;
    const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";

    if (offlineFlag) {
      const cached = await getCachedData("offline_emergency_kit");
      if (cached) {
        setKit(cached);
      } else {
        toast.error("Offline Kit cache not found. Please sync when online.");
      }
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(api(`/api/offline-kit?userId=${userId}`));
      if (data.success) {
        setKit(data);
        await setCachedData("offline_emergency_kit", data);
      }
    } catch (e) {
      console.warn("Failed to load offline kit from network, checking IndexedDB cache...", e.message);
      const cached = await getCachedData("offline_emergency_kit");
      if (cached) {
        setKit(cached);
      } else {
        toast.error("Failed to load kit details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKit();
  }, []);

  const handleQueueSOS = async (msg) => {
    try {
      const storedId = localStorage.getItem("shield_id");
      const userData = storedId ? JSON.parse(storedId) : null;
      const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";

      const queued = (await getCachedData("queued_sos")) || [];
      queued.push({
        message: msg,
        timestamp: new Date().toISOString(),
        userId
      });
      await setCachedData("queued_sos", queued);
      toast.success("SOS alert queued offline. It will sync once connection is restored.");
    } catch (err) {
      toast.error("Failed to queue SOS alert.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6 p-4 md:p-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black flex items-center gap-2 text-white">
          <Shield className="text-indigo-400" size={28} /> Offline Emergency Kit
        </h2>
        <button
          onClick={loadKit}
          disabled={loading}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-white transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading offline kit...</p>
        </div>
      ) : (
        kit && (
          <div className="space-y-4">
            <OfflineEmergencyKit 
              kitData={kit} 
              isOffline={isOffline} 
              onQueueSOS={handleQueueSOS} 
            />
          </div>
        )
      )}
    </motion.div>
  );
}
