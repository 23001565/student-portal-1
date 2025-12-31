// src/api/adminApi.js
import axiosClient from './axiosClient';

const adminApi = {
  // --- DASHBOARD ---
  getDashboardStats: () => {
    return axiosClient.get('/admin/stats');
  },

  // --- QUẢN LÝ SINH VIÊN (ManageStudents.jsx) ---
  getAllStudents: (params) => {
    // params có thể là { search: '...', page: 1 }
    return axiosClient.get('/admin/students', { params });
  },
  getStudentById: (id) => {
    return axiosClient.get(`/admin/students/${id}`);
  },
  createStudent: (data) => {
    return axiosClient.post('/admin/students', data);
  },
  updateStudent: (id, data) => {
    return axiosClient.put(`/admin/students/${id}`, data);
  },
  deleteStudent: (id) => {
    return axiosClient.delete(`/admin/students/${id}`);
  },

  // --- QUẢN LÝ MÔN HỌC (ManageCourses.jsx) ---
  getAllCourses: () => {
    return axiosClient.get('/admin/courses');
  },
  createCourse: (data) => {
    return axiosClient.post('/admin/courses', data);
  },
  updateCourse: (id, data) => {
    return axiosClient.put(`/admin/courses/${id}`, data);
  },
  
  // --- QUẢN LÝ LỚP HỌC PHẦN (Classes) ---
  getAllClasses: () => {
    return axiosClient.get('/admin/classes');
  },
  createClass: (data) => {
    return axiosClient.post('/admin/classes', data);
  },
  
  // --- THÔNG BÁO (Announcements.jsx) ---
  getAllAnnouncements: () => {
    return axiosClient.get('/admin/announcements');
  },
  createAnnouncement: (data) => {
    return axiosClient.post('/admin/announcements', data);
  }
};

export default adminApi;