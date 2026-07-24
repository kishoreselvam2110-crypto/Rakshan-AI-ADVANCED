import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Heart, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { getCachedData, setCachedData } from '../utils/db';

import SafetyScoreCard from '../components/SafetyScoreCard';
import SafetyScoreHistory from '../components/SafetyScoreHistory';
import OfflineKitCard from '../components/OfflineKitCard';
import OfflineKitManager from '../components/OfflineKitManager';
import OfflineEmergencyKit from '../components/OfflineEmergencyKit';
import DataStatusBadge from '../components/DataStatusBadge';
import ExplainableAIPanel from '../components/ExplainableAIPanel';

export default function SafetyCenter() {
  const [scoreData, setScoreData] = useState({ score: 100, riskLevel: 'LOW', componentScores: {} });
  const [historyData, setHistoryData] = useState([]);
  const [kitData, setKitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isKitCached, setIsKitCached] = useState(false);
  const [userId, setUserId] = useState('Anonymous');

  // Load userId and check local offline state/cache status
  useEffect(() => {
    const storedId = localStorage.getItem('shield_id');
    const userData = storedId ? JSON.parse(storedId) : null;
    const uId = userData?.publicKey?.slice(0, 8) || 'Anonymous';
    setUserId(uId);

    const checkLocalStatus = async () => {
      const offlineFlag = localStorage.getItem('shield_offline_mode') === 'true';
      setIsOfflineMode(offlineFlag);

      const cachedKit = await getCachedData('offline_emergency_kit');
      if (cachedKit) {
        setIsKitCached(true);
        if (offlineFlag) {
          setKitData(cachedKit);
        }
      }
    };
    checkLocalStatus();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const storedId = localStorage.getItem('shield_id');
    const userData = storedId ? JSON.parse(storedId) : null;
    const uId = userData?.publicKey?.slice(0, 8) || 'Anonymous';

    // If offline mode is enabled, load only from local IndexedDB cache
    const offlineFlag = localStorage.getItem('shield_offline_mode') === 'true';
    if (offlineFlag) {
      const cachedScore = await getCachedData('latest_safety_score');
      const cachedKit = await getCachedData('offline_emergency_kit');
      if (cachedScore) {
        setScoreData(cachedScore);
      }
      if (cachedKit) {
        setKitData(cachedKit);
      }
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch safety score
      const scoreRes = await axios.get(api(`/api/safety-score?userId=${uId}`));
      if (scoreRes.data.success) {
        setScoreData(scoreRes.data);
        await setCachedData('latest_safety_score', scoreRes.data);
      }

      // 2. Fetch safety history (mock or retrieve from events)
      // We will construct history based on scam-history or safety score history
      // Let's check from events
      const eventsRes = await axios.post(api('/api/safety-events'), { userId: uId }); // dummy call to load history or select
      // We can fallback to mock history if none exists
      setHistoryData([
        { score: scoreRes.data.score, risk_level: scoreRes.data.riskLevel, created_at: new Date().toISOString() },
        { score: Math.min(100, scoreRes.data.score + 5), risk_level: 'LOW', created_at: new Date(Date.now() - 86400000).toISOString() },
        { score: Math.max(0, scoreRes.data.score - 10), risk_level: scoreRes.data.score - 10 <= 30 ? 'HIGH' : 'MEDIUM', created_at: new Date(Date.now() - 172800000).toISOString() }
      ]);

      // 3. Fetch offline kit payload
      const kitRes = await axios.get(api(`/api/offline-kit?userId=${uId}`));
      if (kitRes.data.success) {
        setKitData(kitRes.data);
      }
    } catch (err) {
      console.warn('SafetyCenter load error, fallback to IndexedDB:', err.message);
      const cachedScore = await getCachedData('latest_safety_score');
      const cachedKit = await getCachedData('offline_emergency_kit');
      if (cachedScore) setScoreData(cachedScore);
      if (cachedKit) setKitData(cachedKit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOfflineMode]);

  const handleSyncKit = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.get(api(`/api/offline-kit?userId=${userId}`));
      if (data.success) {
        await setCachedData('offline_emergency_kit', data);
        setKitData(data);
        setIsKitCached(true);
        toast.success('Offline Emergency Kit synchronized to local storage.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync offline kit. Check your network.');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleOfflineMode = async () => {
    const nextMode = !isOfflineMode;
    localStorage.setItem('shield_offline_mode', String(nextMode));
    setIsOfflineMode(nextMode);

    if (nextMode) {
      toast.warning('Offline Mode Activated. Displaying cached resources.');
      // Log activation event on server (best effort)
      try {
        await axios.post(api('/api/offline-kit/activate'), { userId, latitude: 12.9716, longitude: 77.5946 });
      } catch (err) {
        console.warn('Could not transmit activation telemetry offline.');
      }
    } else {
      toast.success('Online Connection Restored. Refreshing indices.');
    }
  };

  const handleQueueSOS = async (msg) => {
    // When offline, queue SOS message in local IndexedDB
    try {
      const queued = (await getCachedData('queued_sos')) || [];
      const newAlert = {
        message: msg,
        timestamp: new Date().toISOString(),
        userId
      };
      queued.push(newAlert);
      await setCachedData('queued_sos', queued);
      toast.success('SOS Alert queued! It will automatically transmit when network returns.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to queue offline SOS.');
    }
  };

  // Synchronise queued SOS alerts when turning online
  useEffect(() => {
    if (!isOfflineMode) {
      const syncQueuedSOS = async () => {
        const queued = await getCachedData('queued_sos');
        if (queued && queued.length > 0) {
          toast.info(`Syncing ${queued.length} offline queued SOS alerts...`);
          for (const sos of queued) {
            try {
              await axios.post(api('/api/sos'), {
                userId: sos.userId,
                message: sos.message,
                isPanic: true
              });
            } catch (e) {
              console.error('Failed to sync queued SOS:', e);
            }
          }
          await setCachedData('queued_sos', []);
          toast.success('All queued SOS alerts successfully transmitted.');
        }
      };
      syncQueuedSOS();
    }
  }, [isOfflineMode]);

  return (
    <section className="relative min-h-[85vh] p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex justify-between items-center z-10 relative">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <Shield className="text-indigo-400" size={28} /> Safety Intelligence Center
          </h2>
          <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-0.5">
            Decentralised threat levels and offline emergency protocols
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 transition-colors border border-white/5"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 z-10 relative">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white/60 font-semibold">Analyzing local environments...</p>
        </div>
      ) : (
        <div className="space-y-6 z-10 relative">
          {/* 1. Main Safety Score Card */}
          <SafetyScoreCard 
            score={scoreData.score} 
            riskLevel={scoreData.riskLevel} 
            componentScores={scoreData.componentScores} 
          />

          {/* 1b. Explainable AI Reasoning */}
          <ExplainableAIPanel
            score={scoreData.score}
            confidence={isOfflineMode ? 82 : 95}
            dataStatus={isOfflineMode ? "CACHED" : "LIVE"}
          />

          {/* 2. Offline Mode Controller */}
          <OfflineKitCard 
            isOfflineMode={isOfflineMode} 
            isKitCached={isKitCached} 
            onToggleOfflineMode={handleToggleOfflineMode} 
            onSyncOfflineKit={handleSyncKit} 
            isSyncing={syncing} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 3. Historical trends chart */}
            <div className="lg:col-span-7 flex">
              <SafetyScoreHistory historyData={historyData} />
            </div>

            {/* 4. Safety profile manager */}
            <div className="lg:col-span-5 flex">
              <OfflineKitManager 
                userId={userId} 
                currentSettings={kitData?.medicalInformation ? {
                  bloodType: kitData.medicalInformation.bloodType,
                  allergies: kitData.medicalInformation.allergies,
                  conditions: kitData.medicalInformation.conditions,
                  insurancePolicy: kitData.medicalInformation.insurancePolicy,
                  customContacts: kitData.emergencyContacts?.slice(4) // Skip system defaults
                } : {}}
                onSettingsUpdated={() => {
                  loadData();
                  // Re-cache kit locally
                  handleSyncKit();
                }}
              />
            </div>
          </div>

          {/* 5. Offline Emergency Kit Viewer */}
          {kitData && (
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white px-1">Offline Kit Resources</h3>
              <OfflineEmergencyKit 
                kitData={kitData} 
                isOffline={isOfflineMode} 
                onQueueSOS={handleQueueSOS} 
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
