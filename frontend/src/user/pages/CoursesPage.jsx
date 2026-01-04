import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap"; 
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi";

const CoursesPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('ongoing'); 
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
      const data = await studentApi.getMyEnrollments();
      setEnrolledCourses(data);
    } catch (error) {
      console.error("Lỗi tải môn học:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (classId, courseName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY môn: ${courseName}?\n\nHành động này sẽ xóa tên bạn khỏi danh sách lớp và không thể hoàn tác.`)) {
      return;
    }

    try {
      await studentApi.cancelRegistration(classId);
      alert("Đã hủy học phần thành công!");
      loadData();
    } catch (error) {
      alert("Không thể hủy: " + (error.response?.data?.message || "Lỗi hệ thống"));
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return "Chưa cập nhật";
    if (Array.isArray(schedule)) {
        return schedule.map(s => `Thứ ${s.day} (Tiết ${s.slots.join('-')}) phòng ${s.room}`).join("; ");
    }
    return JSON.stringify(schedule);
  };

  const finishedCourses = enrolledCourses.filter(c => c.total10 !== null && c.total10 !== undefined);
  const ongoingCourses = enrolledCourses.filter(c => c.total10 === null || c.total10 === undefined);

  // --- STYLE TÙY CHỈNH CHO TABS ---
  // Bạn có thể chuyển đoạn này vào file CSS riêng nếu muốn
  const tabStyles = `
    .custom-tabs .nav-link {
        color: #6c757d; /* Màu xám khi chưa chọn */
        font-weight: 600;
        border-radius: 8px;
        padding: 10px 20px;
        transition: all 0.2s;
    }
    .custom-tabs .nav-link:hover {
        color: #198754; /* Màu xanh lá khi di chuột */
        background-color: rgba(25, 135, 84, 0.1);
    }
    .custom-tabs .nav-link.active {
        background-color: #198754 !important; /* Nền xanh lá khi chọn (giống Sidebar) */
        color: white !important; /* Chữ trắng */
        box-shadow: 0 4px 6px rgba(25, 135, 84, 0.2);
    }
  `;

  const renderCourseCard = (course, isFinished) => (
    <div key={course.id} className="col-md-6 col-lg-4 mb-4">
      <div className={`card h-100 shadow-sm border-0 ${isFinished ? "bg-light opacity-75" : "hover-shadow transition-all"}`}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className={`badge ${isFinished ? "bg-secondary" : "bg-primary"} bg-opacity-10 ${isFinished ? "text-secondary" : "text-primary"} rounded-pill px-3`}>
              {course.classCode}
            </span>
            <span className="text-muted small">{course.credits} Tín chỉ</span>
          </div>
          
          <h5 className="card-title fw-bold text-dark mb-2">{course.courseName}</h5>
          
          <p className="card-text text-secondary small mb-4 line-clamp-2">
             {course.courseCode} - Học kỳ {course.semester}/{course.year}
          </p>

          {isFinished && (
             <div className="alert alert-success py-2 px-3 mb-3 d-flex justify-content-between align-items-center">
                <small className="fw-bold">Điểm tổng kết:</small>
                <span className="fw-bold fs-5">{course.total10} <span className="fs-6 text-muted">({course.letterGrade})</span></span>
             </div>
          )}

          <div className={`${isFinished ? "" : "border-top pt-3"}`}>
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
           {isFinished ? (
              <button className="btn btn-secondary w-100" disabled>
                 <i className="bi bi-check-circle-fill me-2"></i>Đã kết thúc
              </button>
           ) : (
              <button 
                className="btn btn-outline-danger w-100"
                onClick={() => handleCancel(course.id, course.courseName)}
              >
                <i className="bi bi-x-circle me-2"></i>Hủy đăng ký
              </button>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{tabStyles}</style> {/* Chèn CSS trực tiếp */}
      <PageFrame title="Môn học của tôi" subtitle="Quản lý các lớp học phần đã đăng ký">
        
        {loading ? (
           <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
           </div>
        ) : (
          <Tabs
            id="course-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-4 custom-tabs border-0" // Thêm class custom-tabs để áp dụng CSS
            variant="pills"
          >
            <Tab eventKey="ongoing" title={`Lớp đang học (${ongoingCourses.length})`}>
                <div className="row mt-3">
                    {ongoingCourses.length > 0 ? (
                        ongoingCourses.map(course => renderCourseCard(course, false))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted fs-1 mb-3 opacity-50"><i className="bi bi-journal-x"></i></div>
                            <p className="text-muted">Bạn không có lớp học phần nào đang diễn ra.</p>
                        </div>
                    )}
                </div>
            </Tab>

            <Tab eventKey="finished" title={`Đã hoàn thành (${finishedCourses.length})`}>
                <div className="row mt-3">
                    {finishedCourses.length > 0 ? (
                        finishedCourses.map(course => renderCourseCard(course, true))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted fs-1 mb-3 opacity-50"><i className="bi bi-inbox"></i></div>
                            <p className="text-muted">Bạn chưa hoàn thành môn học nào.</p>
                        </div>
                    )}
                </div>
            </Tab>
          </Tabs>
        )}

      </PageFrame>
    </Layout>
  );
};

export default CoursesPage;