import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CoursesPage from "./pages/CoursesPage";
import GradesPage from "./pages/GradesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageCourses from "./pages/Admin/ManageCourses";
import ManageStudents from "./pages/Admin/ManageStudents";
import Reports from "./pages/Admin/Reports";
function App() {
  return (
    <div className="app-container">
      <div className="app-content">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
