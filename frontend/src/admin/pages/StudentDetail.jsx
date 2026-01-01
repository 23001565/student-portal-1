import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await adminApi.getStudentById(id);
        setStudent(data);
      } catch (error) {
        alert("Không tìm thấy sinh viên!");
        navigate("/admin/students");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading) return <Layout><div>Đang tải...</div></Layout>;
  if (!student) return null;

  return (
    <Layout>
      <PageFrame title={`Hồ sơ: ${student.name}`} subtitle={`MSSV: ${student.code}`}>
        <Container fluid className="p-0">
          <div className="mb-3">
             <Button variant="outline-secondary" onClick={() => navigate("/admin/students")} className="me-2">
                <i className="bi bi-arrow-left"></i> Quay lại
             </Button>
             <Button variant="primary" onClick={() => navigate(`/admin/students/${id}/edit`)}>
                <i className="bi bi-pencil-square"></i> Chỉnh sửa thông tin
             </Button>
          </div>

          <Row>
            {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
            <Col md={4} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white fw-bold text-primary">Thông tin cá nhân</Card.Header>
                <Card.Body>
                    <div className="text-center mb-3">
                        <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{width: 80, height: 80, fontSize: 32}}>
                            {student.name.charAt(0)}
                        </div>
                    </div>
                    <ul className="list-unstyled">
                        <li className="mb-2"><strong>Email:</strong> {student.email}</li>
                        <li className="mb-2"><strong>SĐT:</strong> {student.phone || "Chưa cập nhật"}</li>
                        <li className="mb-2"><strong>Ngày sinh:</strong> {student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : "---"}</li>
                        <li className="mb-2"><strong>Giới tính:</strong> {student.gender || "---"}</li>
                        <hr />
                        <li className="mb-2"><strong>Lớp:</strong> {student.className}</li>
                        <li className="mb-2"><strong>Ngành:</strong> {student.major?.name}</li>
                        <li className="mb-2"><strong>Niên khóa:</strong> {student.year}</li>
                    </ul>
                </Card.Body>
              </Card>
            </Col>

            {/* CỘT PHẢI: BẢNG ĐIỂM CHI TIẾT */}
            <Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white fw-bold text-success d-flex justify-content-between">
                    <span>Kết quả học tập</span>
                    <Badge bg="info">Tổng: {student.enrollments?.length || 0} môn</Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Môn học</th>
                                <th className="text-center">Số TC</th>
                                <th className="text-center">Giữa kỳ</th>
                                <th className="text-center">Cuối kỳ</th>
                                <th className="text-center fw-bold">Tổng kết (10)</th>
                                <th className="text-center">Điểm chữ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {student.enrollments && student.enrollments.length > 0 ? (
                                student.enrollments.map((en) => (
                                    <tr key={en.id}>
                                        <td>
                                            <div className="fw-medium">{en.class?.course?.name}</div>
                                            <small className="text-muted">{en.class?.course?.code}</small>
                                        </td>
                                        <td className="text-center">{en.class?.course?.credits}</td>
                                        <td className="text-center">{en.midTerm ?? "-"}</td>
                                        <td className="text-center">{en.finalExam ?? "-"}</td>
                                        <td className="text-center fw-bold text-primary">{en.total10 ?? "-"}</td>
                                        <td className="text-center fw-bold">{en.letterGrade ?? "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">Chưa có dữ liệu điểm môn nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </PageFrame>
    </Layout>
  );
};

export default StudentDetail;