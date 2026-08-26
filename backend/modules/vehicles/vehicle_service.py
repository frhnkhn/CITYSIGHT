import re
from sqlalchemy.orm import Session
from .vehicle_provider import LocalDemoVehicleProvider
from .vehicle_model import Vehicle, PlateRecognition, BlacklistedVehicle, VehicleSearchAudit

class VehicleLookupService:
    def __init__(self, db: Session):
        self.db = db
        # Inject the local demo provider (future: could conditionally inject VahanProvider here)
        self.provider = LocalDemoVehicleProvider(db)

    def normalize_registration_number(self, plate: str) -> str:
        """Removes spaces, hyphens, and converts to uppercase."""
        if not plate:
            return ""
        return re.sub(r'[^A-Z0-9]', '', plate.upper())

    def search_vehicle(self, raw_plate: str, user_id: str = "SYSTEM", source: str = "WEB_UI"):
        normalized_plate = self.normalize_registration_number(raw_plate)
        
        # 1. Fetch from RTO Provider (Local Demo for now)
        rto_data = self.provider.get_vehicle_by_registration_number(normalized_plate)
        
        # Log the search audit
        audit = VehicleSearchAudit(
            registration_number=normalized_plate,
            user_id=user_id,
            search_source=source,
            result_status="FOUND" if rto_data else "NOT_FOUND"
        )
        self.db.add(audit)
        self.db.commit()

        if not rto_data:
            return {
                "found": False,
                "registration_number": normalized_plate,
                "message": "No registration record found in the demo database."
            }

        # 2. Fetch ANPR Recognitions (Trajectory)
        vehicle_record = self.db.query(Vehicle).filter(Vehicle.registration_number == normalized_plate).first()
        recognitions = self.db.query(PlateRecognition).filter(PlateRecognition.vehicle_id == vehicle_record.id).order_by(PlateRecognition.timestamp.asc()).all()
        
        history = []
        for rec in recognitions:
            history.append({
                "camera_id": rec.camera_id,
                "timestamp": rec.timestamp.isoformat(),
                "ocr_confidence": rec.ocr_confidence
            })

        # 3. Check Blacklist Alerts
        alert_data = None
        blacklist = self.db.query(BlacklistedVehicle).filter(BlacklistedVehicle.vehicle_id == vehicle_record.id, BlacklistedVehicle.status == 'ACTIVE').first()
        if blacklist:
            alert_data = {
                "reason_code": blacklist.reason_code,
                "priority": blacklist.priority
            }

        # Combine data
        return {
            **rto_data,
            "anpr_history": history,
            "alert": alert_data
        }
