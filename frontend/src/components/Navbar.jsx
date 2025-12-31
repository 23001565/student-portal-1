import React from "react";
import {
  Navbar as RBNavbar,
  Nav,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/auth.js"; 
import { useAuth } from "../context/authContext";

const Navbar = () => {
  const { user } = useAuth(); //  role
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <RBNavbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <RBNavbar.Brand as={Link} to="/dashboard">
          Student Portal
        </RBNavbar.Brand>

        <RBNavbar.Toggle />
        <RBNavbar.Collapse>
          <Nav className="me-auto">

            {/* STUDENT LINKS */}
            <Nav.Link as={Link} to="/dashboard" active={isActive("/dashboard")}>
              Dashboard
            </Nav.Link>

            {user?.role === "student" && (
              <>
                <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                <Nav.Link as={Link} to="/grades">Grades</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              </>
            )}

            {/* ADMIN LINKS */}
            {user?.role === "admin" && (
              <NavDropdown title="Admin">
                <NavDropdown.Item as={Link} to="/admin/dashboard">
                  Dashboard
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/courses">
                  Manage Courses
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/classes">
                  Manage Classes
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/curricula">
                  Manage Curricula
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/announcements">
                  Manage Announcement
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/students">
                  Manage Students
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/reports">
                  Reports
                </NavDropdown.Item>
              </NavDropdown>
            )}

          </Nav>

          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
};

export default Navbar;