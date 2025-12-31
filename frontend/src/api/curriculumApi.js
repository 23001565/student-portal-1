import axiosClient from './axiosClient';

export function uploadCurriculum(formData) {
  return axiosClient.post('/admin/curriculum/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
// Nếu Backend chưa có route GET curriculum thì hàm này sẽ lỗi 404, cần bổ sung backend sau nếu muốn tính năng này
export function getCurricula() {
  return axiosClient.get('/admin/curriculum'); 
}