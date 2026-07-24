# Rakshan AI — Production-Ready AI Tourist Safety Platform (SIH 25002)

> **Rakshan AI** is an advanced, offline-first, transparent, AI-driven tourist safety ecosystem engineered for the **Smart India Hackathon (SIH 25002)**.

---

## 🛡️ Core Pillars & Architecture

### 1. Data Accuracy, Reliability & Transparency
Every output across Rakshan AI is explicitly tagged with data source and freshness badges:
- **LIVE DATA**: Verified real-time telemetry stream via Socket.IO & APIs.
- **CACHED OFFLINE DATA**: IndexedDB local storage & Service Worker cache.
- **PREDICTED DATA**: Empirical AI predictive estimations with confidence metrics.
- **SIMULATED DEMO DATA**: Explicitly identified simulation mode when GPS is restricted.

If external data services are unreachable, Rakshan AI gracefully displays `"Data unavailable"` or `"Using cached data"` with an explanation instead of fabricating data.

---

### 2. GIS Map Intelligence (OpenStreetMap + Leaflet Engine)
- **Interactive Layer Controller**: Toggleable overlays for Hospitals, Police Stations, Emergency Shelters, Fuel Stations, ATMs, Danger Zones, Smart Safe Routes, Risk Heatmap, and SOS Alerts.
- **Performance Optimized**: Sub-millisecond Leaflet canvas rendering with memory-capped POI node limits (`max 15` per active layer) and Workbox 30-day map tile pre-caching.

---

### 3. Smart Safe Route Engine (`/api/routing/safe-route`)
Calculates multi-factor safe routes prioritizing tourist security over simple shortest distance:
- Evaluates Crime Risk, Daylight / Night Visibility, Signal Quality, Emergency POI Proximity, and Active Geofences.
- Renders primary safest route, alternative routes, travel duration, and an **Explainable AI Decision Panel**.

---

### 4. AI Travel Assistant
An interactive voice-enabled AI safety assistant capable of answering:
- *"Is this area safe?"*
- *"Find safest route"*
- *"Nearest hospital / police station / shelter"*
- *"Can I travel here after sunset?"*
- *"Is this taxi fare reasonable?"*
- *"How do I reach help offline?"*

---

### 5. Offline-First Architecture & SOS Emergency Protocol
- **PWA Service Worker**: Full offline precaching of static shell assets, first-aid manual, and Leaflet map tiles.
- **Background Sync**: Queues SOS distress signals and E-FIR filings in IndexedDB (`idb`), automatically transmitting when network connectivity returns.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+
- npm v9+

### Installation & Local Setup

```bash
# Clone the repository
git clone https://github.com/kishoreselvam2110-crypto/Rakshan-AI-ADVANCED.git
cd Rakshan-AI-ADVANCED

# Install root dependencies
npm install

# Run backend server
cd backend
npm install
npm start

# Run frontend client (in another terminal)
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Build Verification

```bash
# Run backend vitest suite
cd backend
npm test

# Run frontend production build
cd frontend
npm run build
```

---

## 📄 License & Attribution
- Developed for Smart India Hackathon (SIH 25002).
- Powered by OpenStreetMap, Leaflet, Express.js, React 19, TailwindCSS, and Groq / AI Engine.
