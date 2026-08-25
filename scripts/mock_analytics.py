import os
import sys
import datetime
import random
import string

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database.connection import SessionLocal
from backend.models.core import Detection, Camera

def generate_random_plate():
    # PB 10 AB 1234 format normalized
    return f"PB{random.randint(10,99)}{''.join(random.choices(string.ascii_uppercase, k=2))}{random.randint(1000,9999)}"

def seed_analytics_data():
    print("Seeding 500 random vehicle detections for Traffic Analytics...")
    db = SessionLocal()
    
    # Get available cameras
    cameras = db.query(Camera.id).all()
    camera_ids = [c[0] for c in cameras]
    
    if not camera_ids:
        print("Error: No cameras found in the database. Run init_db.py first.")
        db.close()
        return
        
    vehicle_types = ["car", "car", "car", "car", "car", "truck", "truck", "bus", "motorcycle", "motorcycle"]
    
    base_time = datetime.datetime.now() - datetime.timedelta(days=1)
    
    detections = []
    for i in range(500):
        camera_id = random.choice(camera_ids)
        # Add some bias to make CAM01 and CAM03 busier
        if random.random() < 0.4:
            camera_id = random.choice(["CAM01", "CAM03"])
            
        v_class = random.choice(vehicle_types)
        plate = generate_random_plate() if random.random() > 0.1 else None # 10% unreadable plates
        
        # Random time within the last 24 hours
        time_offset = random.randint(0, 24*60*60)
        seen_time = base_time + datetime.timedelta(seconds=time_offset)
        
        det = Detection(
            track_id=1000 + i,
            camera_id=camera_id,
            vehicle_class=v_class,
            first_seen=seen_time,
            last_seen=seen_time + datetime.timedelta(seconds=random.randint(2, 15)),
            plate_number=plate,
            plate_confidence=random.uniform(0.6, 0.99) if plate else 0.0
        )
        detections.append(det)
        
    # Batch insert
    db.add_all(detections)
    db.commit()
    db.close()
    
    print("Successfully seeded 500 analytics data points!")

if __name__ == "__main__":
    seed_analytics_data()
