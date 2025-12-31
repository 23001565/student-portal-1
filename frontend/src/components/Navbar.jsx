import React from "react";
import {
  Navbar as RBNavbar,
  Nav,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi"; // example

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout(); // POST /auth/logout
    } catch (e) {
      console.error("Logout failed", e);
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

        <RBNavbar.Toggle aria-controls="main-navbar" />
        <RBNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
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

            <NavDropdown title="Admin" id="admin-dropdown">
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
              <NavDropdown.Item as={Link} to="/admin/students">
                Manage Students
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/reports">
                Reports
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* RIGHT SIDE */}
          <Nav>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Nav>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
};

export default Navbar;
