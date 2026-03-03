from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
import db_models
from database import get_db
from models import Employee as EmployeeSchema, EmployeeCreate, AttendanceUpdate
import datetime

router = APIRouter(prefix="/employees", tags=["Employees"])

def _to_schema(db_emp: db_models.Employee):
    """Convert DB model to JSON schema and calculate dynamic stats."""
    # Recalculate working_days and leaves_taken from attendance_records
    working_days = sum(1 for r in db_emp.attendance_records if r.status == "present")
    leaves_taken = sum(1 for r in db_emp.attendance_records if r.status == "leave")
    
    # Calculate attendance %
    attendance_pct = round(working_days / db_emp.total_days * 100, 1) if db_emp.total_days > 0 else 0.0
    
    return {
        "id": db_emp.id,
        "emp_id": db_emp.emp_id,
        "name": db_emp.name,
        "email": db_emp.email,
        "role": db_emp.role,
        "avatar": db_emp.avatar,
        "department_id": db_emp.department_id,
        "working_days": working_days,
        "leaves_taken": leaves_taken,
        "total_days": db_emp.total_days,
        "status": db_emp.status,
        "attendance_pct": attendance_pct,
        "department_name": db_emp.department.name if db_emp.department else "Unknown"
    }

@router.get("/", response_model=List[EmployeeSchema])
def get_employees(
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Return all employees with their current status."""
    query = db.query(db_models.Employee)
    if department_id:
        query = query.filter(db_models.Employee.department_id == department_id)
    if status:
        query = query.filter(db_models.Employee.status == status)
    if search:
        q = f"%{search.lower()}%"
        query = query.filter(
            (db_models.Employee.name.ilike(q)) | (db_models.Employee.role.ilike(q))
        )
    
    emps = query.all()
    return [_to_schema(e) for e in emps]

@router.get("/{employee_id}", response_model=EmployeeSchema)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Return a single employee's details."""
    emp = db.query(db_models.Employee).filter(db_models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _to_schema(emp)

@router.post("/{employee_id}/attendance")
def update_attendance(employee_id: int, update: AttendanceUpdate, db: Session = Depends(get_db)):
    """Mark an employee as present or on leave for a specific date (defaults to today)."""
    emp = db.query(db_models.Employee).filter(db_models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Parse date or use today
    target_date = datetime.date.today()
    if update.date:
        try:
            target_date = datetime.datetime.strptime(update.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Check for existing record on this date
    record = db.query(db_models.AttendanceRecord).filter(
        db_models.AttendanceRecord.employee_id == employee_id,
        db_models.AttendanceRecord.date == target_date
    ).first()

    if record:
        record.status = update.status
    else:
        record = db_models.AttendanceRecord(
            employee_id=employee_id,
            date=target_date,
            status=update.status
        )
        db.add(record)
    
    # Also update the general status for today's display
    if target_date == datetime.date.today():
        emp.status = update.status

    db.commit()
    db.refresh(emp)
    return _to_schema(emp)

@router.post("/", response_model=EmployeeSchema)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee."""
    # Generate initials for avatar
    avatar = "".join([n[0] for n in emp_in.name.split()[:2]]).upper()
    
    new_db_emp = db_models.Employee(
        name=emp_in.name,
        role=emp_in.role,
        department_id=emp_in.department_id,
        avatar=avatar,
        status="present"
    )
    db.add(new_db_emp)
    db.commit()
    db.refresh(new_db_emp)
    return _to_schema(new_db_emp)
