import cv2
import numpy as np
from typing import Tuple, Optional
from ai.plate_detection.preprocess import enhance_plate_image

class PlateDetector:
    def __init__(self, use_ai: bool = False):
        """
        Initializes the license plate detector.
        If use_ai is True, it would load a specific YOLO plate model.
        Otherwise, it falls back to a Computer Vision (OpenCV) approach.
        """
        self.use_ai = use_ai
        if self.use_ai:
            print("Loading AI-based License Plate model...")
            # self.model = YOLO('plate_model.pt')
        else:
            print("Using Computer Vision fallback for Plate Detection...")

    def detect_plate(self, vehicle_crop: np.ndarray) -> Tuple[Optional[np.ndarray], float]:
        """
        Takes a cropped image of a vehicle and returns the cropped, 
        preprocessed image of the license plate along with a confidence score.
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return None, 0.0

        if self.use_ai:
            # Placeholder for actual YOLO plate detection
            # results = self.model(vehicle_crop)
            # return cropped_plate, conf
            pass
        
        # --- Fallback OpenCV Approach ---
        gray = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        bfilter = cv2.bilateralFilter(gray, 11, 17, 17)
        edged = cv2.Canny(bfilter, 30, 200)

        # Find contours
        keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contours = __import__('imutils').grab_contours(keypoints) if False else keypoints[0]
        
        # Sort contours by area
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
        
        location = None
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 10, True)
            if len(approx) == 4:
                location = approx
                break

        # If we couldn't find a clean 4-point contour, fallback to center crop
        if location is None:
            # Dummy logic: assume plate is in the lower half of the vehicle crop
            h, w = vehicle_crop.shape[:2]
            plate_crop = vehicle_crop[int(h*0.6):h, int(w*0.2):int(w*0.8)]
            confidence = 0.4 # Low confidence because we guessed
        else:
            # We found a contour, we can extract the bounding box
            x, y, w, h = cv2.boundingRect(location)
            plate_crop = vehicle_crop[y:y+h, x:x+w]
            confidence = 0.85 # Higher confidence because we found a rectangle

        # Apply preprocessing (grayscale, CLAHE, threshold) for OCR phase
        preprocessed_plate = enhance_plate_image(plate_crop)
        
        return preprocessed_plate, confidence

if __name__ == "__main__":
    # Simple test block
    detector = PlateDetector(use_ai=False)
    dummy_crop = np.zeros((200, 200, 3), dtype=np.uint8)
    plate, conf = detector.detect_plate(dummy_crop)
    print(f"Detected plate shape: {plate.shape if plate is not None else 'None'}, confidence: {conf}")
