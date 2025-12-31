import axiosClient from './axiosClient';

export function uploadGrades(formData) {
  return axiosClient.post('/admin/grades/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}