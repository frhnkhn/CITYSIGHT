from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
import math

from backend.database.connection import get_db
from backend.models.core import Detection, Camera, Alert

router = APIRouter()

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees).
    """
    R = 6371.0 # Earth radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

@router.get("/{plate_number}", response_model=Dict[str, Any])
def search_plate(plate_number: str, db: Session = Depends(get_db)):
    """
    Search for a specific vehicle by license plate.
    Returns the aggregated journey timeline including distance and speed.
    """
    plate_number = plate_number.upper()
    
    # Query all detections for this plate, ordered chronologically
    detections = db.query(Detection).filter(
        Detection.plate_number == plate_number
    ).order_by(Detection.first_seen.asc()).all()
    
    if not detections:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    first_seen = detections[0].first_seen
    last_seen = detections[-1].last_seen
    
    # Calculate duration in minutes (ensure at least 1 minute to avoid division by zero)
    duration_seconds = (last_seen - first_seen).total_seconds()
    total_minutes = max(1, int(duration_seconds / 60))
    
    # Fetch camera details to enrich the route and get coordinates
    camera_ids = list(dict.fromkeys([d.camera_id for d in detections])) # Maintain order, remove duplicates
    camera_details = db.query(Camera).filter(Camera.id.in_(camera_ids)).all()
    cam_map = {c.id: c for c in camera_details}
    
    # Trajectory reconstruction
    route = []
    total_distance_km = 0.0
    
    for i, d in enumerate(detections):
        cam = cam_map.get(d.camera_id)
        if not cam:
            continue
            
        route.append({
            "camera_id": cam.id,
            "camera_name": cam.name,
            "latitude": cam.latitude,
            "longitude": cam.longitude,
            "timestamp": d.first_seen.isoformat(),
            "confidence": d.plate_confidence
        })
        
        # Add distance from previous point if not first
        if i > 0:
            prev_cam = cam_map.get(detections[i-1].camera_id)
            if prev_cam and prev_cam.id != cam.id: # only add distance if it moved cameras
                dist = haversine(prev_cam.latitude, prev_cam.longitude, cam.latitude, cam.longitude)
                total_distance_km += dist
                
    # Calculate average speed (km/h)
    duration_hours = duration_seconds / 3600.0
    avg_speed_kmh = (total_distance_km / duration_hours) if duration_hours > 0 else 0.0
    
    # Check for alerts
    alerts_query = db.query(Alert).filter(Alert.plate_number == plate_number).order_by(Alert.timestamp.desc()).all()
    alerts_payload = []
    for alert in alerts_query:
        cam = cam_map.get(alert.camera_id)
        alerts_payload.append({
            "id": alert.id,
            "camera_id": alert.camera_id,
            "camera_name": cam.name if cam else "Unknown",
            "timestamp": alert.timestamp.isoformat(),
            "reason": alert.description,
            "severity": alert.severity
        })
        
    return {
        "plate_number": plate_number,
        "vehicle_type": detections[-1].vehicle_class,
        "first_seen": first_seen.isoformat(),
        "last_seen": last_seen.isoformat(),
        "total_detections": len(detections),
        "cameras_visited": len(camera_ids),
        "total_journey_time_minutes": total_minutes,
        "total_distance_km": round(total_distance_km, 2),
        "average_speed_kmh": round(avg_speed_kmh, 1),
        "route": route,
        "alerts": alerts_payload
    }
