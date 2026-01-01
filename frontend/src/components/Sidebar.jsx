import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logoImage from "../assets/logo.png";
// Icon components giữ nguyên style cũ
const Icon = ({ children, className = "" }) => (
  <span className={`sidebar-menu-icon ${className}`}>{children}</span>
);

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Lấy thông tin user và role từ localStorage khi sidebar load
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Logic xác định menu active
  const isActive = (path) => {
    if (path === "/dashboard" || path === "/admin/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Xác định quyền Admin (dựa trên field 'role' hoặc 'userType' được lưu lúc login)
  const isAdmin = user?.role === "admin" || user?.userType === "admin";

  // --- MENU CẤU HÌNH CHO ADMIN ---
  const adminMenuItems = [
    {
      section: "QUẢN TRỊ",
      items: [
        {
          path: "/admin/dashboard",
          label: "Tổng quan",
          icon: "📊",
          exact: true,
        },
        {
          path: "/admin/students",
          label: "Quản lý Học sinh",
          icon: "👥",
        },
        {
          path: "/admin/courses",
          label: "Quản lý Lớp học",
          icon: "📚",
        },
        {
          path: "/admin/registration-control",
          label: "Quản lý Đợt Đăng ký",
          icon: "🗓️", 
        },
        {
          path: "/admin/announcements",
          label: "Thông báo",
          icon: "📢",
        },
        {
          path: "/admin/reports",
          label: "Báo cáo",
          icon: "📈",
        },
      ],
    },
    {
      section: "HỌC VỤ",
      items: [
        {
          path: "/admin/upload-grades",
          label: "Nhập điểm",
          icon: "📝",
        },
        {
          path: "/admin/upload-curriculum",
          label: "CT Đào tạo",
          icon: "🎓",
        },
        {
          path: "/admin/progress-monitor",
          label: "Tiến độ học tập",
          icon: "👁️",
        },
      ],
    },
  ];

  // --- MENU CẤU HÌNH CHO SINH VIÊN ---
  const studentMenuItems = [
    {
      section: "SINH VIÊN",
      items: [
        {
          path: "/dashboard", // Link về User Dashboard
          label: "Tổng quan",
          icon: "📊",
          exact: true,
        },
        {
          path: "/courses",
          label: "Lớp học phần",
          icon: "📚",
        },
        {
          path: "/registration",
          label: "Đăng ký môn",
          icon: "✍️",
        },
        {
          path: "/grades",
          label: "Kết quả học tập",
          icon: "📝",
        },
        {
          path: "/profile",
          label: "Hồ sơ cá nhân",
          icon: "👤",
        },
      ],
    },
  ];

  // Chọn menu hiển thị dựa trên quyền
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <div className={`sidebar-menu ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {/* --- SỬA ĐOẠN NÀY --- */}
          {/* Thay vì hiển thị chữ SP nên nền màu, ta hiển thị thẻ img */}
          <div className="sidebar-logo">
             <img src={logoImage} alt="Logo" />
          </div>
          {/* ------------------- */}

          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <span>Student</span>
              <span className="text-primary">Portal</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* User Info (Hiển thị avatar nhỏ) */}
      {!isCollapsed && user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">
              {isAdmin ? "Administrator" : "Student"}
            </div>
          </div>
        </div>
      )}

      {/* Menu Lists */}
      {menuItems.map((section, idx) => (
        <div key={idx} className="sidebar-section">
          {!isCollapsed && section.section && (
            <div className="sidebar-section-title">{section.section}</div>
          )}
          <ul className="sidebar-menu-list">
            {section.items.map((item) => {
              const active = item.exact
                ? location.pathname === item.path
                : isActive(item.path);

              return (
                <li key={item.path} className="sidebar-menu-item">
                  <Link
                    to={item.path}
                    className={`sidebar-menu-link ${active ? "active" : ""}`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon>{item.icon}</Icon>
                    {!isCollapsed && (
                      <span className="sidebar-menu-text">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Logout */}
      <div className="sidebar-logout">
        <button
          onClick={handleLogout}
          className="sidebar-logout-link"
          title={isCollapsed ? "Đăng xuất" : ""}
          style={{
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <Icon className="sidebar-logout-icon">🚪</Icon>
          {!isCollapsed && <span className="sidebar-menu-text">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;