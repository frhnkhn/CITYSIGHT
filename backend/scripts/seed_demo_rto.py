import os
import sys
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Add project root to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(BASE_DIR)

from backend.database.connection import SessionLocal, Base, engine
from backend.modules.vehicles.vehicle_model import Vehicle, PlateRecognition, BlacklistedVehicle, VehicleSearchAudit

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Vehicle).count() > 0:
        print("Database already seeded. Wiping old demo data...")
        db.query(VehicleSearchAudit).delete()
        db.query(BlacklistedVehicle).delete()
        db.query(PlateRecognition).delete()
        db.query(Vehicle).delete()
        db.commit()

    vehicles_data = [
        {"reg": "PB10AB1234", "state": "Punjab", "auth": "RTO Ludhiana", "make": "Maruti Suzuki", "model": "Swift", "color": "White"},
        {"reg": "PB08CD5678", "state": "Punjab", "auth": "RTO Jalandhar", "make": "Hyundai", "model": "i20", "color": "Silver"},
        {"reg": "CH01EF2345", "state": "Chandigarh", "auth": "RLA Chandigarh", "make": "Honda", "model": "City", "color": "Black"},
        {"reg": "HR26GH6789", "state": "Haryana", "auth": "RTO Gurgaon", "make": "Tata", "model": "Nexon", "color": "Red"},
        {"reg": "DL01JK3456", "state": "Delhi", "auth": "RTO Central Delhi", "make": "Toyota", "model": "Innova", "color": "White"},
        {"reg": "UP16LM7890", "state": "Uttar Pradesh", "auth": "RTO Noida", "make": "Mahindra", "model": "Scorpio", "color": "Black"}
    ]

    print("Inserting 50 synthetic vehicle records...")
    # Generate 44 more random ones for bulk
    import random
    states = [("PB", "Punjab", "RTO Mohali"), ("HR", "Haryana", "RTO Panchkula"), ("HP", "Himachal Pradesh", "RTO Shimla")]
    makes = [("Tata", "Punch"), ("Maruti", "Baleno"), ("Kia", "Seltos"), ("Mahindra", "Thar")]
    colors = ["White", "Black", "Grey", "Blue", "Red"]
    
    for i in range(44):
        state_code, state_name, auth = random.choice(states)
        make, model = random.choice(makes)
        color = random.choice(colors)
        letters = chr(random.randint(65, 90)) + chr(random.randint(65, 90))
        reg = f"{state_code}{random.randint(10, 99)}{letters}{random.randint(1000, 9999)}"
        vehicles_data.append({"reg": reg, "state": state_name, "auth": auth, "make": make, "model": model, "color": color})

    inserted_vehicles = {}
    for v in vehicles_data:
        veh = Vehicle(
            registration_number=v["reg"],
            registration_state=v["state"],
            registration_authority=v["auth"],
            vehicle_class="LMV",
            vehicle_type="Car",
            manufacturer=v["make"],
            model=v["model"],
            fuel_type="Petrol",
            color=v["color"],
            registration_date="2024-05-18",
            registration_status="ACTIVE",
            insurance_status="VALID",
            fitness_status="VALID",
            permit_status="NOT APPLICABLE"
        )
        db.add(veh)
        db.commit()
        db.refresh(veh)
        inserted_vehicles[v["reg"]] = veh.id

    print("Inserting synthetic trajectory for PB10AB1234...")
    pb_veh_id = inserted_vehicles["PB10AB1234"]
    
    # Trajectory points: CAM01 -> CAM03 -> CAM05 -> CAM07
    now = datetime.datetime.utcnow()
    trajectory = [
        {"cam": "CAM01", "offset_min": -38},
        {"cam": "CAM03", "offset_min": -25},
        {"cam": "CAM05", "offset_min": -12},
        {"cam": "CAM07", "offset_min": 0}
    ]
    
    for pt in trajectory:
        rec = PlateRecognition(
            vehicle_id=pb_veh_id,
            camera_id=pt["cam"],
            plate_number="PB10AB1234",
            ocr_confidence=round(random.uniform(0.92, 0.98), 2),
            timestamp=now + datetime.timedelta(minutes=pt["offset_min"]),
            detection_confidence=0.99
        )
        db.add(rec)
    db.commit()

    print("Inserting blacklist alert for PB10AB1234...")
    bl = BlacklistedVehicle(
        vehicle_id=pb_veh_id,
        registration_number="PB10AB1234",
        reason_code="STOLEN_VEHICLE",
        priority="HIGH",
        status="ACTIVE"
    )
    db.add(bl)
    db.commit()

    print("Seed complete!")

if __name__ == "__main__":
    seed_db()
