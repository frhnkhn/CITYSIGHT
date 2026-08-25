from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.models.core import Camera

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_cameras(db: Session = Depends(get_db)):
    """
    Returns the network of simulated cameras directly from the SQLite database.
    """
    cameras = db.query(Camera).all()
    # Simple dict mapping for prototype speed instead of full Pydantic response models
    return [
        {
            "id": cam.id,
            "name": cam.name,
            "latitude": cam.latitude,
            "longitude": cam.longitude,
            "road_name": cam.road_name,
            "status": cam.status,
            "direction": cam.direction,
            "video_source": cam.video_source
        }
        for cam in cameras
    ]
