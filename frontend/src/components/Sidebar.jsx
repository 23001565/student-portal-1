import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

// Icon components
const Icon = ({ children, className = "" }) => (
  <span className={`sidebar-menu-icon ${className}`}>{children}</span>
);

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Menu items configuration
  const menuItems = [
    {
      section: "MENU",
      items: [
        {
          path: "/dashboard",
          label: "Tổng quan",
          icon: "📊",
          exact: true,
        },
        {
          path: "/admin/students",
          label: "Học sinh",
          icon: "👥",
        },
        {
          path: "/admin/courses",
          label: "Lớp học",
          icon: "📚",
        },
        {
          path: "/grades",
          label: "Điểm số",
          icon: "🎓",
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
      section: "HỆ THỐNG",
      items: [
        {
          path: "/admin/upload-grades",
          label: "Tải điểm",
          icon: "📤",
        },
        {
          path: "/admin/upload-curriculum",
          label: "Tải chương trình",
          icon: "📋",
        },
        {
          path: "/admin/progress-monitor",
          label: "Theo dõi tiến độ",
          icon: "📊",
        },
        {
          path: "/profile",
          label: "Cài đặt",
          icon: "⚙️",
        },
      ],
    },
  ];

  // Student menu items (non-admin)
  const studentMenuItems = [
    {
      section: "MENU",
      items: [
        {
          path: "/dashboard",
          label: "Tổng quan",
          icon: "📊",
          exact: true,
        },
        {
          path: "/courses",
          label: "Khóa học",
          icon: "📚",
        },
        {
          path: "/grades",
          label: "Điểm số",
          icon: "🎓",
        },
        {
          path: "/registration",
          label: "Đăng ký môn học",
          icon: "📝",
        },
      ],
    },
    {
      section: "HỆ THỐNG",
      items: [
        {
          path: "/profile",
          label: "Hồ sơ",
          icon: "👤",
        },
        {
          path: "/profile",
          label: "Cài đặt",
          icon: "⚙️",
        },
      ],
    },
  ];

  // Check if user is admin
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin =
    user?.role === "admin" || location.pathname.startsWith("/admin");

  const itemsToShow = isAdmin ? menuItems : studentMenuItems;

  return (
    <div className={`sidebar-menu ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🎓</div>
        {!isCollapsed && (
          <div className="sidebar-title">
            <h3>StudentManager</h3>
            <span>Phiên bản Pro 2.0</span>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Menu Sections */}
      {itemsToShow.map((section, sectionIndex) => (
        <div key={sectionIndex} className="sidebar-section">
          {!isCollapsed && (
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
