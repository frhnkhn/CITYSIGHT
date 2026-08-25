from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime

from backend.database.connection import get_db
from backend.models.core import Detection, Blacklist, Alert

router = APIRouter()

import math

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.post("/", status_code=201)
def create_detection(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Ingest multiple vehicle tracks from an edge camera AI node and perform blacklist & anomaly checks.
    """
    camera_id = payload.get("camera_id")
    if not camera_id:
        raise HTTPException(status_code=400, detail="Missing camera_id")
        
    tracks = payload.get("tracks", [])
    
    # Fetch current camera to get coordinates for speed math
    current_cam = db.query(Camera).filter(Camera.id == camera_id).first()
    
    inserted = 0
    alerts_triggered = 0
    
    try:
        for track in tracks:
            plate = track.get("plate_number")
            first_seen = datetime.datetime.fromisoformat(track.get("first_seen"))
            
            # Phase 17: Anomaly Checks (Before Insertion)
            if plate and current_cam:
                # 1. Speeding Anomaly
                # Get the most recent past detection for this plate
                last_det = db.query(Detection).filter(
                    Detection.plate_number == plate,
                    Detection.first_seen < first_seen
                ).order_by(Detection.first_seen.desc()).first()
                
                if last_det and last_det.camera_id != camera_id:
                    last_cam = db.query(Camera).filter(Camera.id == last_det.camera_id).first()
                    if last_cam:
                        dist_km = haversine(last_cam.latitude, last_cam.longitude, current_cam.latitude, current_cam.longitude)
                        time_hours = (first_seen - last_det.first_seen).total_seconds() / 3600.0
                        
                        if time_hours > 0:
                            speed_kmh = dist_km / time_hours
                            if speed_kmh > 120.0:  # Speeding threshold
                                alert = Alert(
                                    alert_type="ANOMALY",
                                    severity="MEDIUM",
                                    plate_number=plate,
                                    camera_id=camera_id,
                                    timestamp=first_seen,
                                    description=f"Speeding Anomaly: Calculated speed {speed_kmh:.1f} km/h between {last_cam.id} and {camera_id}"
                                )
                                db.add(alert)
                                alerts_triggered += 1

                # 2. Loitering Anomaly
                # Count detections in the last 1 hour
                hour_ago = first_seen - datetime.timedelta(hours=1)
                recent_count = db.query(Detection).filter(
                    Detection.plate_number == plate,
                    Detection.first_seen >= hour_ago
                ).count()
                
                # If hitting the exact threshold (e.g., 5), trigger alert once to avoid spamming
                if recent_count == 5:
                    alert = Alert(
                        alert_type="ANOMALY",
                        severity="LOW",
                        plate_number=plate,
                        camera_id=camera_id,
                        timestamp=first_seen,
                        description=f"Loitering Anomaly: Vehicle detected {recent_count+1} times in the network within 1 hour."
                    )
                    db.add(alert)
                    alerts_triggered += 1
                    
            # Create Detection (After anomaly checks so it doesn't count itself)
            det = Detection(
                track_id=track.get("track_id"),
                camera_id=camera_id,
                vehicle_class=track.get("vehicle_class"),
                first_seen=first_seen,
                last_seen=datetime.datetime.fromisoformat(track.get("last_seen")),
                plate_number=plate,
                plate_confidence=track.get("plate_confidence")
            )
            db.add(det)
            inserted += 1
            
            # Phase 16: Blacklist Check
            if plate:
                flagged = db.query(Blacklist).filter(Blacklist.plate_number == plate).first()
                if flagged:
                    alert = Alert(
                        alert_type="BLACKLIST",
                        severity="HIGH",
                        plate_number=plate,
                        camera_id=camera_id,
                        timestamp=first_seen,
                        description=flagged.reason
                    )
                    db.add(alert)
                    alerts_triggered += 1
                    
        db.commit()
        return {"status": "success", "inserted": inserted, "alerts_triggered": alerts_triggered}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[dict])
def get_recent_detections(limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves the most recent vehicle detections across the city network.
    """
    detections = db.query(Detection).order_by(Detection.last_seen.desc()).limit(limit).all()
    
    return [
        {
            "id": d.id,
            "track_id": d.track_id,
            "camera_id": d.camera_id,
            "vehicle_class": d.vehicle_class,
            "first_seen": d.first_seen.isoformat() if d.first_seen else None,
            "last_seen": d.last_seen.isoformat() if d.last_seen else None,
            "plate_number": d.plate_number,
            "plate_confidence": d.plate_confidence
        }
        for d in detections
    ]
