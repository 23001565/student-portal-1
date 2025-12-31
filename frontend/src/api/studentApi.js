// src/api/studentApi.js
import axiosClient from './axiosClient';

const studentApi = {
  // Lấy thông tin cá nhân (ProfilePage)
  getProfile: () => {
    return axiosClient.get('/student/profile');
  },

  // Lấy bảng điểm cá nhân (GradesPage)
  getGrades: () => {
    return axiosClient.get('/student/grades');
  },

  // Lấy danh sách lớp đang học (Dashboard sinh viên)
  getMyEnrollments: () => {
    return axiosClient.get('/student/enrollments');
  },
  
  // Lấy thông báo dành cho sinh viên
  getAnnouncements: () => {
    return axiosClient.get('/student/announcements');
  }
};

export default studentApi;