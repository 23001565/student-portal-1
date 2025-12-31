// src/user/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import logoImage from "../../assets/logo.png"; // Import logo
import "./LoginPage.css"; // Import file CSS mới
import authApi from "../../api/authApi";

// --- Các icon SVG đơn giản ---
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

// Hàm giả lập API đăng nhập (Giữ nguyên logic cũ của bạn)
const simulateLogin = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (formData.email.includes("admin")) {
        resolve({
          success: true,
          token: "mock-admin-token-123",
          userType: "admin",
          user: { id: 999, name: "Quản trị viên Hệ thống", email: formData.email, avatarUrl: null },
        });
      } else {
        resolve({
          success: true,
          token: "mock-student-token-456",
          userType: "student",
          user: { id: 1001, name: "Nguyễn Văn An", email: formData.email || "student@hus.edu.vn", avatarUrl: null, code: "SV2024001" },
        });
      }
    }, 1000);
  });
};

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await authApi.login(formData); // Gọi API thật
    // Lưu token và user vào localStorage
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    
    // Điều hướng dựa trên role
    if (res.user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/dashboard');
  } catch (err) {
    setError('Sai email hoặc mật khẩu!');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      {/* --- CỘT TRÁI: BANNER (Chỉ hiện trên Desktop) --- */}
      <div className="login-banner-side">
        <div className="banner-content">
          <img src={logoImage} alt="Student Portal Logo" className="login-logo-large" />
          <h1 className="banner-title">Student Portal</h1>
          <p className="banner-subtitle">
            Nền tảng quản lý đào tạo và học tập trực tuyến hiện đại.
          </p>
        </div>
      </div>

      {/* --- CỘT PHẢI: FORM ĐĂNG NHẬP --- */}
      <div className="login-form-side">
        <div className="login-form-wrapper">
          {/* Logo & Tiêu đề trên Mobile */}
          <div className="mobile-logo-section d-md-none">
             <img src={logoImage} alt="Logo" className="mobile-logo" />
          </div>
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input Custom */}
            <div className="input-group-custom">
              <label htmlFor="email" className="form-label-custom">
                Tài khoản
              </label>
              <div style={{ position: 'relative' }}>
                  <EmailIcon />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    className="form-control-custom"
                    placeholder="ví dụ: sv123@school.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
              </div>
            </div>

            {/* Password Input Custom */}
            <div className="input-group-custom">
              <label htmlFor="password" className="form-label-custom">
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                  <LockIcon />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="form-control-custom"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="login-btn-custom"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;