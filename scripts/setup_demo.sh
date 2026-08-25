#!/bin/bash

echo "========================================="
echo "   CITYSIGHT DEMO INITIALIZATION"
echo "========================================="

echo "\n[1/4] Initializing Database & Base Cameras..."
python3 scripts/init_db.py

echo "\n[2/4] Seeding 500 Mock Detections (Traffic Volume)..."
python3 scripts/mock_detections.py

echo "\n[3/4] Seeding Origin-Destination Matrix Data..."
python3 scripts/mock_od.py

echo "\n[4/4] Setting up Security Scenarios..."
# 1. Add stolen car to blacklist
python3 scripts/mock_blacklist.py
# 2. Trigger the stolen car journey through the city
python3 scripts/mock_journey.py
# 3. Trigger a speeding anomaly
python3 scripts/mock_anomaly.py

echo "\n========================================="
echo "✅ CITYSIGHT IS READY FOR DEMO!"
echo "========================================="
echo "Search for the following plates in the frontend:"
echo "1. PB10AB1234 (Blacklisted/Stolen Vehicle)"
echo "2. PB11XX9999 (Speeding Anomaly > 400km/h)"
echo "3. GJ05MN8888 (Normal Vehicle Journey)"
