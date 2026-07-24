import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, Hospital, User, Clipboard, Plus, WifiOff, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineEmergencyKit({ kitData = {}, isOffline = false, onQueueSOS }) {
  const [activeTab, setActiveTab] = useState('identity');
  const [sosMsg, setSosMsg] = useState('');

  const {
    digitalId = {},
    emergencyContacts = [],
    nearbyHospitals = [],
    nearbyPoliceStations = [],
    emergencyInstructions = [],
    medicalInformation = {},
    lastKnownLocation = {}
  } = kitData;

  const handleQueueSOS = (e) => {
    e.preventDefault();
    if (!sosMsg.trim()) {
      toast.error('Please enter a message for the SOS alert.');
      return;
    }
    if (onQueueSOS) {
      onQueueSOS(sosMsg.trim());
      setSosMsg('');
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identity', icon: <User size={16} /> },
    { id: 'contacts', label: 'Contacts', icon: <Phone size={16} /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Hospital size={16} /> },
    { id: 'instructions', label: 'Instructions', icon: <Clipboard size={16} /> },
    { id: 'sos', label: 'Offline SOS', icon: <WifiOff size={16} /> }
  ];

  return (
    <div className="glass-card p-4 md:p-6 border border-white/5 flex flex-col md:flex-row gap-6 items-stretch w-full min-h-[500px]">
      {/* Mobile & Desktop Tab Bar */}
      <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-white/10 md:pr-4 md:w-[180px] shrink-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap md:w-full ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-grow min-w-0">
        {activeTab === 'identity' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h4 className="text-lg font-black text-white">Digital Traveler Identity</h4>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-0.5">Verified decentralised credentials</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 border border-white/15 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-2xl">
              <div className="space-y-4 text-center sm:text-left">
                <div>
                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                    Verified Digital ID
                  </span>
                  <h5 className="text-2xl font-black text-white mt-2">{digitalId?.data?.name || 'Anonymous Traveler'}</h5>
                  <p className="text-xs text-indigo-300 font-bold mt-1">ID: {digitalId?.data?.id || 'NO-ID'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-white/60">
                  <div>
                    <span className="text-[9px] uppercase font-black text-white/30 block">Passport Hash</span>
                    <span className="text-white/80 font-bold">{digitalId?.data?.passport ? '••••' + digitalId.data.passport.slice(-4) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black text-white/30 block">Emergency Contact</span>
                    <span className="text-white/80 font-bold">{digitalId?.data?.emergencyContact || '112'}</span>
                  </div>
                </div>
              </div>

              {digitalId?.qrCode && (
                <div className="bg-white p-3 rounded-3xl flex-shrink-0 shadow-lg">
                  <img src={digitalId.qrCode} alt="Traveler ID QR Code" className="w-32 h-32 object-contain" />
                </div>
              )}
            </div>

            {/* Medical Info Sub-card */}
            <div className="bg-white/5 border border-white/5 p-5 rounded-[2rem] space-y-3">
              <h5 className="text-sm font-black text-white flex items-center gap-1.5">
                <FileText size={14} className="text-rose-400" /> Medical Information Card
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-black text-white/30 block">Blood Type</span>
                  <span className="text-white font-bold">{medicalInformation?.bloodType || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-white/30 block">Allergies</span>
                  <span className="text-white font-bold">{medicalInformation?.allergies || 'None declared'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-white/30 block">Conditions</span>
                  <span className="text-white font-bold">{medicalInformation?.conditions || 'None declared'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-white/30 block">Insurance No.</span>
                  <span className="text-white font-bold">{medicalInformation?.insurancePolicy || 'None declared'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'contacts' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-lg font-black text-white">Emergency Contacts</h4>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-0.5">Quick Dial Telephone Services</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emergencyContacts.map((c, i) => (
                <a
                  key={i}
                  href={`tel:${c.number}`}
                  className="flex justify-between items-center bg-white/5 border border-white/5 hover:border-indigo-500/30 p-4 rounded-2xl group transition-all"
                >
                  <div>
                    <span className="text-xs font-black text-white/80 group-hover:text-indigo-400 transition-colors block">
                      {c.name}
                    </span>
                    <span className="text-sm font-black text-white/40 block mt-1">{c.number}</span>
                  </div>
                  <span className="bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all p-2.5 rounded-full">
                    <Phone size={14} />
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'hospitals' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-lg font-black text-white">Nearby Hospitals & Police Stations</h4>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-0.5">Geo-located safety services</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Medical Facilities</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nearbyHospitals.map((h, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black text-white">{h.name}</span>
                        <span className="text-[10px] text-white/50 block mt-0.5">{h.address}</span>
                      </div>
                      <a href={`tel:${h.contact}`} className="bg-rose-500/10 text-rose-400 p-2.5 rounded-full hover:bg-rose-500 hover:text-white transition-colors">
                        <Phone size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Police Support</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nearbyPoliceStations.map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black text-white">{p.name}</span>
                        <span className="text-[10px] text-white/50 block mt-0.5">{p.address}</span>
                      </div>
                      <a href={`tel:${p.contact}`} className="bg-blue-500/10 text-blue-400 p-2.5 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
                        <Phone size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'instructions' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-lg font-black text-white">Emergency Action Instructions</h4>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-0.5">Critical procedures for high-risk scenarios</p>
            </div>

            <div className="space-y-3">
              {emergencyInstructions.map((inst, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <span className="text-xs font-black text-white block mb-2">{inst.scenario}</span>
                  <ul className="list-decimal pl-4 space-y-1">
                    {inst.steps.map((step, idx) => (
                      <li key={idx} className="text-[11px] font-semibold text-white/60 leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'sos' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-lg font-black text-white">Offline Queued SOS Alert</h4>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-0.5">Queue an alert to sync as soon as network is detected</p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl space-y-4">
              <p className="text-xs text-rose-300 font-semibold leading-relaxed">
                If you have no cellular signal, type your emergency situation below. We will cache it in IndexedDB secure storage. 
                Our PWA service worker will monitor connectivity status and transmit the SOS signal immediately once connection is restored.
              </p>

              <form onSubmit={handleQueueSOS} className="space-y-3">
                <textarea
                  value={sosMsg}
                  onChange={(e) => setSosMsg(e.target.value)}
                  placeholder="Specify emergency details (e.g., 'Injured near milestone 4 on Tiger Trail')"
                  rows={3}
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-black shadow-lg"
                  >
                    <Send size={12} /> Queue Offline SOS
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
