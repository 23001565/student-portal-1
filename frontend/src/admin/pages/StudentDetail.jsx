import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Dùng API axiosClient

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        // API này đã được thêm vào adminApi.js ở bước trước chưa? 
        // Nếu chưa, hãy thêm: getStudentById: (id) => axiosClient.get(`/admin/students/${id}`)
        const res = await adminApi.getStudentById(id);
        setStudent(res);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [id]);

  if (loading) return <Layout><div>Đang tải...</div></Layout>;
  if (!student) return <Layout><div>Không tìm thấy sinh viên</div></Layout>;

  return (
    <Layout>
      <PageFrame 
        title={student.name} 
        subtitle={`MSSV: ${student.code}`}
        headerActions={
            <Button onClick={() => navigate(`/admin/students/${id}/edit`)}>Sửa hồ sơ</Button>
        }
      >
        <div className="row">
            <div className="col-md-4">
                <div className="card mb-4">
                    <div className="card-body">
                        <h5>Thông tin cá nhân</h5>
                        <p><strong>Email:</strong> {student.email}</p>
                        <p><strong>Năm thứ:</strong> {student.year}</p>
                        <p><strong>Lớp:</strong> {student.className}</p>
                        <p><strong>Ngành:</strong> {student.major?.name}</p>
                        <p><strong>CTĐT:</strong> {student.curriculum?.name}</p>
                        <p><strong>Trạng thái:</strong> {student.isActive ? "Đang học" : "Đã nghỉ"}</p>
                    </div>
                </div>
            </div>
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">Kết quả học tập</div>
                    <div className="card-body">
                        <table className="table">
                            <thead><tr><th>Môn</th><th>Điểm hệ 10</th><th>Điểm chữ</th></tr></thead>
                            <tbody>
                                {student.enrollments?.map((en, idx) => (
                                    <tr key={idx}>
                                        <td>{en.class?.course?.name}</td>
                                        <td>{en.total10 || "-"}</td>
                                        <td>{en.letterGrade || "-"}</td>
                                    </tr>
                                ))}
                                {student.enrollments?.length === 0 && <tr><td colSpan="3">Chưa có dữ liệu điểm</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </PageFrame>
    </Layout>
  );
};
export default StudentDetail;