from database import SessionLocal, engine
import db_models
from data import employees_data, departments_data
import datetime

def seed_db():
    db_models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(db_models.Department).first():
        db.close()
        return

    print("Seeding database...")
    
    # Seed Departments
    for d in departments_data:
        dept = db_models.Department(
            id=d["id"],
            name=d["name"],
            headcount=d["headcount"],
            color=d["color"],
            icon=d["icon"],
            avg_attendance=d["avg_attendance"],
            description=d["description"]
        )
        db.add(dept)
    db.commit()

    # Seed Employees
    for e in employees_data:
        emp = db_models.Employee(
            id=e["id"],
            emp_id=e["emp_id"],
            name=e["name"],
            email=e["email"],
            role=e["role"],
            avatar=e["avatar"],
            department_id=e["department_id"],
            total_days=e["total_days"],
            status=e["status"]
        )
        db.add(emp)
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
