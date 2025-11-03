import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

// Simple vertical sidebar nav
// use within a grid column, e.g., <Col md={3}><Sidebar /></Col>
const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="p-3 border rounded shadow-sm bg-white">
      <h6 className="text-uppercase text-muted mb-3">Navigation</h6>
      <Nav className="flex-column">
        <Nav.Link as={Link} to="/dashboard" active={isActive("/dashboard")}>
          Dashboard
        </Nav.Link>
        <Nav.Link as={Link} to="/courses" active={isActive("/courses")}>
          Courses
        </Nav.Link>
        <Nav.Link as={Link} to="/grades" active={isActive("/grades")}>
          Grades
        </Nav.Link>
        <Nav.Link as={Link} to="/profile" active={isActive("/profile")}>
          Profile
        </Nav.Link>

        <div className="mt-3 small text-uppercase text-muted">Admin</div>
        <Nav.Link
          as={Link}
          to="/admin/dashboard"
          active={isActive("/admin/dashboard")}
        >
          Admin Dashboard
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/admin/courses"
          active={isActive("/admin/courses")}
        >
          Manage Courses
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/admin/students"
          active={isActive("/admin/students")}
        >
          Manage Students
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/admin/reports"
          active={isActive("/admin/reports")}
        >
          Reports
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
