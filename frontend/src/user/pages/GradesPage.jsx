import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi"; // Import API

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    loadGrades();
  }, [navigate]);

  const loadGrades = async () => {
    try {
      // GỌI API THẬT
      const data = await studentApi.getGrades();
      setGrades(data);
    } catch (error) {
      console.error("Lỗi tải điểm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Các phần render bên dưới giữ nguyên, chỉ lưu ý biến 'grades' giờ là dữ liệu thật
  return (
    <Layout>
      <PageFrame title="Kết quả học tập" subtitle="Bảng điểm chi tiết">
        {/* Render bảng điểm giống code cũ, không thay đổi giao diện */}
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="py-3 ps-4">Mã môn</th>
                  <th className="py-3">Tên môn học</th>
                  <th className="py-3 text-center">TC</th>
                  <th className="py-3 text-center">Giữa kỳ</th>
                  <th className="py-3 text-center">Cuối kỳ</th>
                  <th className="py-3 text-center">Tổng (10)</th>
                  <th className="py-3 text-center">Điểm chữ</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, idx) => (
                  <tr key={idx}>
                    <td className="ps-4 fw-bold text-primary">{grade.courseCode}</td>
                    <td className="fw-medium">{grade.courseName}</td>
                    <td className="text-center">{grade.credits}</td>
                    <td className="text-center">{grade.midTerm || "-"}</td>
                    <td className="text-center">{grade.finalExam || "-"}</td>
                    <td className="text-center fw-bold">{grade.total10Scale || "-"}</td>
                    <td className="text-center">
                        <span className={`badge ${grade.letterGrade?.startsWith('A') ? 'bg-success' : 'bg-primary'}`}>
                            {grade.letterGrade || "-"}
                        </span>
                    </td>
                  </tr>
                ))}
                {grades.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-4">Chưa có dữ liệu điểm</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageFrame>
    </Layout>
  );
};

export default GradesPage;