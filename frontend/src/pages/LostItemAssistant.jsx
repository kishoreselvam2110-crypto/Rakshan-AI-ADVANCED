import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, Smartphone, CreditCard, Luggage, Map, ChevronLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import RecoveryChecklist from "../components/RecoveryChecklist";
import EmergencyDocuments from "../components/EmergencyDocuments";
import Spinner from "../components/Spinner";
import { generateFallbackLostItem } from "../utils/fallbackGenerator";

export default function LostItemAssistant() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [reportId, setReportId] = useState(null);

  const items = [
    { type: "Passport", label: "Lost Passport", icon: <FileText className="w-8 h-8 text-indigo-400" />, desc: "Emergency visas and embassy coordination." },
    { type: "Wallet", label: "Lost Wallet", icon: <CreditCard className="w-8 h-8 text-pink-400" />, desc: "Freeze bank cards and file report." },
    { type: "Phone", label: "Lost Phone", icon: <Smartphone className="w-8 h-8 text-orange-400" />, desc: "IMEI locking and tracking guide." },
    { type: "Travel Documents", label: "Lost Visas/Tickets", icon: <FileText className="w-8 h-8 text-emerald-400" />, desc: "Retrieve backups and vouchers." },
    { type: "ID Cards", label: "Lost ID Cards", icon: <ShieldCheck className="w-8 h-8 text-purple-400" />, desc: "Aadhaar, DL, or national ID recovery." },
    { type: "Luggage", label: "Lost Luggage", icon: <Luggage className="w-8 h-8 text-teal-400" />, desc: "Airline and transit claim filings." }
  ];

  const handleSelectItem = async (itemType) => {
    setSelectedItem(itemType);
    setLoading(true);
    setRecoveryData(null);
    try {
      const storedId = localStorage.getItem("shield_id");
      const userData = storedId ? JSON.parse(storedId) : null;
      const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";

      const { data } = await axios.post(api("/api/lost-item/recovery"), {
        itemType,
        country: "India", // Default deployment
        userId
      });

      if (data && data.success) {
        setRecoveryData(data);
        setReportId(data.reportId);
        toast.success(`Emergency plan generated for lost ${itemType}.`);
      } else {
        throw new Error("Plan generation failed.");
      }
    } catch (err) {
      console.warn("Backend lost item recovery query offline, engaging local assistant:", err);
      const fallback = generateFallbackLostItem(itemType);
      setRecoveryData(fallback);
      setReportId(fallback.reportId);
      toast.success(`Emergency plan generated for lost ${itemType} (Offline Vault Mode).`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedItem(null);
    setRecoveryData(null);
    setReportId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:p-8 space-y-8 md:space-y-12">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <AlertCircle className="text-indigo-400 w-8 h-8 md:w-12 md:h-12 animate-pulse" />
            Lost Item Assistant
          </h2>
          <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-black">
            Emergency step-by-step document and property recovery guide
          </p>
        </div>

        {selectedItem && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 text-white transition-all focus:outline-none"
          >
            <ChevronLeft size={14} />
            Back to Items
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedItem ? (
          /* Item Selection Menu */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {items.map((item, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectItem(item.type)}
                className="text-left p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-indigo-500/30 transition-all flex items-start gap-5 shadow-xl group"
              >
                <div className="p-4 bg-white/5 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{item.label}</h3>
                  <p className="text-xs text-white/50 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* Recovery Console View */
          <motion.div
            key="console"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12"
          >
            {loading ? (
              <div className="lg:col-span-12 p-24 text-center bg-white/5 border border-white/10 rounded-[3rem] flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Generating Recovery Directives...</p>
              </div>
            ) : (
              recoveryData && (
                <>
                  {/* Left Column: steps checklist */}
                  <div className="lg:col-span-7 space-y-6">
                    <RecoveryChecklist
                      steps={recoveryData.steps}
                      nearestPoliceStation={recoveryData.nearestPoliceStation}
                      recommendedActions={recoveryData.recommendedActions}
                    />
                  </div>

                  {/* Right Column: upload vault */}
                  <div className="lg:col-span-5 space-y-6">
                    <EmergencyDocuments reportId={reportId} />
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                      <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-2 flex items-center gap-2">
                        <Map size={16} />
                        Consulate / Embassy Hotline
                      </h4>
                      <p className="text-white/60 text-xs leading-relaxed font-medium">
                        Contact details for foreign travelers: Call tourist helpline 1363 (toll-free in India) or search our console maps for verified government contact directories.
                      </p>
                    </div>
                  </div>
                </>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
