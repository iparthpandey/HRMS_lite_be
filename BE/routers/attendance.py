from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
import db_models
from database import get_db
from data import departments_data
from models import AttendanceStat, WeeklyTrendDay, DashboardSummary

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Return high-level KPI metrics for the dashboard."""
    total = db.query(db_models.Employee).count()
    present = db.query(db_models.Employee).filter(db_models.Employee.status == "present").count()
    on_leave = total - present
    rate = round(float(present) / total * 100, 1) if total else 0.0
    total_depts = db.query(db_models.Department).count()
    
    return {
        "total_employees": total,
        "present_today": present,
        "on_leave": on_leave,
        "attendance_rate": rate,
        "total_departments": total_depts,
    }


@router.get("/monthly", response_model=List[AttendanceStat])
def get_monthly_attendance():
    """Return monthly present vs leave % for the last 7 months."""
    # Placeholder: In a real app, this would query aggregated historical data
    # For now, returning an empty list or minimal starting data
    return [
        {"month": "Jan", "present": 90, "leave": 10},
        {"month": "Feb", "present": 92, "leave": 8},
        {"month": "Mar", "present": 95, "leave": 5},
    ]


@router.get("/weekly-trend", response_model=List[WeeklyTrendDay])
def get_weekly_trend(db: Session = Depends(get_db)):
    """Return per-department daily attendance % for the current week."""
    # Placeholder: Aggregate real attendance records
    depts = db.query(db_models.Department).all()
    days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    
    trend = []
    for day in days:
        day_stat = {"day": day}
        for d in depts:
            day_stat[d.name] = 100 # Default to 100% until real data is logged
        trend.append(day_stat)
    return trend


@router.get("/department/{department_id}")
def get_department_attendance(department_id: int, db: Session = Depends(get_db)):
    """Return attendance breakdown for all employees in a department."""
    dept = db.query(db_models.Department).filter(db_models.Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    emps = db.query(db_models.Employee).filter(db_models.Employee.department_id == department_id).all()
    
    # Calculate averages
    total_present = 0
    total_leave = 0
    sum_working = 0
    sum_leaves = 0
    
    enriched_emps = []
    for e in emps:
        working = sum(1 for r in e.attendance_records if r.status == "present")
        leaves = sum(1 for r in e.attendance_records if r.status == "leave")
        sum_working += working
        sum_leaves += leaves
        if e.status == "present": total_present += 1
        else: total_leave += 1
        
        enriched_emps.append({
            "id": e.id,
            "emp_id": e.emp_id,
            "name": e.name,
            "email": e.email,
            "role": e.role,
            "avatar": e.avatar,
            "working_days": working,
            "leaves_taken": leaves,
            "total_days": e.total_days,
            "status": e.status
        })

    avg_working = round(sum_working / len(emps), 1) if emps else 0
    avg_leaves = round(sum_leaves / len(emps), 1) if emps else 0

    return {
        "department_id": department_id,
        "total": len(emps),
        "present": total_present,
        "on_leave": total_leave,
        "avg_working_days": avg_working,
        "avg_leaves_taken": avg_leaves,
        "employees": enriched_emps,
    }
