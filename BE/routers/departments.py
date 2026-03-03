from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
import db_models
from database import get_db
from models import Department

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("/", response_model=List[Department])
def get_all_departments(db: Session = Depends(get_db)):
    """Return all departments."""
    return db.query(db_models.Department).all()


@router.get("/{department_id}", response_model=Department)
def get_department(department_id: int, db: Session = Depends(get_db)):
    """Return a single department by ID."""
    dept = db.query(db_models.Department).filter(db_models.Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept
