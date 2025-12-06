import React from "react";
import {
  Navbar as RBNavbar,
  Nav,
  Container,
  NavDropdown,
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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
              <NavDropdown.Item as={Link} to="/admin/students">
                Manage Students
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/reports">
                Reports
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
};

export default Navbar;
