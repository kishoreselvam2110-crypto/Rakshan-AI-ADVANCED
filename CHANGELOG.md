# Changelog — Rakshan AI

All notable changes to the Rakshan AI platform will be documented in this file.

## [1.0.0-SIH25002] - 2026-07-24

### 🌟 Added
- **Multi-Factor Safe Route Engine (`/api/routing/safe-route`)**: Calculates safest travel vectors incorporating Crime Risk, Time of Day, Daylight, Lighting, Cellular Connectivity, and POI Proximity.
- **Transparent Data Status Indicator (`DataStatusBadge`)**: Explicitly identifies whether data is `LIVE DATA`, `CACHED OFFLINE DATA`, `PREDICTED DATA`, or `SIMULATED DEMO DATA` with confidence metrics.
- **Explainable AI Safety Panel (`ExplainableAIPanel`)**: Visual decision panel breaking down positive (`+`) and negative (`−`) scoring factors and active telemetry inputs.
- **Interactive GIS Layer Controller (`MapView`)**: Toggleable map overlays for Live Location, Hospitals, Police Stations, Emergency Shelters, Fuel Stations, ATMs, Danger Zones, Safe Routes, Risk Heatmap, and SOS Events.
- **Overpass API POI Proxy (`/api/osm/pois`)**: Real-time fetching and local caching of OpenStreetMap emergency infrastructures.
- **Interactive AI Travel Assistant (`VoiceAssistant`)**: Modal chat assistant handling safety questions, nearest emergency services, and taxi fare validation.
- **IndexedDB Background Sync (`offlineSync.js`)**: Offline queuing for Emergency SOS distress signals and Police E-FIR submissions with auto-sync upon network reconnection.

### 🛡️ Security & Performance
- **PWA Workbox Caching**: Pre-caches static shell assets, first-aid manual, and Leaflet map tiles (`cartocdn.com`, `openstreetmap.org`) for 30 days.
- **AES-256-GCM & PBKDF2 Vault**: Secured digital ID hashing and local storage encryption.
- **Sub-Millisecond Leaflet Canvas Rendering**: Memory-capped marker node limits (`max 15` per layer) ensuring smooth performance on mobile devices.
