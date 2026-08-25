import os
import sys
import datetime
import random
import string

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database.connection import SessionLocal
from backend.models.core import Detection

def generate_random_plate():
    return f"HR{random.randint(10,99)}{''.join(random.choices(string.ascii_uppercase, k=2))}{random.randint(1000,9999)}"

def seed_od_data():
    print("Seeding Origin-Destination data...")
    db = SessionLocal()
    
    # We will simulate 100 vehicles traveling specific common routes
    # Route A: CAM01 -> CAM02 -> CAM04 (Highway traffic)
    # Route B: CAM06 -> CAM05 (Local traffic)
    # Route C: CAM03 (Only seen once)
    
    base_time = datetime.datetime.now() - datetime.timedelta(hours=5)
    detections = []
    track_counter = 5000
    
    for i in range(100):
        plate = generate_random_plate()
        route_choice = random.choice(["A", "A", "A", "B", "B", "C"])
        
        time_offset = random.randint(0, 4*60*60)
        start_time = base_time + datetime.timedelta(seconds=time_offset)
        
        if route_choice == "A":
            hops = ["CAM01", "CAM02", "CAM04"]
        elif route_choice == "B":
            hops = ["CAM06", "CAM05"]
        else:
            hops = ["CAM03"]
            
        current_time = start_time
        for cam in hops:
            det = Detection(
                track_id=track_counter,
                camera_id=cam,
                vehicle_class="car",
                first_seen=current_time,
                last_seen=current_time + datetime.timedelta(seconds=10),
                plate_number=plate,
                plate_confidence=0.99
            )
            detections.append(det)
            track_counter += 1
            # Add 2-5 minutes between cameras
            current_time += datetime.timedelta(minutes=random.randint(2, 5))
            
    db.add_all(detections)
    db.commit()
    db.close()
    
    print("Successfully seeded 100 journeys for O-D analysis!")

if __name__ == "__main__":
    seed_od_data()
