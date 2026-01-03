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
    console.log("Starting logout process");
    try {
      await logout();
      console.log("Logout API call completed");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      console.log("Navigating to /login");
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
            

            {user?.role === "student" && (
              <>
                <Nav.Link as={Link} to="/dashboard" >
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                <Nav.Link as={Link} to="/curriculum">Curriculum</Nav.Link>
                <Nav.Link as={Link} to="/grades">Grades</Nav.Link>
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
                <Nav.Link as={Link} to="/admin/announcements">
                  Manage Announcement
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/students">
                  Manage Students
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