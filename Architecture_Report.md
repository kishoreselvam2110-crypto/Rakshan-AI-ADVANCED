# Rakshan AI — Architecture Report & Release Specification

> **Version**: v1.0.0 (SIH 25002 Submission Build)  
> **Target Event**: Smart India Hackathon 2026  
> **Status**: Frozen / Production Ready  

---

## 📐 System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer (PWA / Mobile / Desktop)
        ReactApp["React 19 + Vite Frontend"]
        SW["Service Worker (Workbox PWA)"]
        IndexedDB["IndexedDB Offline Vault (idb)"]
        LeafletMap["Leaflet GIS Canvas Engine"]
    end

    subgraph Backend Intelligence Layer (Express Node.js)
        Server["Express HTTP & WebSocket Server"]
        RoutingEngine["Smart Safe Route Engine"]
        AIEngine["Groq / Gemini AI Provider Interface"]
        OSMProxy["Overpass API Proxy & POI Cache"]
        GeofenceEngine["Tile38 / Math Geofence Inspector"]
    end

    subgraph Data & Cache Persistence Layer
        MySQL["MySQL Database Pool"]
        Dragonfly["DragonflyDB / Redis Cache"]
        Tile38["Tile38 Spatial Geofence Index"]
        OSM["OpenStreetMap / OSRM Live Services"]
    end

    ReactApp -->|REST API / WebSockets| Server
    ReactApp -->|Offline Fallback| IndexedDB
    SW -->|Tile Pre-cache| LeafletMap
    Server --> RoutingEngine
    Server --> AIEngine
    Server --> OSMProxy
    Server --> GeofenceEngine
    OSMProxy -->|Overpass QL| OSM
    RoutingEngine -->|OSRM Driver| OSM
    Server --> MySQL
    GeofenceEngine --> Tile38
    Server --> Dragonfly
```

---

## 📡 Core API Endpoints Reference

| Endpoint | Method | Description | Data Status |
| :--- | :--- | :--- | :--- |
| `/api/routing/safe-route` | `POST` | Multi-factor safe routing evaluation | `LIVE` / `CACHED` |
| `/api/osm/pois` | `GET` | Queries & caches nearby emergency POIs | `LIVE` / `CACHED` |
| `/api/sos` | `POST` | Broadcasts emergency distress alert | `LIVE` |
| `/api/safety-score` | `GET` | Computes weighted multi-factor safety index | `LIVE` / `CACHED` |
| `/api/smart-trip` | `POST` | Generates AI itinerary with GPS coordinates | `LIVE` / `CACHED` |
| `/api/scam-check/analyze` | `POST` | AI scam analysis & fare validation | `LIVE` / `PREDICTED` |
| `/api/efir/create` | `POST` | Files digital police E-FIR document | `LIVE` |
| `/api/zones` | `GET` | Fetches active danger & wilderness geofences | `LIVE` |

---

## 🔒 Security Architecture

1. **AES-256-GCM Encryption**: Encrypts sensitive digital identity tokens and local vCard exports.
2. **PBKDF2 Key Derivation**: Derives secure crypto keys for identity hashing.
3. **Helmet HTTP Headers & Rate Limiting**: Protects backend APIs against brute-force and XSS attacks.
4. **JWT Bearer Authentication**: Secures administrative API routes.

---

## 🚀 Deployment Instructions

### Frontend (Render / Vercel / Netlify)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL`

### Backend (Render Web Service / Node.js)
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `PORT`, `JWT_SECRET`, `GROQ_API_KEY`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

---

## 🏷️ Release Notes (v1.0.0 SIH 25002)

### Highlights
- **100% Zero Fabricated Data**: Transparent Data Status Badges (`LIVE DATA`, `CACHED OFFLINE DATA`, `PREDICTED DATA`, `SIMULATED DEMO DATA`).
- **Smart Safe Route Engine**: Multi-factor routing considering crime, lighting, connectivity, and emergency POIs.
- **Service Worker Tile Cache**: Full PWA offline caching of Leaflet tiles for 30 days.
- **Explainable AI Panel**: Clear breakdown of decision factors and confidence metrics.
