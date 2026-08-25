import os
import sys
import datetime
import requests

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

def trigger_speeding_anomaly():
    print("Triggering Speeding Anomaly via API...")
    
    # We will simulate PB11XX9999 going from CAM01 to CAM02 in just 30 seconds.
    # The Haversine distance is around 3.5km. Doing this in 30s is ~420km/h!
    
    base_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    
    payload1 = {
        "camera_id": "CAM01",
        "tracks": [
            {
                "track_id": 9991,
                "vehicle_class": "car",
                "first_seen": base_time.isoformat(),
                "last_seen": (base_time + datetime.timedelta(seconds=2)).isoformat(),
                "plate_number": "PB11XX9999",
                "plate_confidence": 0.98
            }
        ]
    }
    
    payload2 = {
        "camera_id": "CAM02",
        "tracks": [
            {
                "track_id": 9992,
                "vehicle_class": "car",
                "first_seen": (base_time + datetime.timedelta(seconds=30)).isoformat(),
                "last_seen": (base_time + datetime.timedelta(seconds=32)).isoformat(),
                "plate_number": "PB11XX9999",
                "plate_confidence": 0.96
            }
        ]
    }
    
    # Needs the backend to be running to test the logic directly
    try:
        r1 = requests.post("http://localhost:8000/api/detections/", json=payload1)
        r1.raise_for_status()
        print("Sent CAM01 detection.")
        
        r2 = requests.post("http://localhost:8000/api/detections/", json=payload2)
        r2.raise_for_status()
        print("Sent CAM02 detection (30 seconds later).")
        
        print(f"API Response: {r2.json()}")
        print("Successfully seeded anomalous journey for PB11XX9999. Search for it in the frontend!")
        
    except Exception as e:
        print(f"Failed to hit API: {e}")
        print("Ensure the FastAPI backend is running before executing this mock script.")

if __name__ == "__main__":
    trigger_speeding_anomaly()
