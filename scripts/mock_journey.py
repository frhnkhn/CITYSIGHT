import os
import sys
import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database.connection import SessionLocal
from backend.models.core import Detection

def create_mock_journey():
    print("Creating a mock journey for plate PB10AB1234...")
    db = SessionLocal()
    
    # We simulate PB10AB1234 moving from CAM01 -> CAM02 -> CAM03
    # with artificial timestamps to create a realistic average speed.
    
    base_time = datetime.datetime.now() - datetime.timedelta(hours=1)
    
    # Hop 1: CAM01
    det1 = Detection(
        track_id=101, camera_id="CAM01", vehicle_class="car",
        first_seen=base_time, last_seen=base_time + datetime.timedelta(seconds=5),
        plate_number="PB10AB1234", plate_confidence=0.95
    )
    
    # Hop 2: CAM02 (Say it took 3 minutes)
    det2 = Detection(
        track_id=145, camera_id="CAM02", vehicle_class="car",
        first_seen=base_time + datetime.timedelta(minutes=3), last_seen=base_time + datetime.timedelta(minutes=3, seconds=4),
        plate_number="PB10AB1234", plate_confidence=0.91
    )
    
    # Hop 3: CAM03 (Say it took 4 more minutes)
    det3 = Detection(
        track_id=202, camera_id="CAM03", vehicle_class="car",
        first_seen=base_time + datetime.timedelta(minutes=7), last_seen=base_time + datetime.timedelta(minutes=7, seconds=2),
        plate_number="PB10AB1234", plate_confidence=0.88
    )
    
    db.add_all([det1, det2, det3])
    db.commit()
    db.close()
    
    print("Successfully seeded journey for PB10AB1234. You can now search for this plate in the frontend!")

if __name__ == "__main__":
    create_mock_journey()
