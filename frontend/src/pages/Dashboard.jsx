import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../components/PageFrame";
import Button from "../components/Button";
import Layout from "../components/Layout";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls
      await Promise.all([loadAnnouncements(), loadEnrollments()]);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    // Mock data dựa trên database
    const mockAnnouncements = [
      {
        id: 1,
        title: "Học kỳ 1 bắt đầu!",
        content:
          "Học kỳ 1 bắt đầu vào ngày 1 tháng 3 năm 2025. Vui lòng kiểm tra lịch học của bạn.",
        postedAt: "2025-10-23 09:25:51",
      },
      {
        id: 2,
        title: "Lịch thi đã được công bố",
        content: "Lịch thi đã được công bố trên hệ thống.",
        postedAt: "2025-10-23 09:25:51",
      },
    ];
    setAnnouncements(mockAnnouncements);
  };

  const loadEnrollments = async () => {
    // Mock data dựa trên database
    const mockEnrollments = [
      {
        id: 1,
        classCode: "CS101-1",
        courseName: "Lập trình cơ bản",
        credits: 3,
        semester: 1,
        year: 2025,
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        location: "A101",
        status: "active",
      },
      {
        id: 2,
        classCode: "CS201-1",
        courseName: "Cấu trúc dữ liệu",
        credits: 3,
        semester: 1,
        year: 2025,
        dayOfWeek: 3,
        startPeriod: 2,
        endPeriod: 4,
        location: "A102",
        status: "active",
      },
    ];
    setEnrollments(mockEnrollments);
  };

  const getDayName = (dayOfWeek) => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[dayOfWeek] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <PageFrame
        title="Dashboard"
        subtitle={`Chào mừng, ${user?.name || ""}`}
        headerActions={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              MSSV: {user?.code}
            </span>
          </div>
        }
      >
        <div className="grid grid-2 lg:grid-3 gap-6">
          {/* Thông báo */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">Thông báo mới</div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      style={{
                        borderLeft: "4px solid var(--primary-color)",
                        paddingLeft: "1rem",
                        transition: "var(--transition)",
                      }}
                      className="fade-in"
                    >
                      <h3
                        className="font-medium"
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {announcement.title}
                      </h3>
                      <p
                        className="text-sm"
                        style={{
                          color: "var(--text-secondary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {announcement.content}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {new Date(announcement.postedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p
                      className="text-center"
                      style={{ color: "var(--text-tertiary)", padding: "2rem" }}
                    >
                      Không có thông báo mới
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="card-header">Thông tin cá nhân</div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Họ tên:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user?.name}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      MSSV:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user?.code}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Email:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Năm học:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Năm {user?.year}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="card">
              <div className="card-header">Thống kê</div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--border-radius-sm)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Số môn đã đăng ký:
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        color: "var(--primary-color)",
                        fontSize: "1.25rem",
                      }}
                    >
                      {enrollments.length}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--border-radius-sm)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Tổng số tín chỉ:
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        color: "var(--secondary-color)",
                        fontSize: "1.25rem",
                      }}
                    >
                      {enrollments.reduce(
                        (total, enrollment) => total + enrollment.credits,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách môn học đã đăng ký */}
        <div className="mt-6">
          <div className="card">
            <div className="card-header">Môn học đã đăng ký</div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã lớp</th>
                    <th>Tên môn học</th>
                    <th>Tín chỉ</th>
                    <th>Thời gian</th>
                    <th>Phòng học</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="font-medium">{enrollment.classCode}</td>
                      <td>{enrollment.courseName}</td>
                      <td>{enrollment.credits}</td>
                      <td>
                        {getDayName(enrollment.dayOfWeek)} - Tiết{" "}
                        {enrollment.startPeriod}-{enrollment.endPeriod}
                      </td>
                      <td>{enrollment.location}</td>
                      <td>
                        <span
                          className={`badge ${
                            enrollment.status === "Đang học"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {enrollment.status === "Đang học"
                            ? "Đang học"
                            : "Đã hủy"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {enrollments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Chưa có môn học nào được đăng ký
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageFrame>
    </Layout>
  );
};

export default Dashboard;
