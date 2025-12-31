import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/authContext";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData); // AuthContext handles everything

      navigate(
        formData.role === "admin"
          ? "/admin/dashboard"
          : "/dashboard"
      );
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <p>You are already logged in</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="page-frame">
          <div className="page-header">
            <h1 className="page-title text-center">Đăng nhập vào hệ thống</h1>
            <p className="page-subtitle text-center"> Chọn loại tài khoản để đăng nhập </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div className="form-group">
              <label className="form-label">Loại tài khoản</label>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }} >
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", }} >
                  <input type="radio" name="role" value="student" checked={formData.role === "student"} onChange={handleChange} style={{ marginRight: "0.5rem" }} /> Sinh viên
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", }} >
                  <input type="radio" name="role" value="admin" checked={formData.role === "admin"} onChange={handleChange} style={{ marginRight: "0.5rem" }} /> Quản trị viên
                </label>
              </div>
            </div>
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label"> Email </label>
              <input id="email" name="email" type="email" required className="form-control" placeholder="Email" value={formData.email} onChange={handleChange} />
            </div>
            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label"> Mật khẩu </label>
              <input id="password" name="password" type="password" required className="form-control" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} />
            </div>
            {/* Error Message */}
            {error && (
              <div className="text-center" style={{ color: "var(--danger-color)", fontSize: "0.875rem" }} >
                {error}
              </div>
            )}
            {/* Submit Button */}
            <div>
              <Button type="submit" disabled={loading} loading={loading} className="btn-block">
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
