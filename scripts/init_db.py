import os
import sys
import json

# Add project root to path so we can import backend modules
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database.connection import engine, Base, SessionLocal
from backend.models.core import Camera

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

def seed_cameras():
    print("Seeding camera network from data/cameras.json...")
    db = SessionLocal()
    
    cameras_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "cameras.json")
    if not os.path.exists(cameras_file):
        print(f"Error: {cameras_file} not found.")
        return
        
    with open(cameras_file, "r") as f:
        cameras_data = json.load(f)
        
    for cam_data in cameras_data:
        # Check if exists
        existing = db.query(Camera).filter(Camera.id == cam_data["id"]).first()
        if not existing:
            cam = Camera(
                id=cam_data["id"],
                name=cam_data["name"],
                latitude=cam_data["latitude"],
                longitude=cam_data["longitude"],
                road_name=cam_data["road_name"],
                status=cam_data["status"],
                direction=cam_data["direction"],
                video_source=cam_data["video_source"]
            )
            db.add(cam)
            print(f"Added camera {cam.id}")
            
    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    init_db()
    seed_cameras()
