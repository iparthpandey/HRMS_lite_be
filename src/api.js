import { MOCK_EMPLOYEES, MOCK_DEPARTMENTS, MOCK_ATTENDANCE, monthlyAttendance, weeklyTrend } from './data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Default to true unless explicitly set to 'false'
const USE_MOCK = localStorage.getItem('USE_MOCK_DATA') !== 'false';

// Helper to initialize localStorage with mock data if not already present
const initStorage = () => {
    if (!localStorage.getItem('employees')) {
        localStorage.setItem('employees', JSON.stringify(MOCK_EMPLOYEES));
    }
    if (!localStorage.getItem('departments')) {
        localStorage.setItem('departments', JSON.stringify(MOCK_DEPARTMENTS));
    }
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify(MOCK_ATTENDANCE));
    }
    if (!localStorage.getItem('monthlyAttendance')) {
        localStorage.setItem('monthlyAttendance', JSON.stringify(monthlyAttendance));
    }
    if (!localStorage.getItem('weeklyTrend')) {
        localStorage.setItem('weeklyTrend', JSON.stringify(weeklyTrend));
    }
};

if (USE_MOCK) initStorage();

const getStoredEmployees = () => JSON.parse(localStorage.getItem('employees') || '[]');
const getStoredDepartments = () => JSON.parse(localStorage.getItem('departments') || '[]');
const getStoredAttendance = () => JSON.parse(localStorage.getItem('attendance') || '{}');

export async function fetchEmployees() {
    if (USE_MOCK) return getStoredEmployees();
    const response = await fetch(`${API_BASE_URL}/employees/`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
}

export async function fetchDepartments() {
    if (USE_MOCK) return getStoredDepartments();
    const response = await fetch(`${API_BASE_URL}/departments/`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    return response.json();
}

export async function fetchEmployeeById(id) {
    if (USE_MOCK) {
        const emps = getStoredEmployees();
        return emps.find(e => e.id === parseInt(id));
    }
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) throw new Error('Failed to fetch employee details');
    return response.json();
}

export async function fetchSummary() {
    if (USE_MOCK) {
        const emps = getStoredEmployees();
        const depts = getStoredDepartments();
        return {
            totalEmployees: emps.length,
            totalDepartments: depts.length,
            presentToday: emps.filter(e => e.status === 'present').length,
            onLeave: emps.filter(e => e.status === 'leave').length
        };
    }
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
    if (USE_MOCK) {
        const emps = getStoredEmployees();
        const nextId = emps.length > 0 ? Math.max(...emps.map(e => e.id)) + 1 : 1;
        const newEmp = {
            ...employeeData,
            id: nextId,
            working_days: 0,
            leaves_taken: 0,
            total_days: 20,
            avatar: employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        };
        const updated = [...emps, newEmp];
        localStorage.setItem('employees', JSON.stringify(updated));
        return newEmp;
    }
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
    if (USE_MOCK) {
        const emps = getStoredEmployees();
        const updated = emps.filter(e => e.id !== parseInt(id));
        localStorage.setItem('employees', JSON.stringify(updated));
        return { message: 'Employee deleted' };
    }
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete employee');
    }
    return response.json();
}

export async function updateAttendance(employeeId, status, date) {
    if (USE_MOCK) {
        const attendance = getStoredAttendance();
        const emps = getStoredEmployees();
        const targetDate = date || new Date().toISOString().split('T')[0];

        if (!attendance[targetDate]) {
            attendance[targetDate] = {};
        }

        const oldStatus = attendance[targetDate][employeeId];

        // Only update if status actually changed
        if (oldStatus !== status) {
            attendance[targetDate][employeeId] = status;
            localStorage.setItem('attendance', JSON.stringify(attendance));

            const empIndex = emps.findIndex(e => e.id === parseInt(employeeId));
            if (empIndex !== -1) {
                const emp = emps[empIndex];

                // Update working_days based on transition
                if (status === 'present' && (oldStatus === 'leave' || !oldStatus)) {
                    emp.working_days = Math.min(emp.total_days, emp.working_days + 1);
                } else if (status === 'leave' && oldStatus === 'present') {
                    emp.working_days = Math.max(0, emp.working_days - 1);
                }

                // Also update the employee's main status if it's "today"
                const today = new Date().toISOString().split('T')[0];
                if (targetDate === today) {
                    emp.status = status;
                }

                localStorage.setItem('employees', JSON.stringify(emps));
            }
        }
        return { message: 'Attendance updated' };
    }
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, date }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update attendance');
    }
    return response.json();
}

/**
 * Fetches attendance status for all employees on a specific date
 */
export async function fetchAttendanceByDate(date) {
    if (USE_MOCK) {
        const attendance = getStoredAttendance();
        return attendance[date] || {};
    }
    const response = await fetch(`${API_BASE_URL}/attendance/?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch attendance for date');
    return response.json();
}
