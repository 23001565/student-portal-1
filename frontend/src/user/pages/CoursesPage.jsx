import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout"; // <-- Thêm dòng này

const CoursesPage = () => {
  const [_user, setUser] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadCourseData();
  }, [navigate]);

  const loadCourseData = async () => {
    try {
      await Promise.all([loadAvailableCourses(), loadEnrolledCourses()]);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu môn học:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    // Mock data
    const mockCourses = [
      {
        id: 1,
        code: "CS101",
        name: "Lập trình cơ bản",
        credits: 3,
        classes: [
          {
            id: 101,
            code: "CS101-01",
            dayOfWeek: 2,
            startPeriod: 1,
            endPeriod: 3,
            location: "P.301-A2",
            enrolled: 45,
            capacity: 50,
          },
          {
            id: 102,
            code: "CS101-02",
            dayOfWeek: 4,
            startPeriod: 7,
            endPeriod: 9,
            location: "P.302-A2",
            enrolled: 50,
            capacity: 50,
          },
        ],
      },
      {
        id: 2,
        code: "MATH101",
        name: "Giải tích 1",
        credits: 4,
        classes: [
          {
            id: 201,
            code: "MATH101-01",
            dayOfWeek: 3,
            startPeriod: 1,
            endPeriod: 4,
            location: "Giảng đường 1",
            enrolled: 80,
            capacity: 100,
          },
        ],
      },
    ];
    setAvailableCourses(mockCourses);
  };

  const loadEnrolledCourses = async () => {
    setEnrolledCourses([]);
  };

  const handleRegister = (classId) => {
    alert(`Đăng ký lớp ${classId} thành công! (Demo)`);
  };

  const getDayName = (day) => {
    const days = {
      2: "Thứ 2",
      3: "Thứ 3",
      4: "Thứ 4",
      5: "Thứ 5",
      6: "Thứ 6",
      7: "Thứ 7",
      8: "Chủ nhật",
    };
    return days[day] || day;
  };

  // Filter logic
  const filteredCourses = availableCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout> {/* <-- Bọc Layout ở đây */}
      <PageFrame
        title="Đăng ký lớp học phần"
        subtitle="Danh sách các lớp đang mở cho học kỳ này"
      >
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm môn học theo tên hoặc mã..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="card shadow-sm"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="h5 mb-0 font-weight-bold">
                        {course.name} <span className="text-muted">({course.code})</span>
                      </h3>
                      <span className="badge bg-primary">
                        {course.credits} Tín chỉ
                      </span>
                    </div>
                  </div>
                  <div className="card-body p-0">
                    {course.classes.map((classItem, idx) => (
                      <div
                        key={classItem.id}
                        className={`p-3 d-flex justify-content-between align-items-center ${
                          idx !== 0 ? "border-top" : ""
                        }`}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex gap-4">
                            <div style={{ minWidth: "120px" }}>
                              <span className="text-muted d-block small">Mã lớp:</span>
                              <span className="fw-bold">{classItem.code}</span>
                            </div>
                            <div style={{ minWidth: "180px" }}>
                              <span className="text-muted d-block small">Thời gian:</span>
                              <span className="fw-medium">
                                {getDayName(classItem.dayOfWeek)} (Tiết{" "}
                                {classItem.startPeriod}-{classItem.endPeriod})
                              </span>
                            </div>
                            <div style={{ minWidth: "150px" }}>
                              <span className="text-muted d-block small">Phòng:</span>
                              <span>{classItem.location}</span>
                            </div>
                            <div>
                              <span className="text-muted d-block small">Sĩ số:</span>
                              <span
                                className={
                                  classItem.enrolled >= classItem.capacity
                                    ? "text-danger fw-bold"
                                    : "text-success"
                                }
                              >
                                {classItem.enrolled}/{classItem.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ms-3">
                          <Button
                            variant={
                              classItem.enrolled >= classItem.capacity
                                ? "secondary"
                                : "primary"
                            }
                            onClick={() => handleRegister(classItem.id)}
                            disabled={classItem.enrolled >= classItem.capacity}
                            size="sm"
                          >
                            {classItem.enrolled >= classItem.capacity
                              ? "Đã đầy"
                              : "Đăng ký"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageFrame>
    </Layout>
  );
};

export default CoursesPage;