import json
from typing import Dict, Any
try:
    from confluent_kafka import Producer
except ImportError:
    Producer = None
    print("[KAFKA] Warning: confluent_kafka not installed. Kafka events will be suppressed locally.")

# Kafka connection config
KAFKA_BROKER = "kafka:9092"
TOPIC_NAME = "vehicle-detections"

producer = None

def get_producer():
    global producer
    if producer is None:
        try:
            producer = Producer({'bootstrap.servers': KAFKA_BROKER})
            print("[KAFKA] Connected to broker")
        except Exception as e:
            print(f"[KAFKA] Could not connect to broker: {e}")
    return producer

def publish_detection_event(event: Dict[str, Any]):
    """
    Publishes a structured DetectionEvent to the Kafka event bus.
    This enables highly scalable, asynchronous processing for trajectory building,
    anomaly detection, and real-time visualization nodes.
    """
    p = get_producer()
    if p:
        try:
            # Serialize to JSON and encode to bytes
            payload = json.dumps(event).encode('utf-8')
            # Produce asynchronously
            p.produce(TOPIC_NAME, payload)
            p.poll(0) # Trigger delivery callbacks
        except Exception as e:
            print(f"[KAFKA] Failed to publish event: {e}")
