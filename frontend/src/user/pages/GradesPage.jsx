import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi";

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
      const data = await studentApi.getGrades();
      setGrades(data);
    } catch (error) {
      console.error("Lỗi tải điểm:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC TÍNH TOÁN GPA & TÍN CHỈ ---
  const stats = useMemo(() => {
    let totalCredits = 0;       
    let totalPoints = 0;        
    let completedCredits = 0;   

    grades.forEach(g => {
      if (g.total10Scale === null || g.total10Scale === undefined) return;

      const credit = parseInt(g.credits || 0);
      const score10 = parseFloat(g.total10Scale);

      // Quy đổi hệ 4
      let score4 = 0;
      if (score10 >= 8.5) score4 = 4.0;      
      else if (score10 >= 7.0) score4 = 3.0; 
      else if (score10 >= 5.5) score4 = 2.0; 
      else if (score10 >= 4.0) score4 = 1.0; 
      else score4 = 0;                       

      totalPoints += score4 * credit;
      totalCredits += credit;

      if (score4 > 0) {
        completedCredits += credit;
      }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    return { gpa, completedCredits };
  }, [grades]);

  return (
    <Layout>
      <PageFrame title="Kết quả học tập" subtitle="Bảng điểm chi tiết">
        
        {/* --- PHẦN HIỂN THỊ GPA (DẠNG TEXT NHỎ GỌN) --- */}
        <div className="text-end mb-2">
            <span className="text-muted small">
                GPA tích lũy: <strong className="text-success fs-6">{stats.gpa}</strong> 
                <span className="mx-2">|</span> 
                Tín chỉ tích lũy: <strong className="text-primary fs-6">{stats.completedCredits}</strong>
            </span>
        </div>
        {/* ----------------------------------------------- */}

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
                {loading ? (
                    <tr><td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                ) : grades.length > 0 ? (
                    grades.map((grade, idx) => (
                    <tr key={idx}>
                        <td className="ps-4 fw-bold text-primary">{grade.courseCode}</td>
                        <td className="fw-medium">{grade.courseName}</td>
                        <td className="text-center">{grade.credits}</td>
                        <td className="text-center">{grade.midTerm || "-"}</td>
                        <td className="text-center">{grade.finalExam || "-"}</td>
                        <td className="text-center fw-bold">{grade.total10Scale || "-"}</td>
                        <td className="text-center">
                            <span className={`badge ${grade.letterGrade?.startsWith('A') || grade.letterGrade?.startsWith('B') ? 'bg-success' : grade.letterGrade?.startsWith('C') ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                {grade.letterGrade || "-"}
                            </span>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có dữ liệu điểm</td></tr>
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