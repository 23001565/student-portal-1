import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";

const GradesPage = () => {
  const [_user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadGrades();
  }, [navigate]);

  const loadGrades = async () => {
    try {
      // Mock data based on grade, enrollment, class, course tables
      const mockGrades = [
        {
          id: 1,
          courseCode: "CS101",
          courseName: "Lập trình cơ bản",
          credits: 3,
          semester: 1,
          year: 2025,
          midTerm: 7.5,
          finalExam: 8.0,
          total10Scale: 7.8,
          total4Scale: 3.1,
          letterGrade: "B+",
        },
        {
          id: 2,
          courseCode: "CS201",
          courseName: "Cấu trúc dữ liệu",
          credits: 3,
          semester: 1,
          year: 2025,
          midTerm: null,
          finalExam: null,
          total10Scale: null,
          total4Scale: null,
          letterGrade: null,
        },
        {
          id: 3,
          courseCode: "MATH101",
          courseName: "Giải tích 1",
          credits: 4,
          semester: 2,
          year: 2024,
          midTerm: 8.5,
          finalExam: 9.0,
          total10Scale: 8.8,
          total4Scale: 3.7,
          letterGrade: "A",
        },
      ];
      setGrades(mockGrades);
    } catch (error) {
      console.error("Lỗi khi tải điểm:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSemesters = () => {
    const semesters = [
      ...new Set(grades.map((g) => `${g.year}-${g.semester}`)),
    ];
    return semesters.sort().reverse();
  };

  const filteredGrades = grades.filter((grade) => {
    if (selectedSemester === "all") return true;
    return `${grade.year}-${grade.semester}` === selectedSemester;
  });

  const calculateGPA = () => {
    const completedGrades = filteredGrades.filter(
      (g) => g.total4Scale !== null
    );
    if (completedGrades.length === 0) return null;

    const totalPoints = completedGrades.reduce(
      (sum, g) => sum + g.total4Scale * g.credits,
      0
    );
    const totalCredits = completedGrades.reduce((sum, g) => sum + g.credits, 0);

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const getGradeColor = (letterGrade) => {
    if (!letterGrade) return "text-gray-500";
    if (letterGrade.includes("A")) return "text-green-600";
    if (letterGrade.includes("B")) return "text-blue-600";
    if (letterGrade.includes("C")) return "text-yellow-600";
    if (letterGrade.includes("D")) return "text-orange-600";
    return "text-red-600";
  };

  const gpa = calculateGPA();

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
      title="Bảng điểm"
      subtitle="Xem điểm số và GPA của các môn học"
      headerActions={
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Về Dashboard
        </Button>
      }
    >
      {/* Filter and Stats */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <label className="form-label">
            Học kỳ:
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-control ml-2"
              style={{ display: "inline-block", width: "auto" }}
            >
              <option value="all">Tất cả</option>
              {getSemesters().map((semester) => (
                <option key={semester} value={semester}>
                  Học kỳ {semester.split("-")[1]} - {semester.split("-")[0]}
                </option>
              ))}
            </select>
          </label>
          {gpa && (
            <div className="text-lg">
              <span className="text-gray-600">GPA: </span>
              <span
                className="font-bold"
                style={{ color: "var(--primary-color)" }}
              >
                {gpa}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grades Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã MH</th>
              <th>Tên môn học</th>
              <th>Tín chỉ</th>
              <th>Giữa kỳ</th>
              <th>Cuối kỳ</th>
              <th>Tổng kết (10)</th>
              <th>Tổng kết (4)</th>
              <th>Chữ cái</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.courseCode}</td>
                <td>{grade.courseName}</td>
                <td>{grade.credits}</td>
                <td>
                  {grade.midTerm !== null ? grade.midTerm.toFixed(1) : "-"}
                </td>
                <td>
                  {grade.finalExam !== null ? grade.finalExam.toFixed(1) : "-"}
                </td>
                <td>
                  {grade.total10Scale !== null
                    ? grade.total10Scale.toFixed(1)
                    : "-"}
                </td>
                <td>
                  {grade.total4Scale !== null
                    ? grade.total4Scale.toFixed(2)
                    : "-"}
                </td>
                <td>
                  <span
                    className={`text-sm font-bold ${getGradeColor(
                      grade.letterGrade
                    )}`}
                  >
                    {grade.letterGrade || "-"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredGrades.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">
                  Không có dữ liệu điểm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        className="card mt-6"
        style={{
          background: "rgba(59, 130, 246, 0.05)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <h3
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--info-color)" }}
        >
          Chú thích:
        </h3>
        <div
          className="grid grid-2 md:grid-5 gap-2 text-xs"
          style={{ color: "var(--info-color)" }}
        >
          <div>A (4.0): Xuất sắc</div>
          <div>B+ (3.5): Khá tốt</div>
          <div>B (3.0): Khá</div>
          <div>C+ (2.5): Trung bình khá</div>
          <div>C (2.0): Trung bình</div>
        </div>
      </div>
    </PageFrame>
  );
};

export default GradesPage;
