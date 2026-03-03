from pydantic import BaseModel, EmailStr
from typing import List, Optional


class Department(BaseModel):
    id: int
    name: str
    headcount: int
    color: str
    icon: str
    avg_attendance: float
    description: str


class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department_id: int
    emp_id: str


class EmployeeCreate(EmployeeBase):
    status: str = "present"


class Employee(EmployeeBase):
    id: int
    avatar: str
    working_days: int
    leaves_taken: int
    total_days: int
    status: str
    attendance_pct: float
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


class AttendanceUpdate(BaseModel):
    status: str  # "present" | "leave"
    date: Optional[str] = None # format YYYY-MM-DD


class AttendanceStat(BaseModel):
    month: str
    present: float
    leave: float


class WeeklyTrendDay(BaseModel):
    day: str
    model_config = {"extra": "allow"} # Allow department names as dynamic keys
    Design: float
    Marketing: float
    Sales: float
    HR: float
    Finance: float


class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    on_leave: int
    attendance_rate: float
    total_departments: int
