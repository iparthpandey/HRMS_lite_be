from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    headcount = Column(Integer, default=0)
    color = Column(String)
    icon = Column(String)
    avg_attendance = Column(Float, default=0.0)
    description = Column(String)

    employees = relationship("Employee", back_populates="department")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String, unique=True, index=True) # Unique Business ID
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    avatar = Column(String)
    department_id = Column(Integer, ForeignKey("departments.id"))
    total_days = Column(Integer, default=24)
    status = Column(String, default="present")

    department = relationship("Department", back_populates="employees")
    attendance_records = relationship("AttendanceRecord", back_populates="employee", cascade="all, delete-orphan")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, default=datetime.date.today)
    status = Column(String) # "present" or "leave"

    employee = relationship("Employee", back_populates="attendance_records")

    __table_args__ = (UniqueConstraint('employee_id', 'date', name='_employee_date_uc'),)
