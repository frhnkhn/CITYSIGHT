import cv2
import os

def get_video_stream(video_source: str) -> cv2.VideoCapture:
    """
    Given a video source identifier (e.g. 'camera_01.mp4'), returns a cv2.VideoCapture object.
    In the future, this can be updated to accept RTSP URLs or other live stream formats
    without altering the downstream AI processing pipeline.
    """
    # Assuming video_source is just a filename and we are running from project root
    # or the backend/ai directories. We compute the absolute path.
    project_root = os.path.dirname(os.path.dirname(__file__))
    video_path = os.path.join(project_root, "data", "videos", video_source)
    
    # In a real scenario, if video_source starts with 'rtsp://', we'd just pass that directly
    if video_source.startswith("rtsp://") or video_source.startswith("http"):
        return cv2.VideoCapture(video_source)
        
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video source not found: {video_path}")
        
    return cv2.VideoCapture(video_path)
