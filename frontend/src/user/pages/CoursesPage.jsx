import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi";

const CoursesPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Lấy danh sách các lớp ĐÃ ĐĂNG KÝ
      const data = await studentApi.getMyEnrollments();
      setEnrolledCourses(data);
    } catch (error) {
      console.error("Lỗi tải môn học:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return "Chưa cập nhật";
    if (Array.isArray(schedule)) {
        return schedule.map(s => `Thứ ${s.day} (Tiết ${s.slots.join('-')}) phòng ${s.room}`).join("; ");
    }
    return JSON.stringify(schedule);
  };

  return (
    <Layout>
      <PageFrame title="Môn học của tôi" subtitle="Danh sách các lớp học phần đã đăng ký">
        <div className="row">
          {loading ? (
             <div className="col-12">Đang tải...</div>
          ) : enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <div key={course.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                        {course.classCode}
                      </span>
                      <span className="text-muted small">{course.credits} Tín chỉ</span>
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2">{course.courseName}</h5>
                    <p className="card-text text-secondary small mb-4 line-clamp-2">
                       {course.courseCode} - Học kỳ {course.semester}/{course.year}
                    </p>
                    <div className="border-top pt-3">
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                        <span>{formatSchedule(course.schedule)}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted small">
                         <i className="bi bi-people me-2 text-primary"></i>
                         <span>Sĩ số: {course.enrolledCount}/{course.capacity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-top-0 p-4 pt-0">
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted py-5">
                Bạn chưa đăng ký môn học nào. Hãy vào mục "Đăng ký tín chỉ".
            </div>
          )}
        </div>
      </PageFrame>
    </Layout>
  );
};

export default CoursesPage;