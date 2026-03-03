const API_BASE_URL = 'http://localhost:8000';

export async function fetchEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees/`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
}

export async function fetchDepartments() {
    const response = await fetch(`${API_BASE_URL}/departments/`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    return response.json();
}

export async function fetchEmployeeById(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) throw new Error('Employee not found');
    return response.json();
}

export async function fetchSummary() {
    const response = await fetch(`${API_BASE_URL}/attendance/summary`);
    if (!response.ok) throw new Error('Failed to fetch summary');
    const data = await response.json();
    // Map backend keys to frontend expected keys
    return {
        totalEmployees: data.total_employees,
        totalDepartments: data.total_departments,
        presentToday: data.present_today,
        onLeave: data.on_leave,
        attendanceRate: data.attendance_rate
    };
}

export async function createEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
}

export async function updateAttendance(employeeId, status) {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update attendance');
    return response.json();
}
