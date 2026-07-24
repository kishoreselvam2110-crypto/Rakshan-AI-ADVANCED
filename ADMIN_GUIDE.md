# Rakshan AI — Command Center Admin Guide

This guide is intended for security administrators, tourism safety officers, and emergency responders operating the **Rakshan AI Command Center**.

---

## 🖥️ Command Center Overview (`/admin`)

### 1. Real-Time Telemetry & Asset Tracking
- **Live Tourist Grid**: Renders live location beacons of active tourists via Socket.IO WebSockets.
- **LoRaWAN / Satellite Status**: Displays telemetry connection status and latency metrics.

### 2. SOS Distress Signal Triage
1. When an SOS alert is broadcast, a red pulse indicator flashes on the central GIS map.
2. An automated voice announcement alerts operators with tourist details.
3. Click on any active SOS alert card to view:
   - Precise Latitude / Longitude
   - Battery level & Panic status
   - User ID Hash & Incident Timestamp
4. Click **Generate E-FIR** to create an official digital police report signed via Ed25519.

### 3. Geofence Management & Danger Zones
- View real-time geofence breaches (`/api/zones`).
- Monitored zones trigger immediate alerts if a tourist enters a restricted forest, hazardous cave system, or active flood area.

### 4. Scam Analytics & Risk Heatmaps
- Access `/admin` tabs for **Scam Analytics** to view top scam trends, high-risk commercial areas, and frequency charts.
- Overlay the **Risk Density Heatmap** directly on the command map.
