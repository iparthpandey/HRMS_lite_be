from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import departments, employees, attendance
import db_models
from database import engine

# Create tables
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Attendance Management API",
    description="Backend API for the Attendance Management System",
    version="1.0.0",
)

# ── CORS ── allow the Vite dev server (and any local origin) to hit this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──
app.include_router(departments.router)
app.include_router(employees.router)
app.include_router(attendance.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Attendance Management API is running 🚀",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok"}
