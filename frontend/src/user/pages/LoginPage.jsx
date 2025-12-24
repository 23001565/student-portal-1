import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      // Simulate API call - trong thực tế sẽ gọi API backend
      const response = await simulateLogin(formData);

      if (response.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);

        // Redirect dựa trên loại user
        if (response.userType === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.message);
      }
    } catch {
      setError("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  // Hàm simulate login - trong thực tế sẽ gọi API
  const simulateLogin = async (data) => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data dựa trên database
    const mockUsers = {
      student: [
        {
          id: 1,
          code: 1001,
          email: "22001497@hus.edu",
          name: "Alice Nguyen",
          password: "123456",
          year: 1,
          majorId: 1,
        },
        {
          id: 2,
          code: 1002,
          email: "22001496@hus.edu",
          name: "Bob Tran",
          password: "123456",
          year: 2,
          majorId: 1,
        },
        {
          id: 3,
          code: 1003,
          email: "22001495@student.edu",
          name: "Carol Le",
          password: "123456",
          year: 1,
          majorId: 2,
        },
      ],
      admin: [
        {
          id: 1,
          email: "23001497@hus.edu",
          username: "admin1",
          password: "123456",
        },
        {
          id: 2,
          email: "23001565@hus.edu",
          username: "admin2",
          password: "1234567",
        },
      ],
    };

    const studentUser = mockUsers.student.find(
      (u) => u.email === data.email && u.password === data.password
    );
    if (studentUser) {
      return {
        success: true,
        userType: "student",
        user: studentUser,
        token: `token_${Date.now()}`,
      };
    }

    const adminUser = mockUsers.admin.find(
      (u) => u.email === data.email && u.password === data.password
    );
    if (adminUser) {
      return {
        success: true,
        userType: "admin",
        user: adminUser,
        token: `token_${Date.now()}`,
      };
    }

    return {
      success: false,
      message: "Email hoặc mật khẩu không đúng",
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="page-frame">
          <div className="page-header">
            <h1 className="page-title text-center">Đăng nhập vào hệ thống</h1>
            <p className="page-subtitle text-center">Nhập email và mật khẩu</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
