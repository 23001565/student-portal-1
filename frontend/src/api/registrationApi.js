import axiosClient from './axiosClient';

export function getOpenCourses(params = {}) {
  return axiosClient.get('/registration/courses', { params });
}

export function submitRegistration(payload) {
  return axiosClient.post('/registration/submit', payload);
}