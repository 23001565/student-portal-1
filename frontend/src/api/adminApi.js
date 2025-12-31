import axiosClient from './axiosClient';

const adminApi = {
  // --- Dashboard & Thống kê ---
  getDashboardStats: () => axiosClient.get('/admin/stats'),

  // --- Quản lý Sinh viên ---
  getAllStudents: () => axiosClient.get('/admin/students'),
  createStudent: (data) => axiosClient.post('/admin/students', data),
  updateStudent: (id, data) => axiosClient.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => axiosClient.delete(`/admin/students/${id}`),
  getReports: (params) => axiosClient.get('/admin/reports', { params }),
  getAcademicProgress: () => axiosClient.get('/admin/progress'),

  // --- Quản lý Môn học (Courses) ---
  getAllCourses: () => axiosClient.get('/admin/courses'),
  createCourse: (data) => axiosClient.post('/admin/courses', data),
  updateCourse: (id, data) => axiosClient.put(`/admin/courses/${id}`, data),

  // --- Quản lý Lớp học phần (Classes) ---
  getAllClasses: () => axiosClient.get('/admin/classes'),
  createClass: (data) => axiosClient.post('/admin/classes', data),
  
  // --- Thông báo ---
  getAllAnnouncements: () => axiosClient.get('/admin/announcements'),
  createAnnouncement: (data) => axiosClient.post('/admin/announcements', data),
  
  // --- Upload ---
  uploadGrades: (formData) => axiosClient.post('/admin/grades/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadCurriculum: (formData) => axiosClient.post('/admin/curriculum/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default adminApi;