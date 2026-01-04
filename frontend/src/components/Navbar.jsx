import React from "react";
import {
  Navbar as RBNavbar,
  Nav,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Navbar = () => {
  const { user, logout } = useAuth(); //  role
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    console.log("Starting logout process");
    await logout();
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
            

            {user?.role === "student" && (
              <>
                <Nav.Link as={Link} to="/dashboard" >
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                <Nav.Link as={Link} to="/curriculum">Curriculum</Nav.Link>
                <Nav.Link as={Link} to="/registration">Course Registration</Nav.Link>
                <Nav.Link as={Link} to="/grades">Grades</Nav.Link>
                <Nav.Link as={Link} to="/enrollments">My Enrollments</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              </>
            )}

            {/* ADMIN LINKS */}
            {user?.role === "admin" && (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/courses">
                  Manage Courses
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/classes">
                  Manage Classes
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/curricula">
                  Manage Curricula
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/registration-windows">
                  Registration Windows
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/course-registration">
                  Course Registration Preview
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/announcements">
                  Manage Announcement
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/students">
                  Manage Students
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/enrollments">
                  Enrollment Management
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/reports">
                  Reports
                </Nav.Link>
              </>
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