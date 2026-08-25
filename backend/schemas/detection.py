from pydantic import BaseModel
from typing import Tuple

class VehicleDetection(BaseModel):
    track_id: int
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    class_name: str
    confidence: float
    frame_number: int
    timestamp: str  # ISO 8601 format string or simple representation
    
    # Phase 05: Plate Detection
    plate_detected: bool = False
    plate_confidence: float = 0.0
    
    # Phase 06: OCR / ANPR
    plate_text: str = None
    ocr_confidence: float = 0.0
