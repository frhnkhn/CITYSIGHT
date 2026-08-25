import cv2
import datetime
import os
from typing import List, Dict, Any

# Assuming ultralytics is installed in the environment
from ultralytics import YOLO

class VehicleDetector:
    def __init__(self, model_path: str = 'yolov8n.pt'):
        """
        Initializes the YOLOv8 model for vehicle detection.
        Downloads the lightweight nano model (yolov8n.pt) if not present locally.
        """
        print(f"Loading YOLO model from {model_path}...")
        self.model = YOLO(model_path)
        
        # COCO class IDs for vehicles
        # 2: car, 3: motorcycle, 5: bus, 7: truck
        self.vehicle_classes = [2, 3, 5, 7]

    def process_frame(self, frame, frame_number: int) -> List[Dict[str, Any]]:
        """
        Process a single OpenCV frame, running YOLOv8 tracking.
        Returns a list of standardized dictionaries matching the VehicleDetection schema.
        """
        timestamp = datetime.datetime.now().isoformat()
        detections = []

        # Run inference with tracking
        # persist=True ensures tracking IDs are maintained across frames
        # classes=self.vehicle_classes filters only the classes we care about
        results = self.model.track(frame, persist=True, classes=self.vehicle_classes, verbose=False)

        if results and len(results) > 0:
            boxes = results[0].boxes
            if boxes is not None and boxes.id is not None:
                # We have track IDs
                for box, track_id, conf, cls in zip(boxes.xyxy, boxes.id, boxes.conf, boxes.cls):
                    x1, y1, x2, y2 = map(int, box.tolist())
                    track_id = int(track_id.item())
                    conf = float(conf.item())
                    cls_id = int(cls.item())
                    class_name = self.model.names[cls_id]

                    detection = {
                        "track_id": track_id,
                        "bbox": (x1, y1, x2, y2),
                        "class_name": class_name,
                        "confidence": conf,
                        "frame_number": frame_number,
                        "timestamp": timestamp
                    }
                    detections.append(detection)

        return detections

if __name__ == "__main__":
    # Simple test block
    print("Initializing VehicleDetector...")
    detector = VehicleDetector()
    
    # Create a dummy blank image (1080p)
    dummy_frame = cv2.resize(cv2.imread(os.devnull) if os.path.exists(os.devnull) else cv2.UMat(), (1920, 1080)) if False else __import__('numpy').zeros((1080, 1920, 3), dtype=__import__('numpy').uint8)
    
    print("Running dummy inference...")
    results = detector.process_frame(dummy_frame, frame_number=1)
    print(f"Found {len(results)} vehicles in dummy frame.")
