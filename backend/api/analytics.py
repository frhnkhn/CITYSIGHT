from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List

from backend.database.connection import get_db
from backend.models.core import Detection, Camera, Alert

router = APIRouter()

@router.get("/alerts/recent", response_model=List[Dict[str, Any]])
def get_recent_alerts(limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns the most recent network alerts.
    """
    alerts = db.query(Alert).order_by(desc(Alert.timestamp)).limit(limit).all()
    
    cameras = {c.id: c.name for c in db.query(Camera).all()}
    
    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "plate_number": a.plate_number,
            "camera_id": a.camera_id,
            "camera_name": cameras.get(a.camera_id, "Unknown"),
            "timestamp": a.timestamp.isoformat(),
            "description": a.description
        })
    return result

@router.get("/summary", response_model=Dict[str, Any])
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    Returns macro-level traffic analytics across the city network.
    """
    # 1. Total vehicles processed (all time for prototype, could filter by day)
    total_vehicles = db.query(Detection).count()
    
    # 2. Vehicle type distribution
    type_counts = db.query(
        Detection.vehicle_class, 
        func.count(Detection.id).label('count')
    ).group_by(Detection.vehicle_class).all()
    
    distribution = []
    for v_class, count in type_counts:
        percentage = round((count / total_vehicles) * 100, 1) if total_vehicles > 0 else 0
        distribution.append({
            "type": v_class.capitalize() if v_class else "Unknown",
            "count": count,
            "percentage": percentage
        })
        
    # Sort distribution by count descending
    distribution.sort(key=lambda x: x['count'], reverse=True)
    
    # 3. Busiest cameras
    busiest = db.query(
        Detection.camera_id,
        func.count(Detection.id).label('volume')
    ).group_by(Detection.camera_id).order_by(desc('volume')).limit(5).all()
    
    # Enrich with camera names
    busiest_cameras = []
    for cam_id, volume in busiest:
        camera = db.query(Camera).filter(Camera.id == cam_id).first()
        busiest_cameras.append({
            "camera_id": cam_id,
            "camera_name": camera.name if camera else "Unknown",
            "volume": volume
        })
        
    return {
        "total_vehicles_processed": total_vehicles,
        "vehicle_type_distribution": distribution,
        "busiest_cameras": busiest_cameras
    }

@router.get("/heatmap", response_model=Dict[str, Any])
def get_traffic_heatmap(db: Session = Depends(get_db)):
    """
    Returns traffic volume bucketed by camera and hour of the day (0-23).
    Used for rendering the dynamic GIS heatmap.
    """
    # SQLite uses strftime to extract hour. 
    # For a real DB like PostgreSQL, EXTRACT(HOUR FROM first_seen) is standard.
    # We'll use SQLAlchemy's func.strftime for SQLite compatibility.
    
    heatmap_data = db.query(
        Detection.camera_id,
        func.strftime('%H', Detection.first_seen).label('hour'),
        func.count(Detection.id).label('volume')
    ).group_by(
        Detection.camera_id,
        func.strftime('%H', Detection.first_seen)
    ).all()
    
    # Restructure into a frontend-friendly dictionary: { "00": [...], "01": [...] }
    hourly_data = {f"{i:02d}": [] for i in range(24)}
    
    for cam_id, hour_str, volume in heatmap_data:
        if not hour_str: continue
        # Get coordinates for the camera
        camera = db.query(Camera).filter(Camera.id == cam_id).first()
        if camera:
            hourly_data[hour_str].append({
                "camera_id": cam_id,
                "camera_name": camera.name,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "volume": volume
            })
            
    return hourly_data

@router.get("/od-matrix", response_model=Dict[str, Any])
def get_od_matrix(db: Session = Depends(get_db)):
    """
    Returns the Origin-Destination (O-D) matrix for the city.
    Groups vehicles by their entry camera (Origin) and exit camera (Destination).
    """
    # Fetch all detections that have a valid plate number, ordered by time.
    # For a massive database, this would be a complex SQL Window Function,
    # but for prototype agility and SQLite limits, we process the aggregation in Python.
    
    detections = db.query(Detection).filter(Detection.plate_number != None).order_by(Detection.first_seen.asc()).all()
    
    # Map plate -> sequence of camera hops
    journeys = {}
    for d in detections:
        if d.plate_number not in journeys:
            journeys[d.plate_number] = []
        journeys[d.plate_number].append(d.camera_id)
        
    # Aggregate O-D pairs
    od_counts = {}
    for plate, hops in journeys.items():
        if not hops: continue
        origin = hops[0]
        destination = hops[-1]
        
        # Optional: Skip vehicles that were only seen at 1 camera (Origin == Destination)
        # We will include them to show local, non-transit traffic
        
        pair = (origin, destination)
        if pair not in od_counts:
            od_counts[pair] = 0
        od_counts[pair] += 1
        
    # Format for JSON response
    # Fetch camera names for better UI display
    cameras = {c.id: c.name for c in db.query(Camera).all()}
    
    matrix = []
    for (orig, dest), count in od_counts.items():
        matrix.append({
            "origin_id": orig,
            "origin_name": cameras.get(orig, "Unknown"),
            "destination_id": dest,
            "destination_name": cameras.get(dest, "Unknown"),
            "volume": count
        })
        
    # Sort by highest volume
    matrix.sort(key=lambda x: x['volume'], reverse=True)
    
    return {"matrix": matrix}
