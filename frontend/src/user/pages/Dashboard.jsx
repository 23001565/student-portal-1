import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi"; // Import API

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Gọi song song 2 API: Lấy thông báo và Lấy lịch học
      const [annData, enrollData] = await Promise.all([
        studentApi.getAnnouncements(),
        studentApi.getMyEnrollments()
      ]);
      setAnnouncements(annData);
      setEnrollments(enrollData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm helper format lịch học từ JSON string/object backend trả về
  const formatSchedule = (schedule) => {
    if (!schedule) return "Chưa có lịch";
    if (Array.isArray(schedule)) {
      return schedule.map(s => `Thứ ${s.day} (Tiết ${s.slots.join('-')}) phòng ${s.room}`).join("; ");
    }
    return schedule;
  };

  return (
    <Layout>
      <PageFrame title="Dashboard" subtitle={`Chào mừng trở lại, ${user?.name || "Sinh viên"}!`}>
        <div className="row">
          {/* CỘT TRÁI: THÔNG BÁO */}
          <div className="col-md-8 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                <h5 className="card-title text-primary fw-bold mb-0">
                  <i className="bi bi-bell me-2"></i>Thông báo mới
                </h5>
              </div>
              <div className="card-body px-4">
                {loading ? (
                  <p>Đang tải...</p>
                ) : announcements.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {announcements.map((item) => (
                      <div key={item.id} className="list-group-item px-0 py-3 border-bottom-light">
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                          <h6 className="mb-0 fw-semibold text-dark">{item.title}</h6>
                          <small className="text-muted">
                            {new Date(item.postedAt).toLocaleDateString("vi-VN")}
                          </small>
                        </div>
                        <p className="mb-1 text-secondary small line-clamp-2">{item.content}</p>
                        <span className={`badge bg-${item.priority === 'high' ? 'danger' : 'info'} bg-opacity-10 text-${item.priority === 'high' ? 'danger' : 'info'} rounded-pill`}>
                          {item.priority === 'high' ? 'Quan trọng' : 'Thông tin'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">Không có thông báo mới</div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LỊCH HỌC HÔM NAY (Lấy từ Enrollments) */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0 bg-primary bg-gradient text-white">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4">
                  <i className="bi bi-calendar-event me-2"></i>Lớp học phần đang tham gia
                </h5>
                <div className="vstack gap-3">
                  {enrollments.slice(0, 3).map((en) => (
                    <div key={en.id} className="bg-white bg-opacity-25 p-3 rounded-3 border border-white border-opacity-25">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 fw-bold">{en.courseName}</h6>
                          <div className="small opacity-75">{en.classCode}</div>
                        </div>
                        <span className="badge bg-white text-primary fw-bold">
                          {en.credits} TC
                        </span>
                      </div>
                      <div className="mt-2 small pt-2 border-top border-white border-opacity-25">
                         <i className="bi bi-clock me-1"></i> {formatSchedule(en.schedule)}
                      </div>
                    </div>
                  ))}
                  {enrollments.length === 0 && <p>Bạn chưa đăng ký lớp nào.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageFrame>
    </Layout>
  );
};

export default Dashboard;