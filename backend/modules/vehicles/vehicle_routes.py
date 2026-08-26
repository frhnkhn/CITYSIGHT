from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from .vehicle_service import VehicleLookupService

router = APIRouter()

@router.get("/{registration_number}")
def get_vehicle_intelligence(registration_number: str, db: Session = Depends(get_db)):
    service = VehicleLookupService(db)
    result = service.search_vehicle(registration_number)
    
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result)
        
    return result
