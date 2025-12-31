import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./user/pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./user/pages/Dashboard";
import CoursesPage from "./user/pages/CoursesPage";
import GradesPage from "./user/pages/GradesPage";
import ProfilePage from "./user/pages/ProfilePage";
import AdminDashboard from "./admin/pages/AdminDashboard";
import ManageCourses from "./admin/pages/ManageCourses";
import ManageStudents from "./admin/pages/ManageStudents";
import Reports from "./admin/pages/Reports";
import Announcements from "./admin/pages/Announcements";
import PostAnnouncement from "./admin/pages/PostAnnouncement";
import UploadGrades from "./admin/pages/UploadGrades";
import UploadCurriculum from "./admin/pages/UploadCurriculum";
import CourseRegistration from "./user/pages/CourseRegistration";
import StudentDetail from "./admin/pages/StudentDetail";
import EditStudent from "./admin/pages/EditStudent";
function App() {
  return (
    <div className="app-container">
      <div className="app-content">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/registration" element={<CourseRegistration />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/students/:id" element={<StudentDetail />} />
            <Route path="/admin/students/:id/edit" element={<EditStudent />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route
              path="/admin/post-announcement"
              element={<PostAnnouncement />}
            />
            <Route path="/admin/upload-grades" element={<UploadGrades />} />
            <Route
              path="/admin/upload-curriculum"
              element={<UploadCurriculum />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
