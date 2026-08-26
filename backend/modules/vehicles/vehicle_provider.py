from typing import Optional
from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from .vehicle_model import Vehicle, PlateRecognition, BlacklistedVehicle, VehicleSearchAudit

class VehicleDataProvider(ABC):
    @abstractmethod
    def get_vehicle_by_registration_number(self, registration_number: str) -> Optional[dict]:
        """Fetch vehicle details by normalized registration number."""
        pass

class LocalDemoVehicleProvider(VehicleDataProvider):
    def __init__(self, db_session: Session):
        self.db = db_session

    def get_vehicle_by_registration_number(self, registration_number: str) -> Optional[dict]:
        vehicle = self.db.query(Vehicle).filter(Vehicle.registration_number == registration_number).first()
        if not vehicle:
            return None
            
        return {
            "found": True,
            "registration_number": vehicle.registration_number,
            "registration_state": vehicle.registration_state,
            "registration_authority": vehicle.registration_authority,
            "vehicle_class": vehicle.vehicle_class,
            "vehicle_type": vehicle.vehicle_type,
            "manufacturer": vehicle.manufacturer,
            "model": vehicle.model,
            "fuel_type": vehicle.fuel_type,
            "color": vehicle.color,
            "registration_date": vehicle.registration_date,
            "registration_status": vehicle.registration_status,
            "insurance_status": vehicle.insurance_status,
            "fitness_status": vehicle.fitness_status,
            "permit_status": vehicle.permit_status
        }
