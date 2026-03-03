# HRMS - Human Resource Management System

A modern, production-ready Attendance Management System built with **React** (Vite) and **FastAPI**.

## 🚀 Features

- **Personalized Dashboard**: Real-time KPIs for attendance rates and headcounts.
- **Department Management**: Detailed breakdown of attendance by department.
- **Employee Tracking**: Individual profiles with attendance history and stats.
- **Interactive Charts**: Responsive data visualization using Recharts.
- **Modern UI**: Dark-themed, premium interface built with Vanilla CSS variables.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Lucide React (Icons), Recharts.
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy (ORM).
- **Database**: SQLite (Default/Dev), PostgreSQL (Production-ready).

## ⚙️ Project Structure

```text
├── BE/               # FastAPI Backend
│   ├── routers/      # API Endpoints (Employees, Attendance, Departments)
│   ├── database.py   # DB Connection
│   ├── db_models.py  # SQLAlchemy Models
│   ├── models.py     # Pydantic Schemas
│   └── seed.py       # DB Initialization Script
├── FE/               # React Frontend
│   ├── src/
│   │   ├── api.js    # Centralized API service
│   │   ├── components/
│   │   ├── pages/
│   │   └── index.css # Global Design System
└── README.md
```

## 🚥 Local Setup

### Backend (BE)
1. Navigate to the BE folder: `cd BE`
2. Install dependencies: `pip install fastapi uvicorn sqlalchemy`
3. Run the seeding script: `python seed.py`
4. Start the server: `uvicorn main:app --reload`

### Frontend (FE)
1. Navigate to the FE folder: `cd FE`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## 📄 License
MIT
