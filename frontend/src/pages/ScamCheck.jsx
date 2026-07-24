import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, HelpCircle, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import ScamResultCard from "../components/ScamResultCard";
import ScamHistory from "../components/ScamHistory";
import Spinner from "../components/Spinner";
import { generateFallbackScamCheck } from "../utils/fallbackGenerator";

export default function ScamCheck() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  const sampleQueries = [
    "Taxi driver is asking ₹1500 for a 5 km ride.",
    "Unlicensed monument guide near Taj Mahal wants ₹5000.",
    "A hotel deal offers 5-star rooms for ₹300 per night."
  ];

  const fetchHistory = async () => {
    try {
      const storedId = localStorage.getItem("shield_id");
      const userData = storedId ? JSON.parse(storedId) : null;
      const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";
      
      const { data } = await axios.get(api(`/api/scam-history?userId=${userId}`));
      setHistory(data || []);
    } catch (err) {
      console.error("Error fetching scam history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const storedId = localStorage.getItem("shield_id");
      const userData = storedId ? JSON.parse(storedId) : null;
      const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";

      const { data } = await axios.post(api("/api/scam-check"), {
        message: query,
        userId
      });

      if (data && data.success) {
        setResult(data);
        toast.success("Scam Risk Assessment Complete!");
        fetchHistory();
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.warn("Backend scam check offline, utilizing client AI guardrails:", err);
      const fallbackResult = generateFallbackScamCheck(query);
      setResult(fallbackResult);
      toast.success("Scam Risk Assessment Complete (Local Mode)!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQueryFromHistory = (item) => {
    setQuery(item.query);
    setResult({
      riskScore: item.risk_score,
      riskLevel: item.risk_level,
      analysis: item.analysis,
      recommendation: item.recommendation
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:p-8 space-y-8 md:space-y-12">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="text-indigo-400 w-8 h-8 md:w-12 md:h-12" />
          Scam Detection Assistant
        </h2>
        <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-black">
          AI Guard-Rails against travel traps, overcharging, and tourist fraud
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Main Check Console */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/20 shadow-[0_0_15px_#6366f1] animate-scanline pointer-events-none" />
            <h3 className="text-xl font-black mb-6 text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              Analyze Travel Deal / Situation
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="scamQuery" className="text-[10px] uppercase tracking-widest text-indigo-400 font-black ml-1">
                  Describe what happened or what you were offered
                </label>
                <textarea
                  id="scamQuery"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. A taxi driver is asking ₹1500 for a 5 km trip..."
                  rows={4}
                  required
                  aria-required="true"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-white/20 text-sm text-white resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/50 gap-2"
              >
                {loading ? <Spinner /> : "Verify Scam Risk"}
              </motion.button>
            </form>

            {/* Smart Presets */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4 flex items-center gap-2">
                <HelpCircle size={12} />
                Try Sample Situations
              </h4>
              <div className="flex flex-col gap-2">
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(q)}
                    className="text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/40 text-xs font-medium text-white/80 hover:text-white transition-all"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {result && (
              <ScamResultCard
                riskScore={result.riskScore}
                riskLevel={result.riskLevel}
                analysis={result.analysis}
                recommendation={result.recommendation}
              />
            )}
          </AnimatePresence>
        </div>

        {/* History Log Panel */}
        <div className="lg:col-span-5">
          <ScamHistory
            history={history}
            onSelectQuery={handleSelectQueryFromHistory}
          />
        </div>
      </div>
    </div>
  );
}
