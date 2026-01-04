import axiosClient from './axiosClient';

const studentApi = {
  getProfile: () => axiosClient.get('/student/profile'),
  getGrades: () => axiosClient.get('/student/grades'),
  getOpenCourses: () => axiosClient.get('/registration/courses'),
  submitRegistration: (data) => axiosClient.post('/registration/submit', data),
  updateProfile: (data) => axiosClient.put('/student/profile', data),
  // Lấy các lớp đã đăng ký (cho Dashboard và trang Courses)
  getMyEnrollments: () => axiosClient.get('/student/enrollments'), 
  registerClass: (classId) => axiosClient.post('/student/enroll', { classId }),
  cancelRegistration: (enrollmentId) => {
    return axiosClient.delete(`/student/enrollments/${enrollmentId}`);
  },
  
  // Lấy thông báo cho sinh viên
  getAnnouncements: () => axiosClient.get('/student/announcements'),
};

export default studentApi;