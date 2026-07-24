import { motion } from "framer-motion";
import { AlertCircle, Calendar } from "lucide-react";

export default function ScamHistory({ history, onSelectQuery }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 border border-white/10 rounded-[2rem]">
        <p className="text-white/40 text-sm font-medium">No scam reports logged in this session yet.</p>
      </div>
    );
  }

  const getLevelStyles = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "MEDIUM":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "LOW":
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <AlertCircle size={20} className="text-indigo-400" />
          Scam Detection Logs
        </h3>
        <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Latest 10 checks</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {history.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectQuery && onSelectQuery(item)}
            className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            <div className="space-y-2 flex-grow max-w-2xl">
              <p className="text-white font-bold group-hover:text-indigo-400 transition-colors text-sm line-clamp-1">
                "{item.query}"
              </p>
              <div className="flex items-center gap-3 text-white/40 text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(item.created_at || Date.now()).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>Score: {item.risk_score}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${getLevelStyles(item.risk_level)}`}>
                {item.risk_level} Risk
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
