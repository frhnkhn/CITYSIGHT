import datetime
from typing import Dict, List, Optional
from backend.schemas.detection import VehicleDetection
from backend.schemas.tracking import TrackedVehicle

class CameraTracker:
    def __init__(self, camera_id: str):
        """
        Maintains state for a single camera to aggregate frame-by-frame 
        detections into cohesive TrackedVehicle objects.
        """
        self.camera_id = camera_id
        # active_tracks: dict mapping track_id -> dict of accumulated state
        self.active_tracks: Dict[int, dict] = {}
        
        # Max frames to keep a track alive without seeing it again
        self.patience = 30 
        
    def update_tracks(self, current_frame: int, frame_detections: List[VehicleDetection]) -> List[TrackedVehicle]:
        """
        Feed the latest frame's AI detections into the tracker.
        Returns a list of TrackedVehicles that have "expired" (left the frame) 
        and are ready to be pushed to the central database.
        """
        now = datetime.datetime.now()
        seen_track_ids = set()

        for det in frame_detections:
            tid = det.track_id
            seen_track_ids.add(tid)

            if tid not in self.active_tracks:
                # New vehicle entered the frame
                self.active_tracks[tid] = {
                    "class_name": det.class_name,
                    "first_seen": now,
                    "last_seen": now,
                    "last_frame": current_frame,
                    "plates": [] # list of (plate_text, confidence)
                }
            else:
                # Update existing track
                self.active_tracks[tid]["last_seen"] = now
                self.active_tracks[tid]["last_frame"] = current_frame

            # Accumulate OCR readings if available
            if getattr(det, 'plate_text', None):
                self.active_tracks[tid]["plates"].append((det.plate_text, det.ocr_confidence))

        # Check for expired tracks (vehicles that left the camera view)
        expired_vehicles = []
        expired_ids = []

        for tid, state in self.active_tracks.items():
            if current_frame - state["last_frame"] > self.patience:
                # Vehicle has left the frame. Consolidate and finalize.
                best_plate = None
                best_conf = 0.0
                
                # Pick the highest confidence plate string
                if state["plates"]:
                    # Sort by confidence descending
                    sorted_plates = sorted(state["plates"], key=lambda x: x[1], reverse=True)
                    best_plate, best_conf = sorted_plates[0]

                tracked_vehicle = TrackedVehicle(
                    track_id=tid,
                    camera_id=self.camera_id,
                    vehicle_class=state["class_name"],
                    first_seen=state["first_seen"],
                    last_seen=state["last_seen"],
                    best_plate_number=best_plate,
                    best_plate_confidence=best_conf
                )
                expired_vehicles.append(tracked_vehicle)
                expired_ids.append(tid)

        # Clean up memory
        for tid in expired_ids:
            del self.active_tracks[tid]

        return expired_vehicles

if __name__ == "__main__":
    # Dummy test block
    tracker = CameraTracker(camera_id="CAM01")
    
    print("Simulating Frame 1: Vehicle 12 enters with plate PB10AB1234 (conf 0.70)")
    det1 = VehicleDetection(
        track_id=12, bbox=(0,0,10,10), class_name="car", confidence=0.9, 
        frame_number=1, timestamp=datetime.datetime.now().isoformat(),
        plate_text="PB10AB1234", ocr_confidence=0.70
    )
    finished = tracker.update_tracks(1, [det1])
    print(f"Finished tracks: {len(finished)}")
    
    print("Simulating Frame 2: Vehicle 12 closer, better OCR (conf 0.95)")
    det2 = VehicleDetection(
        track_id=12, bbox=(5,5,15,15), class_name="car", confidence=0.9, 
        frame_number=2, timestamp=datetime.datetime.now().isoformat(),
        plate_text="PB10AB1234", ocr_confidence=0.95
    )
    finished = tracker.update_tracks(2, [det2])
    print(f"Finished tracks: {len(finished)}")
    
    print("Simulating Frame 35: Vehicle 12 has left the frame.")
    finished = tracker.update_tracks(35, [])
    print(f"Finished tracks: {len(finished)}")
    if finished:
        print(f"Finalized Vehicle Track: {finished[0].model_dump_json(indent=2)}")
