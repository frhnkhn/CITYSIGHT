from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TrackedVehicle(BaseModel):
    """
    Represents an aggregated, single-camera track of a vehicle over time.
    Instead of per-frame detections, this is the final consolidated entity
    sent to the central database.
    """
    track_id: int
    camera_id: str
    vehicle_class: str
    first_seen: datetime
    last_seen: datetime
    best_plate_number: Optional[str] = None
    best_plate_confidence: float = 0.0
