import os
import sys
import argparse
import cv2
import requests
import json
from datetime import datetime

# Add the project root to sys.path so we can import modules
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from ai.video_manager import get_video_stream
from ai.vehicle_detection.detector import VehicleDetector
from ai.plate_detection.detector import PlateDetector
from ai.ocr.engine import OCREngine
from ai.tracking.single_camera import CameraTracker

# Set the API endpoint for sending detections
API_ENDPOINT = "http://localhost:8000/api/detections"

def post_tracks_to_backend(camera_id: str, tracks: list):
    """
    Sends the finished vehicle tracks to the centralized backend API.
    """
    if not tracks:
        return
        
    payload = {
        "camera_id": camera_id,
        "tracks": []
    }
    
    for t in tracks:
        payload["tracks"].append({
            "track_id": t.track_id,
            "vehicle_class": t.vehicle_class,
            "first_seen": t.first_seen.isoformat(),
            "last_seen": t.last_seen.isoformat(),
            "plate_number": t.best_plate_number,
            "plate_confidence": t.best_plate_confidence
        })
        
    try:
        response = requests.post(API_ENDPOINT, json=payload, timeout=5)
        if response.status_code == 201:
            print(f"[API] Successfully posted {len(tracks)} vehicle tracks to backend.")
        else:
            print(f"[API] Failed to post tracks. Status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[API ERROR] Could not connect to backend: {e}")

def run_pipeline(video_source: str, camera_id: str, max_frames: int = 0):
    print(f"Starting inference pipeline for camera {camera_id}...")
    
    # Initialize components
    vehicle_detector = VehicleDetector()
    plate_detector = PlateDetector(use_ai=False)
    ocr_engine = OCREngine(gpu=False)
    tracker = CameraTracker(camera_id=camera_id)
    
    try:
        cap = get_video_stream(video_source)
    except Exception as e:
        print(f"Error opening video stream: {e}")
        return
        
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        # 1. Detect Vehicles (YOLO)
        raw_detections = vehicle_detector.process_frame(frame, frame_count)
        
        # 2. Process each vehicle crop for plates (OCR)
        for det in raw_detections:
            x1, y1, x2, y2 = det['bbox']
            
            # Ensure bbox is within frame boundaries
            h, w = frame.shape[:2]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            
            vehicle_crop = frame[y1:y2, x1:x2]
            
            # Detect plate
            plate_img, plate_conf = plate_detector.detect_plate(vehicle_crop)
            
            if plate_img is not None:
                # Read text
                plate_text, ocr_conf = ocr_engine.extract_text(plate_img)
                if plate_text:
                    det['plate_text'] = plate_text
                    det['ocr_confidence'] = ocr_conf
                    
        # 3. Update Tracker
        class DetectionAdapter:
            def __init__(self, d):
                self.track_id = d['track_id']
                self.class_name = d['class_name']
                self.plate_text = d.get('plate_text')
                self.ocr_confidence = d.get('ocr_confidence', 0.0)
                
        adapters = [DetectionAdapter(d) for d in raw_detections]
        finished_tracks = tracker.update_tracks(frame_count, adapters)
        
        # 4. Post finished tracks to Backend
        if finished_tracks:
            print(f"[Frame {frame_count}] Finalized {len(finished_tracks)} vehicles leaving the frame.")
            post_tracks_to_backend(camera_id, finished_tracks)
            
        # Optional: Print progress
        if frame_count % 30 == 0:
            print(f"Processed {frame_count} frames. Currently tracking {len(tracker.active_tracks)} vehicles.")
            
        if max_frames > 0 and frame_count >= max_frames:
            break
            
    # Cleanup: Finalize all remaining tracks when video ends
    print("Video stream ended. Finalizing remaining tracks...")
    finished_tracks = tracker.update_tracks(frame_count + tracker.patience + 1, [])
    if finished_tracks:
        post_tracks_to_backend(camera_id, finished_tracks)
        
    cap.release()
    print("Inference pipeline completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CITYSIGHT Real AI Inference Pipeline")
    parser.add_argument("--video", type=str, required=True, help="Path to video file or RTSP stream")
    parser.add_argument("--camera-id", type=str, default="CAM01", help="Camera ID to simulate")
    parser.add_argument("--max-frames", type=int, default=0, help="Maximum frames to process (0 for unlimited)")
    
    args = parser.parse_args()
    run_pipeline(args.video, args.camera_id, args.max_frames)
