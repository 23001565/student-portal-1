import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api, { login as apiLogin } from "../services/api";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "student", // 'student' hoặc 'admin'
  });
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
    setError("");

    try {
      const resp = await apiLogin(formData.email, formData.password, formData.userType);
      // resp expected: { token, user }
      localStorage.setItem("token", resp.token);
      localStorage.setItem("user", JSON.stringify(resp.user));

      if (formData.userType === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="page-frame">
          <div className="page-header">
            <h1 className="page-title text-center">Đăng nhập vào hệ thống</h1>
            <p className="page-subtitle text-center">
              Chọn loại tài khoản để đăng nhập
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div className="form-group">
              <label className="form-label">Loại tài khoản</label>
              <div
                style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={formData.userType === "student"}
                    onChange={handleChange}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Sinh viên
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={formData.userType === "admin"}
                    onChange={handleChange}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Quản trị viên
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-control"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-control"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="text-center"
                style={{ color: "var(--danger-color)", fontSize: "0.875rem" }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="btn-block"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </div>

            {/* Demo Credentials */}
            <div
              className="card"
              style={{ marginTop: "1.5rem", background: "var(--bg-secondary)" }}
            >
              <div
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                  Tài khoản demo:
                </p>
                <p>
                  <strong>Sinh viên:</strong> 22001497@hus.edu / 123456
                </p>
                <p>
                  <strong>Admin:</strong> 23001497@hus.edu / 123456
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
