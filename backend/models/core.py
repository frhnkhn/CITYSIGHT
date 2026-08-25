import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True) # e.g. "CAM01"
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    road_name = Column(String)
    status = Column(String, default="online")
    direction = Column(String)
    video_source = Column(String)
    
    detections = relationship("Detection", back_populates="camera")

class Detection(Base):
    """
    Represents an aggregated tracked vehicle moving past a camera.
    """
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"), index=True)
    vehicle_class = Column(String)
    
    # Timestamps
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Plate Info
    plate_number = Column(String, index=True, nullable=True) # e.g. "PB10AB1234"
    plate_confidence = Column(Float, default=0.0)
    
    # Optional metadata (can be populated later for origin-destination matching)
    global_vehicle_id = Column(String, index=True, nullable=True)
    
    # Relationships
    camera = relationship("Camera", back_populates="detections")

class Blacklist(Base):
    __tablename__ = "blacklist"
    
    plate_number = Column(String, primary_key=True, index=True)
    reason = Column(String, nullable=False) # e.g. "Stolen", "Wanted"
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_type = Column(String, index=True) # "BLACKLIST", "ANOMALY"
    severity = Column(String) # "HIGH", "MEDIUM", "LOW"
    plate_number = Column(String, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String)
    is_reviewed = Column(Boolean, default=False)
