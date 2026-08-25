import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    # We might not have a dedicated health check, but we can test the root docs or a known endpoint
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_vehicles_processed" in data
    assert "vehicle_type_distribution" in data

def test_heatmap_api():
    response = client.get("/api/analytics/heatmap")
    assert response.status_code == 200
    data = response.json()
    # It should be a dictionary of hours -> lists
    assert isinstance(data, dict)

def test_od_matrix_api():
    response = client.get("/api/analytics/od-matrix")
    assert response.status_code == 200
    data = response.json()
    assert "matrix" in data

def test_recent_alerts_api():
    response = client.get("/api/analytics/alerts/recent")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_search_not_found():
    response = client.get("/api/search/XYZ9999999")
    assert response.status_code == 404
