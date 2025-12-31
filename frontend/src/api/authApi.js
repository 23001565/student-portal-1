// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {
  login: (data) => {
    // data gồm { email, password }
    return axiosClient.post('/auth/login', data);
  },
  
  // Nếu sau này có đổi mật khẩu
  changePassword: (data) => {
    return axiosClient.post('/auth/change-password', data);
  }
};

export default authApi;