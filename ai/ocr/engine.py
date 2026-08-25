import easyocr
import re
import numpy as np
from typing import Tuple, Optional

import ssl
ssl._create_default_https_context = ssl._create_unverified_context

class OCREngine:
    def __init__(self, gpu: bool = False):
        """
        Initialize the EasyOCR reader. 
        It defaults to English alphanumeric characters.
        """
        print("Initializing EasyOCR engine...")
        # We only need English for standard license plates.
        # gpu=False by default for prototyping unless CUDA is guaranteed.
        self.reader = easyocr.Reader(['en'], gpu=gpu)

    def normalize_text(self, text: str) -> str:
        """
        Cleans the OCR output string.
        Transforms "PB 10 AB-1234" -> "PB10AB1234"
        Strips all whitespace and non-alphanumeric characters.
        """
        if not text:
            return ""
        # Remove everything except A-Z, a-z, 0-9
        normalized = re.sub(r'[^A-Za-z0-9]', '', text)
        return normalized.upper()

    def extract_text(self, plate_img: np.ndarray) -> Tuple[Optional[str], float]:
        """
        Takes a preprocessed license plate image and extracts the text.
        Returns the normalized text and confidence score.
        """
        if plate_img is None or plate_img.size == 0:
            return None, 0.0

        # Run easyocr on the image array
        # allowlist restricts the OCR to only alphanumeric characters, increasing accuracy for plates
        results = self.reader.readtext(
            plate_img, 
            allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        )

        if not results:
            return None, 0.0

        # results is a list of tuples: (bounding_box, text, confidence)
        # We assume the largest/most confident text block is the license plate.
        # Sort by confidence
        results.sort(key=lambda x: x[2], reverse=True)
        
        raw_text = results[0][1]
        confidence = float(results[0][2])
        
        normalized_plate = self.normalize_text(raw_text)

        if len(normalized_plate) < 4:
            # Too short to be a valid license plate
            return None, 0.0

        return normalized_plate, confidence

if __name__ == "__main__":
    # Simple test block
    engine = OCREngine(gpu=False)
    # Test normalizer
    test_str = "  PB 10 AB-1234. "
    print(f"Normalizer Test: '{test_str}' -> '{engine.normalize_text(test_str)}'")
