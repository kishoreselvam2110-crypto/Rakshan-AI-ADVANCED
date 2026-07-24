import { openDB } from "idb";
import axios from "axios";
import { api } from "./api";
import { toast } from "sonner";

const DB_NAME = "RakshanOfflineDB";
const STORE_SOS = "queued_sos";
const STORE_EFIR = "queued_efir";
const STORE_MAP_POIS = "cached_pois";

/**
 * Initialize IndexedDB for offline persistence
 */
export async function initOfflineDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_SOS)) {
        db.createObjectStore(STORE_SOS, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_EFIR)) {
        db.createObjectStore(STORE_EFIR, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_MAP_POIS)) {
        db.createObjectStore(STORE_MAP_POIS, { keyPath: "cacheKey" });
      }
    }
  });
}

/**
 * Queue SOS message locally when offline
 */
export async function queueOfflineSOS(payload) {
  try {
    const db = await initOfflineDB();
    await db.add(STORE_SOS, {
      ...payload,
      queuedAt: new Date().toISOString(),
      status: "QUEUED_OFFLINE"
    });
    toast.warning("Offline Mode: SOS queued locally. Will transmit automatically when network returns.", { icon: "📡" });
  } catch (err) {
    console.error("IndexedDB SOS queue error:", err);
  }
}

/**
 * Queue E-FIR locally when offline
 */
export async function queueOfflineEFIR(payload) {
  try {
    const db = await initOfflineDB();
    await db.add(STORE_EFIR, {
      ...payload,
      queuedAt: new Date().toISOString(),
      status: "QUEUED_OFFLINE"
    });
    toast.warning("Offline Mode: E-FIR queued locally in secure vault.", { icon: "📝" });
  } catch (err) {
    console.error("IndexedDB E-FIR queue error:", err);
  }
}

/**
 * Synchronize all queued items with the backend once online
 */
export async function syncQueuedOfflineEvents() {
  if (!navigator.onLine) return;

  try {
    const db = await initOfflineDB();

    // 1. Sync SOS
    const queuedSOS = await db.getAll(STORE_SOS);
    for (const item of queuedSOS) {
      try {
        await axios.post(api("/api/sos"), item);
        if (item.id) await db.delete(STORE_SOS, item.id);
        toast.success(`Queued SOS for ${item.name || 'Tourist'} successfully transmitted!`, { icon: "🛡️" });
      } catch (err) {
        console.warn("Retrying SOS sync later...", err);
      }
    }

    // 2. Sync E-FIRs
    const queuedEFIR = await db.getAll(STORE_EFIR);
    for (const item of queuedEFIR) {
      try {
        await axios.post(api("/api/efir/create"), item);
        if (item.id) await db.delete(STORE_EFIR, item.id);
        toast.success("Queued E-FIR synchronized with National Vault!", { icon: "✅" });
      } catch (err) {
        console.warn("Retrying E-FIR sync later...", err);
      }
    }
  } catch (err) {
    console.error("Background sync error:", err);
  }
}

// Auto-register online sync listener
if (typeof window !== "undefined") {
  window.addEventListener("online", syncQueuedOfflineEvents);
}
