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
    if (!response.ok) throw new Error('Failed to fetch employee details');
    return response.json();
}

export async function fetchSummary() {
    // Assuming backend has a summary endpoint or we calculate from data
    const [employees, departments] = await Promise.all([
        fetchEmployees(),
        fetchDepartments()
    ]);
    return {
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        presentToday: employees.filter(e => e.status === 'present').length,
        onLeave: employees.filter(e => e.status === 'leave').length
    };
}

export async function createEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create employee');
    }
    return response.json();
}

export async function deleteEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete employee');
    }
    return response.json();
}

export async function updateAttendance(employeeId, status) {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update attendance');
    }
    return response.json();
}
