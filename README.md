# CITYSIGHT
**AI-Powered City-Wide Vehicle Intelligence & Traffic Analytics Platform**

Prototype built for Smart India Hackathon problem statement SIH26217.

## Vision
"CCTV/ANPR cameras across a city become one intelligent spatial-temporal vehicle network."

The platform transforms isolated CCTV/ANPR cameras into a centralized command-and-control vehicle intelligence system answering:
1. WHO is the vehicle?
2. WHERE was it detected?
3. WHEN was it detected?
4. WHERE did it travel?
5. WHAT is happening to traffic across the city?
6. SHOULD authorities be alerted about this vehicle or movement?

## System Architecture

The project is structured into independent, highly modular services:

### Frontend (`/frontend`)
React + TypeScript + Vite, using Vanilla CSS for a professional, "enterprise-grade smart-city command center" aesthetic.

### Backend (`/backend`)
Python FastAPI providing high-performance REST APIs for querying data, processing AI output, and integrating multiple cameras.

### AI Inference (`/ai`)
Modular Python components handling video processing, vehicle detection (YOLO), Plate Detection, OCR, and tracking (DeepSORT).

### Data (`/data`)
Demo datasets, mock prerecorded videos (`camera_01.mp4`, etc.), and local database storage.

## Development Strategy
The project will be built incrementally in the following phases:
- [x] PHASE 00 — Git & GitHub
- [x] PHASE 01 — Prototype Scope & System Design
- [x] PHASE 02 — Camera Network
- [x] PHASE 03 — Video Dataset
- [x] PHASE 04 — Vehicle Detection
- [x] PHASE 05 — Plate Detection
- [x] PHASE 06 — OCR / ANPR
- [x] PHASE 07 — Single-Camera Tracking
- [x] PHASE 08 — Central Database
- [x] PHASE 09 — Multi-Camera Integration
- [x] PHASE 10 — Plate Search
- [x] PHASE 11 — Trajectory Reconstruction
- [x] PHASE 12 — GIS Map
- [x] PHASE 13 — Traffic Analytics
- [x] PHASE 14 — Traffic Heatmap
- [x] PHASE 15 — Origin-Destination Analysis
- [x] PHASE 16 — Blacklist Alerts
- [x] PHASE 17 — Route Anomaly Detection
- [x] PHASE 18 — Main Dashboard
- [x] PHASE 19 — Testing
- [x] PHASE 20 — Prototype Demo

---

## 🚀 Hackathon Judge Instructions (Quick Start)

Welcome to **CITYSIGHT**. This platform turns passive CCTV cameras into an intelligent, spatial-temporal vehicle tracking network.

### 1. Terminal 1 (Backend & Data Initialization)
Start the FastAPI backend and instantly populate the database with 500+ mock detections, Origin-Destination matrices, and trigger live security events (Blacklist/Anomalies):

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt

# Start the API server in the background
uvicorn backend.main:app --reload &

# Run the 1-click Demo Data Seeder
cd ..
sh scripts/setup_demo.sh
```

### 2. Terminal 2 (Frontend)
Boot up the enterprise command center UI:

```bash
cd frontend
npm install
npm run dev
```

### 3. What to Test
1. **The Dashboard (`/`)**: View live traffic volume, camera health, the central heatmap, O-D Matrix routes, and the streaming real-time Alert feed.
2. **Traffic Heatmap (`/heatmap`)**: Drag the 24-hour time slider to see congestion patterns across the city dynamically update.
3. **Vehicle Intelligence (`/search`)**: Search for these specific license plates to test the AI Engine:
   - **`PB10AB1234`** *(Triggers the RED Security Alert - Stolen Vehicle)*
   - **`PB11XX9999`** *(Triggers the ORANGE Anomaly Alert - Physically impossible speeding > 400km/h)*
   - **`GJ05MN8888`** *(Normal commuter journey, reconstructed via Trajectory math)*
