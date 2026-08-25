import os
import urllib.request
import shutil

# We will download a very short, tiny sample traffic video just for demo purposes.
# This URL points to a small dummy video (or we can just generate a valid small mp4 file if this fails).
# Actually, since reliable public direct links for mp4 can be flaky, we will create a dummy video 
# using OpenCV if cv2 is installed, otherwise just touch an empty file with a warning.
# Wait, for Phase 04 we need real frames. Let's write a script that tries to download, 
# and if it fails, instructions are provided.

SAMPLE_VIDEO_URL = "https://download.samplelib.com/mp4/sample-5s.mp4" # Just a generic sample video
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
VIDEOS_DIR = os.path.join(DATA_DIR, "videos")

def main():
    os.makedirs(VIDEOS_DIR, exist_ok=True)
    
    sample_path = os.path.join(VIDEOS_DIR, "sample_traffic.mp4")
    
    print(f"Downloading sample video from {SAMPLE_VIDEO_URL}...")
    try:
        urllib.request.urlretrieve(SAMPLE_VIDEO_URL, sample_path)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download video: {e}")
        print("Creating a dummy empty file instead. Please replace it with a real traffic video before Phase 04.")
        with open(sample_path, 'wb') as f:
            f.write(b"") # empty file

    # Copy to camera_01 -> 06
    for i in range(1, 7):
        cam_file = f"camera_0{i}.mp4"
        cam_path = os.path.join(VIDEOS_DIR, cam_file)
        print(f"Creating {cam_file}...")
        shutil.copy2(sample_path, cam_path)

    print("Video dataset generation complete.")
    
if __name__ == "__main__":
    main()
