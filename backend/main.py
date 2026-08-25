from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our new API routers
from backend.api import cameras
from backend.api import detections
from backend.api import search
from backend.api import analytics

app = FastAPI(
    title="CITYSIGHT Backend API",
    description="API for AI-Powered City-Wide Vehicle Intelligence & Traffic Analytics Platform",
    version="0.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For prototype, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(detections.router, prefix="/api/detections", tags=["Detections"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CITYSIGHT API"}

if __name__ == "__main__":
    import uvicorn
    # For development, run with `uvicorn main:app --reload`
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
