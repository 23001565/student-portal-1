import axiosClient from './axiosClient';

const adminApi = {
  // --- Dashboard & Thống kê ---
  getDashboardStats: () => axiosClient.get('/admin/stats'),

  // --- Quản lý Sinh viên ---
  getStudentById: (id) => axiosClient.get(`/admin/students/${id}`),
  getAllStudents: () => axiosClient.get('/admin/students'),
  createStudent: (data) => axiosClient.post('/admin/students', data),
  updateStudent: (id, data) => axiosClient.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => axiosClient.delete(`/admin/students/${id}`),
  getReports: (params) => axiosClient.get('/admin/reports', { params }),
  getAcademicProgress: () => axiosClient.get('/admin/progress'),
  deleteEnrollment: (id) => axiosClient.delete(`/admin/enrollments/${id}`),

  // --- Quản lý Môn học (Courses) ---
  getAllCourses: () => axiosClient.get('/admin/courses'),
  createCourse: (data) => axiosClient.post('/admin/courses', data),
  updateCourse: (id, data) => axiosClient.put(`/admin/courses/${id}`, data),

  // --- Quản lý Lớp học phần (Classes) ---
  getAllClasses: () => axiosClient.get('/admin/classes'),
  createClass: (data) => axiosClient.post('/admin/classes', data),
  deleteClass: (id) => axiosClient.delete(`/admin/classes/${id}`),
  
  // --- Thông báo ---
  getAllAnnouncements: () => axiosClient.get('/admin/announcements'),
  createAnnouncement: (data) => axiosClient.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => axiosClient.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => axiosClient.delete(`/admin/announcements/${id}`),
  
  // --- Upload ---
  uploadGrades: (formData) => axiosClient.post('/admin/grades/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadCurriculum: (formData) => axiosClient.post('/admin/curriculum/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // [MỚI] Lấy danh sách SV trong lớp để nhập điểm
  getClassGrades: (classId) => axiosClient.get(`/admin/classes/${classId}/grades`),
  
  // [MỚI] Cập nhật điểm sinh viên
  updateGrade: (data) => axiosClient.put('/admin/grades/update', data),
  // --- QUẢN LÝ ĐỢT ĐĂNG KÝ (MỚI) ---
  
  // 1. Lấy cấu hình thời gian hiện tại
  getRegistrationConfig: () => axiosClient.get('/admin/registration-period'),
  
  // 2. Lưu cấu hình thời gian
  setRegistrationConfig: (data) => axiosClient.post('/admin/registration-period', data),
  
  // 3. Bật/Tắt trạng thái đăng ký của 1 lớp
  toggleClassStatus: (id, isOpen) => axiosClient.put(`/admin/classes/${id}/status`, { isOpen }),
  
  // 4. Lấy danh sách lớp kèm trạng thái đóng/mở (Dùng lại getAllClasses nhưng cần đảm bảo backend trả về isRegistrationOpen)
  getAllClassesConfig: () => axiosClient.get('/admin/classes'), 
  getAllMajors: () => axiosClient.get('/admin/majors'),
  getAllCurriculums: () => axiosClient.get('/admin/curriculums'),
};


export default adminApi;