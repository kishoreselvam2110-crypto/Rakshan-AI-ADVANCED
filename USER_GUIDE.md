# Rakshan AI — Tourist User Guide

Welcome to **Rakshan AI**, your AI-powered tourist safety companion for Smart India Hackathon (SIH 25002).

---

## 🚀 Key Features & How To Use

### 1. Smart Trip Planner & Safe Routing
1. Navigate to the **Planner** page (`/planner`).
2. Input your target destination (e.g. `Goa, India`), travel duration (days), and budget.
3. Click **Initialize AI Protocol**.
4. The map will display the **Primary Safest Route** (Green) and **Alternative Routes** (Gold).
5. Review the **Explainable AI Panel** to see exact safety scores, confidence meters, and positive/negative decision factors.

### 2. Interactive GIS Safety Map
1. Click the **GIS Layers** button on the map view.
2. Toggle specific overlays on or off:
   - 🏥 Hospitals & Emergency Stations
   - 👮 Police Stations
   - ⛽ Fuel & ATMs
   - ⚠️ Geofence Danger Zones
   - 🔥 Risk Density Heatmap
3. Data status badges indicate whether POI data is **LIVE DATA** or **CACHED OFFLINE DATA**.

### 3. Emergency SOS Protocol
1. Press the prominent red **EMERGENCY SOS** button in the top navigation bar.
2. The platform captures your high-accuracy GPS, profile, and timestamp.
3. If online, your distress signal is immediately broadcast to the **Command Center**.
4. If offline, the SOS signal is safely stored in your local IndexedDB vault and will automatically transmit as soon as connectivity is restored.

### 4. AI Travel Assistant
1. Click the **AI Travel Assistant** floating button at the bottom right.
2. Select quick preset questions (e.g. *"Is this area safe?"*, *"Nearest hospital"*, *"Is this taxi fare reasonable?"*) or type custom questions.
3. Review answers tagged with transparent data freshness and confidence scores.

### 5. Offline Emergency Kit & Digital ID
1. Access the **Digital ID** page to generate a decentralized vCard QR code.
2. Enable **Offline Mode** in the **Safety Center** (`/safety-center`) to test full functionality without an active internet connection.
