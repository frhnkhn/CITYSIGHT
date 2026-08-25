import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database.connection import SessionLocal
from backend.models.core import Blacklist

def add_to_blacklist():
    print("Adding stolen vehicle to Blacklist...")
    db = SessionLocal()
    
    plate = "PB10AB1234"
    reason = "Stolen Vehicle - Armed and Dangerous"
    
    # Check if already exists
    existing = db.query(Blacklist).filter(Blacklist.plate_number == plate).first()
    if not existing:
        bl = Blacklist(plate_number=plate, reason=reason)
        db.add(bl)
        db.commit()
        print(f"Successfully added {plate} to Blacklist.")
    else:
        print(f"{plate} is already on the Blacklist.")
        
    db.close()

if __name__ == "__main__":
    add_to_blacklist()
