from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.connection import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    registration_state = Column(String)
    registration_authority = Column(String)
    vehicle_class = Column(String)
    vehicle_type = Column(String)
    manufacturer = Column(String)
    model = Column(String)
    fuel_type = Column(String)
    color = Column(String)
    registration_date = Column(String) # Storing as YYYY-MM-DD string for simplicity in demo
    registration_status = Column(String)
    insurance_status = Column(String)
    fitness_status = Column(String)
    permit_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recognitions = relationship("PlateRecognition", back_populates="vehicle")
    blacklist_entry = relationship("BlacklistedVehicle", back_populates="vehicle", uselist=False)

class PlateRecognition(Base):
    __tablename__ = "plate_recognitions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    camera_id = Column(String, index=True) # Will refer to cameras.id loosely without strict FK for demo isolation
    plate_number = Column(String, index=True)
    ocr_confidence = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    image_reference = Column(String)
    detection_confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="recognitions")

class BlacklistedVehicle(Base):
    __tablename__ = "blacklisted_vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), unique=True)
    registration_number = Column(String, index=True)
    reason_code = Column(String)
    priority = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="blacklist_entry")

class VehicleSearchAudit(Base):
    __tablename__ = "vehicle_search_audit"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    registration_number = Column(String, index=True)
    user_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    search_source = Column(String)
    result_status = Column(String)
