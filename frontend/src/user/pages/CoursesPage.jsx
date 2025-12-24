import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";

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
    // Mock data based on database: course, class tables
    const mockCourses = [
      {
        id: 1,
        code: "CS101",
        name: "Lập trình cơ bản",
        credits: 3,
        classes: [
          {
            id: 1,
            code: "CS101-1",
            semester: 1,
            year: 2025,
            capacity: 40,
            enrolled: 25,
            dayOfWeek: 2,
            startPeriod: 1,
            endPeriod: 3,
            location: "A101",
            midTermRatio: 0.4,
            finalExamRatio: 0.6,
          },
        ],
      },
      {
        id: 2,
        code: "CS201",
        name: "Cấu trúc dữ liệu",
        credits: 3,
        classes: [
          {
            id: 2,
            code: "CS201-1",
            semester: 1,
            year: 2025,
            capacity: 35,
            enrolled: 18,
            dayOfWeek: 3,
            startPeriod: 2,
            endPeriod: 4,
            location: "A102",
            midTermRatio: 0.4,
            finalExamRatio: 0.6,
          },
        ],
      },
      {
        id: 3,
        code: "BA101",
        name: "Nguyên lý quản lý",
        credits: 3,
        classes: [
          {
            id: 3,
            code: "BA101-1",
            semester: 1,
            year: 2025,
            capacity: 40,
            enrolled: 30,
            dayOfWeek: 4,
            startPeriod: 1,
            endPeriod: 3,
            location: "B201",
            midTermRatio: 0.5,
            finalExamRatio: 0.5,
          },
        ],
      },
      {
        id: 4,
        code: "BA202",
        name: "Kinh tế học cơ bản",
        credits: 3,
        classes: [
          {
            id: 4,
            code: "BA202-1",
            semester: 1,
            year: 2025,
            capacity: 30,
            enrolled: 22,
            dayOfWeek: 5,
            startPeriod: 2,
            endPeriod: 4,
            location: "B202",
            midTermRatio: 0.5,
            finalExamRatio: 0.5,
          },
        ],
      },
    ];
    setAvailableCourses(mockCourses);
  };

  const loadEnrolledCourses = async () => {
    // Mock data based on enrollment table
    const mockEnrolled = [
      {
        id: 1,
        courseId: 1,
        courseCode: "CS101",
        courseName: "Lập trình cơ bản",
        classCode: "CS101-1",
        credits: 3,
        semester: 1,
        year: 2025,
      },
    ];
    setEnrolledCourses(mockEnrolled);
  };

  const getDayName = (dayOfWeek) => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[dayOfWeek] || "";
  };

  const handleRegister = async (classId) => {
    if (!classId) return;
    if (!window.confirm("Bạn có chắc chắn muốn đăng ký lớp học này?")) return;

    // find the course and class by classId
    const found = availableCourses.reduce((acc, course) => {
      const cls = course.classes.find((c) => c.id === classId);
      return cls ? { course, classItem: cls } : acc;
    }, null);

    if (!found) {
      alert("Lớp học không tìm thấy.");
      return;
    }

    const { course, classItem } = found;

    if (classItem.enrolled >= classItem.capacity) {
      alert("Lớp đã đầy.");
      return;
    }

    // create a new enrollment entry
    const newEnrollmentId =
      (enrolledCourses.reduce((max, e) => Math.max(max, e.id || 0), 0) || 0) +
      1;
    const newEnrollment = {
      id: newEnrollmentId,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      classCode: classItem.code,
      credits: course.credits,
      semester: classItem.semester,
      year: classItem.year,
    };

    // add to enrolled courses
    setEnrolledCourses((prev) => [...prev, newEnrollment]);

    // increment enrolled count for the class in availableCourses
    setAvailableCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? {
              ...c,
              classes: c.classes.map((cl) =>
                cl.id === classId ? { ...cl, enrolled: cl.enrolled + 1 } : cl
              ),
            }
          : c
      )
    );

    alert("Đăng ký thành công!");
  };

  const handleUnregister = async (enrollmentId) => {
    if (!enrollmentId) return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký?")) return;

    const enrollment = enrolledCourses.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      alert("Đăng ký không tìm thấy.");
      return;
    }

    // remove from enrolled courses
    setEnrolledCourses((prev) => prev.filter((e) => e.id !== enrollmentId));

    // decrement enrolled count for the matching class (by classCode)
    setAvailableCourses((prev) =>
      prev.map((c) => ({
        ...c,
        classes: c.classes.map((cl) =>
          cl.code === enrollment.classCode
            ? { ...cl, enrolled: Math.max(0, cl.enrolled - 1) }
            : cl
        ),
      }))
    );

    alert("Hủy đăng ký thành công!");
  };

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const isNotEnrolled = !enrolledCourses.some(
      (enrolled) => enrolled.courseId === course.id
    );
    return matchesSearch && isNotEnrolled;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <PageFrame
      title="Đăng ký môn học"
      subtitle="Xem danh sách môn học và đăng ký các lớp học"
      headerActions={
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Về Trang chủ
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div className="card mb-6">
          <div className="card-header">Môn học đã đăng ký</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã MH</th>
                  <th>Tên môn học</th>
                  <th>Mã lớp</th>
                  <th>Tín chỉ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {enrolledCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseName}</td>
                    <td>{course.classCode}</td>
                    <td>{course.credits}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUnregister(course.id)}
                      >
                        Hủy đăng ký
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div className="card">
        <div className="card-header">Danh sách môn học</div>
        <div className="divide-y divide-gray-200">
          {filteredCourses.map((course) => (
            <div key={course.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course.code} - {course.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {course.credits} tín chỉ
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {course.classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Mã lớp:</span>
                          <p className="font-medium">{classItem.code}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Thời gian:</span>
                          <p className="font-medium">
                            {getDayName(classItem.dayOfWeek)} - Tiết{" "}
                            {classItem.startPeriod}-{classItem.endPeriod}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Phòng:</span>
                          <p className="font-medium">{classItem.location}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Số chỗ:</span>
                          <p className="font-medium">
                            {classItem.enrolled}/{classItem.capacity}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button
                        onClick={() => handleRegister(classItem.id)}
                        disabled={classItem.enrolled >= classItem.capacity}
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
      </div>
    </PageFrame>
  );
};

export default CoursesPage;
