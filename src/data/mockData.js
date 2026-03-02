export const MOCK_DEPARTMENTS = [
    { id: 1, name: "Engineering", headcount: 24, color: "#6366f1", icon: "💻", avg_attendance: 92.0, description: "Software development and infrastructure" },
    { id: 2, name: "Design", headcount: 10, color: "#ec4899", icon: "🎨", avg_attendance: 95.0, description: "UI/UX and brand design" },
    { id: 3, name: "Marketing", headcount: 14, color: "#f59e0b", icon: "📢", avg_attendance: 88.0, description: "Growth, content and campaigns" },
    { id: 4, name: "Sales", headcount: 18, color: "#10b981", icon: "💼", avg_attendance: 91.0, description: "Revenue and client relations" },
    { id: 5, name: "HR", headcount: 8, color: "#3b82f6", icon: "🤝", avg_attendance: 97.0, description: "People operations and culture" },
    { id: 6, name: "Finance", headcount: 9, color: "#8b5cf6", icon: "📊", avg_attendance: 94.0, description: "Accounting and financial planning" },
];

export const MOCK_EMPLOYEES = [
    { id: 1, emp_id: "EMP001", name: "Aarav Sharma", email: "aarav.s@company.com", department_id: 1, role: "Senior Engineer", avatar: "AS", working_days: 22, leaves_taken: 2, total_days: 24, status: "present" },
    { id: 2, emp_id: "EMP002", name: "Priya Patel", email: "priya.p@company.com", department_id: 1, role: "Frontend Developer", avatar: "PP", working_days: 20, leaves_taken: 4, total_days: 24, status: "present" },
    { id: 3, emp_id: "EMP003", name: "Rohan Mehta", email: "rohan.m@company.com", department_id: 1, role: "Backend Developer", avatar: "RM", working_days: 18, leaves_taken: 6, total_days: 24, status: "leave" },
    { id: 4, emp_id: "EMP004", name: "Sana Khan", email: "sana.k@company.com", department_id: 2, role: "UI Designer", avatar: "SK", working_days: 23, leaves_taken: 1, total_days: 24, status: "present" },
    { id: 5, emp_id: "EMP005", name: "Dev Kapoor", email: "dev.k@company.com", department_id: 2, role: "UX Researcher", avatar: "DK", working_days: 21, leaves_taken: 3, total_days: 24, status: "present" },
    { id: 6, emp_id: "EMP006", name: "Nisha Verma", email: "nisha.v@company.com", department_id: 3, role: "Content Strategist", avatar: "NV", working_days: 19, leaves_taken: 5, total_days: 24, status: "present" },
    { id: 7, emp_id: "EMP007", name: "Arjun Singh", email: "arjun.s@company.com", department_id: 3, role: "Performance Marketer", avatar: "AS", working_days: 22, leaves_taken: 2, total_days: 24, status: "leave" },
    { id: 8, emp_id: "EMP008", name: "Kavya Reddy", email: "kavya.r@company.com", department_id: 4, role: "Sales Executive", avatar: "KR", working_days: 23, leaves_taken: 1, total_days: 24, status: "present" },
    { id: 9, emp_id: "EMP009", name: "Manish Gupta", email: "manish.g@company.com", department_id: 4, role: "Account Manager", avatar: "MG", working_days: 17, leaves_taken: 7, total_days: 24, status: "leave" },
    { id: 10, emp_id: "EMP010", name: "Aisha Nair", email: "aisha.n@company.com", department_id: 5, role: "HR Manager", avatar: "AN", working_days: 24, leaves_taken: 0, total_days: 24, status: "present" },
    { id: 11, emp_id: "EMP011", name: "Vikram Joshi", email: "vikram.j@company.com", department_id: 5, role: "Talent Acquisition", avatar: "VJ", working_days: 22, leaves_taken: 2, total_days: 24, status: "present" },
    { id: 12, emp_id: "EMP012", name: "Pooja Das", email: "pooja.d@company.com", department_id: 6, role: "Financial Analyst", avatar: "PD", working_days: 21, leaves_taken: 3, total_days: 24, status: "present" },
    { id: 13, emp_id: "EMP013", name: "Rahul Tiwari", email: "rahul.t@company.com", department_id: 6, role: "Accountant", avatar: "RT", working_days: 20, leaves_taken: 4, total_days: 24, status: "leave" },
    { id: 14, emp_id: "EMP014", name: "Sneha Pillai", email: "sneha.p@company.com", department_id: 1, role: "DevOps Engineer", avatar: "SP", working_days: 23, leaves_taken: 1, total_days: 24, status: "present" },
    { id: 15, emp_id: "EMP015", name: "Amit Saxena", email: "amit.s@company.com", department_id: 2, role: "Motion Designer", avatar: "AS", working_days: 20, leaves_taken: 4, total_days: 24, status: "present" },
];

export let MOCK_ATTENDANCE = {
    '2026-03-03': {
        1: 'present', 2: 'present', 3: 'leave', 4: 'present', 5: 'present', 6: 'present', 7: 'leave', 8: 'present', 9: 'leave', 10: 'present', 11: 'present', 12: 'present', 13: 'leave', 14: 'present', 15: 'present'
    }
};

export const monthlyAttendance = [
    { month: "Aug", present: 88, leave: 12 },
    { month: "Sep", present: 91, leave: 9 },
    { month: "Oct", present: 85, leave: 15 },
    { month: "Nov", present: 93, leave: 7 },
    { month: "Dec", present: 78, leave: 22 },
    { month: "Jan", present: 90, leave: 10 },
    { month: "Feb", present: 92, leave: 8 },
];

export const weeklyTrend = [
    { day: "Mon", Engineering: 95, Design: 90, Marketing: 85, Sales: 92, HR: 100, Finance: 95 },
    { day: "Tue", Engineering: 90, Design: 95, Marketing: 88, Sales: 88, HR: 100, Finance: 90 },
    { day: "Wed", Engineering: 88, Design: 85, Marketing: 92, Sales: 95, HR: 95, "Finance": 88 },
    { day: "Thu", Engineering: 93, Design: 100, "Marketing": 80, "Sales": 90, "HR": 90, "Finance": 95 },
    { day: "Fri", Engineering: 85, Design: 90, Marketing: 88, Sales: 85, HR: 95, "Finance": 90 },
];
