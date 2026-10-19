import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API Methods
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const tenantAPI = {
  getAll: () => api.get('/tenants'),
  getById: (id: string) => api.get(`/tenants/${id}`),
  create: (data: any) => api.post('/tenants', data),
};

export const dashboardAPI = {
  getTeacherDashboard: (sessionId: string) => api.get(`/dashboard/teacher/session/${sessionId}`),
  getSchoolAdminDashboard: (academicYearId?: string) => api.get('/dashboard/school-admin', { params: { academicYearId } }),
  getPrincipalDashboard: (academicYearId?: string) => api.get('/dashboard/principal', { params: { academicYearId } }),
  getStudentHistory: (studentId: string, academicYearId?: string, dateFrom?: string, dateTo?: string) => 
    api.get(`/dashboard/student/${studentId}/history`, { params: { academicYearId, dateFrom, dateTo } }),
  exportCSV: (sessionId: string) => api.get(`/dashboard/export/${sessionId}/csv`, { responseType: 'blob' }),
};

export const attendanceAPI = {
  createSession: (data: any) => api.post('/attendance/sessions', data),
  getSessions: () => api.get('/attendance/sessions'),
  getSessionById: (id: string) => api.get(`/attendance/sessions/${id}`),
  getSessionsByTeacher: (teacherId: string) => api.get(`/attendance/sessions/teacher/${teacherId}`),
  createRecord: (data: any) => api.post('/attendance/records', data),
};

export const checkpointAPI = {
  createCheckpoints: (sessionId: string) => api.post(`/checkpoint-attendance/checkpoints/session/${sessionId}/create`),
  completeCheckpoint: (data: any) => api.post('/checkpoint-attendance/checkpoints/complete', data),
  calculateAttendance: (sessionId: string) => api.post(`/checkpoint-attendance/preliminary-attendance/session/${sessionId}/calculate`),
  getPreliminaryAttendance: (sessionId: string) => api.get(`/checkpoint-attendance/preliminary-attendance/session/${sessionId}`),
};

export const teacherReviewAPI = {
  acceptAttendance: (data: any) => api.post('/teacher-review/accept', data),
  overrideAttendance: (data: any) => api.post('/teacher-review/override', data),
  confirmSession: (data: any) => api.post('/teacher-review/confirm-session', data),
  getAuditTrail: (sessionId: string) => api.get(`/teacher-review/audit/session/${sessionId}`),
  getReviewDashboard: (sessionId: string) => api.get(`/teacher-review/dashboard/session/${sessionId}`),
};
