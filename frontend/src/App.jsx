import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/LoginPage";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CoursesPage from "./pages/CoursesPage";
import GradesPage from "./pages/GradesPage";
import ProfilePage from "./pages/ProfilePage";
import CurriculumPage from "./pages/CurriculumPage";
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
import ClassCSVUpload from "./pages/Admin/ClassCSVUpload";
import CourseCSVUpload from "./pages/Admin/CourseCSVUpload";
import ManageRegistrationWindows from "./pages/Admin/ManageRegistrationWindows";
import AdminCourseRegistration from "./pages/Admin/AdminCourseRegistration";
import AdminEnrollmentPage from "./pages/Admin/AdminEnrollmentPage";
import StudentEnrollmentPage from "./pages/StudentEnrollmentPage";
import UploadCurriculum from "./pages/Admin/UploadCurriculum";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/authContext";
function App() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="app-container">
      <div className="app-content">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
           <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/enrollments" element={<StudentEnrollmentPage />} />
          <Route path="/admin/enrollments/:studentCode" element={<StudentEnrollmentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />
          <Route path="/registration" element={<CourseRegistration />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/upload-courses" element={<CourseCSVUpload />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/announcements" element={<Announcements />} />
          <Route path="/admin/post-announcement" element={<PostAnnouncement />} />
          <Route path="/admin/upload-grades" element={<UploadGrades />} />
          <Route path="/admin/upload-curriculum" element={<UploadCurriculum />} />
          <Route path="/admin/curricula" element={<ManageCurricula />} />
          <Route path="/admin/classes" element={<ManageClasses />} />
          <Route path="/admin/upload-classes" element={<ClassCSVUpload />} />
          <Route path="/admin/progress-monitor" element={<ProgressMonitor />} />
          <Route path="/admin/registration-windows" element={<ManageRegistrationWindows />} />
          <Route path="/admin/course-registration" element={<AdminCourseRegistration />} />
          <Route path="/admin/enrollments" element={<AdminEnrollmentPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
