import { useState, useEffect } from "react";
import { Signal, Wifi, Activity, Cpu } from "lucide-react";

export default function ConnectivityStatusWidget() {
  const [network, setNetwork] = useState({
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
    online: true,
  });

  useEffect(() => {
    const updateStatus = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        setNetwork({
          effectiveType: conn.effectiveType || "unknown",
          downlink: conn.downlink || 0,
          rtt: conn.rtt || 0,
          online: navigator.onLine,
        });
      } else {
        setNetwork(prev => ({
          ...prev,
          online: navigator.onLine,
        }));
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener("change", updateStatus);
    }

    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (conn) {
        conn.removeEventListener("change", updateStatus);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Online/Offline Status */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
        <div className={`p-3 rounded-xl ${network.online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          <Wifi size={20} />
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-widest text-white/40 font-black">Status</span>
          <p className="text-sm font-black text-white">{network.online ? "ONLINE" : "OFFLINE"}</p>
        </div>
      </div>

      {/* Connection Type */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Signal size={20} />
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-widest text-white/40 font-black">Network Protocol</span>
          <p className="text-sm font-black text-white uppercase">{network.effectiveType}</p>
        </div>
      </div>

      {/* Downlink Speed */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
          <Cpu size={20} />
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-widest text-white/40 font-black">Bandwidth</span>
          <p className="text-sm font-black text-white">{network.downlink} Mbps</p>
        </div>
      </div>

      {/* Round Trip Time */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
          <Activity size={20} />
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-widest text-white/40 font-black">RTT Latency</span>
          <p className="text-sm font-black text-white">{network.rtt} ms</p>
        </div>
      </div>
    </div>
  );
}
