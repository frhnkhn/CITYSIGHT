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
- [ ] PHASE 02 — Camera Network
- [ ] PHASE 03 — Video Dataset
- [ ] PHASE 04 — Vehicle Detection
- [ ] PHASE 05 — Plate Detection
- [ ] PHASE 06 — OCR / ANPR
- [ ] PHASE 07 — Single-Camera Tracking
- [ ] PHASE 08 — Central Database
- [ ] PHASE 09 — Multi-Camera Integration
- [ ] PHASE 10 — Plate Search
- [ ] PHASE 11 — Trajectory Reconstruction
- [ ] PHASE 12 — GIS Map
- [ ] PHASE 13 — Traffic Analytics
- [ ] PHASE 14 — Traffic Heatmap
- [ ] PHASE 15 — Origin-Destination Analysis
- [ ] PHASE 16 — Blacklist Alerts
- [ ] PHASE 17 — Route Anomaly Detection
- [ ] PHASE 18 — Main Dashboard
- [ ] PHASE 19 — Testing
- [ ] PHASE 20 — Prototype Demo

## Setup Instructions

### Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```
