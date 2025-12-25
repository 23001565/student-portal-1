import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout"; // <-- Thêm dòng này

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
      // Mock data
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
          midTerm: 8.5,
          finalExam: 9.0,
          total10Scale: 8.8,
          total4Scale: 4.0,
          letterGrade: "A",
        },
      ];
      setGrades(mockGrades);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return "";
    if (grade.startsWith("A")) return "text-success";
    if (grade.startsWith("B")) return "text-primary";
    if (grade.startsWith("C")) return "text-warning";
    if (grade.startsWith("D")) return "text-warning";
    return "text-danger";
  };

  const filteredGrades =
    selectedSemester === "all"
      ? grades
      : grades.filter((g) => g.semester.toString() === selectedSemester);

  // Tính GPA (giả định)
  const gpa =
    grades.reduce((acc, curr) => acc + curr.total4Scale * curr.credits, 0) /
    (grades.reduce((acc, curr) => acc + curr.credits, 0) || 1);

  return (
    <Layout> {/* <-- Bọc Layout ở đây */}
      <PageFrame
        title="Kết quả học tập"
        subtitle={`GPA Tích lũy: ${gpa.toFixed(2)}`}
        headerActions={
          <select
            className="form-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ minWidth: "200px" }}
          >
            <option value="all">Tất cả học kỳ</option>
            <option value="1">Học kỳ 1 (2024-2025)</option>
            <option value="2">Học kỳ 2 (2024-2025)</option>
          </select>
        }
      >
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 ps-4">Mã HP</th>
                  <th className="py-3">Tên học phần</th>
                  <th className="py-3 text-center">TC</th>
                  <th className="py-3 text-center">Giữa kỳ</th>
                  <th className="py-3 text-center">Cuối kỳ</th>
                  <th className="py-3 text-center">TK (10)</th>
                  <th className="py-3 text-center">TK (4)</th>
                  <th className="py-3 text-center">Điểm chữ</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="ps-4 fw-medium">{grade.courseCode}</td>
                    <td>{grade.courseName}</td>
                    <td className="text-center">{grade.credits}</td>
                    <td className="text-center">{grade.midTerm}</td>
                    <td className="text-center">{grade.finalExam}</td>
                    <td className="text-center fw-bold">
                      {grade.total10Scale.toFixed(1)}
                    </td>
                    <td className="text-center">{grade.total4Scale.toFixed(1)}</td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          grade.letterGrade.startsWith("A")
                            ? "bg-success"
                            : grade.letterGrade.startsWith("B")
                            ? "bg-primary"
                            : grade.letterGrade.startsWith("C")
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {grade.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredGrades.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Không có dữ liệu điểm cho học kỳ này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mt-4 bg-light border-0">
          <div className="card-body">
            <h6 className="card-title text-muted mb-3">Chú thích điểm:</h6>
            <div className="d-flex flex-wrap gap-4 text-sm">
              <div><span className="badge bg-success me-2">A</span> Xuất sắc (4.0)</div>
              <div><span className="badge bg-primary me-2">B+</span> Khá giỏi (3.5)</div>
              <div><span className="badge bg-primary me-2">B</span> Khá (3.0)</div>
              <div><span className="badge bg-warning text-dark me-2">C</span> Trung bình (2.0)</div>
              <div><span className="badge bg-danger me-2">F</span> Không đạt (&lt; 4.0)</div>
            </div>
          </div>
        </div>
      </PageFrame>
    </Layout>
  );
};

export default GradesPage;