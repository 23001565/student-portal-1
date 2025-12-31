import React from "react";
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
import Announcements from "./pages/Admin/Announcements";
import PostAnnouncement from "./pages/Admin/PostAnnouncement";
import UploadGrades from "./pages/Admin/UploadGrades";
import ManageCurricula from "./pages/Admin/ManageCurricula";
import UploadCourses from "./pages/Admin/UploadCourses";
import ProgressMonitor from "./pages/Admin/ProgressMonitor";
import CourseRegistration from "./pages/CourseRegistration";
import ManageClasses from "./pages/Admin/ManageClasses";
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
            <Route path="/registration" element={<CourseRegistration />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/upload-courses" element={<UploadCourses />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="/admin/post-announcement" element={<PostAnnouncement />} />
            <Route path="/admin/upload-grades" element={<UploadGrades />} />
            <Route path="/admin/upload-curriculum" element={<ManageCurricula />} />
            <Route path="/admin/manage-curricula" element={<ManageCurricula />} />
            <Route path="/admin/manage-classes" element={<ManageClasses />} />
            <Route path="/admin/progress-monitor" element={<ProgressMonitor />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
