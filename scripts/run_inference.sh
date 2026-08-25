#!/bin/bash
set -e

# Change to project root directory
cd "$(dirname "$0")/.."

echo "=================================================="
echo "CITYSIGHT Real AI Inference Runner"
echo "=================================================="

# Ensure data/videos directory exists
mkdir -p data/videos

VIDEO_FILE="data/videos/demo_traffic.mp4"

# Download a sample traffic video if it doesn't exist
if [ ! -f "$VIDEO_FILE" ]; then
    echo "Downloading sample traffic video..."
    # We use a reliable short public traffic video from Github/other CDN for demo purposes
    curl -L -o "$VIDEO_FILE" "https://github.com/intel-iot-devkit/sample-videos/raw/master/car-detection.mp4"
    if [ $? -ne 0 ]; then
        echo "Failed to download video. Please place a traffic video at $VIDEO_FILE manually."
        exit 1
    fi
fi

echo "Video ready at $VIDEO_FILE"

# Ensure dependencies are installed (assuming venv exists)
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Warning: Python virtual environment not found. Ensure dependencies are installed."
fi

# Run the inference pipeline
echo "Starting AI Pipeline on CAM01..."
python3 ai/pipeline.py --video "demo_traffic.mp4" --camera-id CAM01 --max-frames 300

echo "Done!"
