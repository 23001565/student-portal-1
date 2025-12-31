import axiosClient from './axiosClient';

export function uploadCurriculum(formData) {
  return axiosClient.post('/admin/curriculum/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function getCurricula() {
  return axiosClient.get('/admin/curriculum');
}