import cv2
import numpy as np

def enhance_plate_image(plate_img: np.ndarray) -> np.ndarray:
    """
    Enhances the plate image for OCR by applying grayscale,
    CLAHE (Contrast Limited Adaptive Histogram Equalization) for low-light,
    and adaptive thresholding.
    """
    if plate_img is None or plate_img.size == 0:
        return plate_img

    # 1. Convert to grayscale
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)

    # 2. Apply CLAHE to improve contrast (especially in low light or dirty plates)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 3. Bilateral filter to reduce noise while keeping edges sharp
    filtered = cv2.bilateralFilter(enhanced, 11, 17, 17)

    # 4. Adaptive thresholding to binarize the image for OCR
    # OCR models usually prefer black text on white background, so we use THRESH_BINARY
    thresh = cv2.adaptiveThreshold(
        filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return thresh

def correct_perspective(image: np.ndarray, corners: np.ndarray) -> np.ndarray:
    """
    If the plate is angled, use the 4 corners to warp it into a flat rectangle.
    `corners` should be a (4, 2) numpy array of (x, y) coordinates.
    """
    # Define the standard plate aspect ratio (e.g., 4:1 for many European/Indian plates)
    width = 400
    height = 100

    pts1 = np.float32(corners)
    pts2 = np.float32([[0, 0], [width, 0], [width, height], [0, height]])

    # Get the perspective transform matrix
    matrix = cv2.getPerspectiveTransform(pts1, pts2)
    
    # Apply the warp
    result = cv2.warpPerspective(image, matrix, (width, height))
    return result
