import React, { useState, useEffect } from "react";
import { Container, Card, Form, Table, Button, Row, Col, Badge, Alert } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const UploadGrades = () => {
  // State quản lý
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // Thông báo thành công/thất bại

  // 1. Tải danh sách lớp khi vào trang
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await adminApi.getAllClasses();
        setClasses(data);
      } catch (error) {
        console.error("Lỗi tải lớp:", error);
      }
    };
    fetchClasses();
  }, []);

  // 2. Khi chọn lớp -> Tải bảng điểm
  useEffect(() => {
    if (!selectedClassId) {
        setStudents([]);
        return;
    }
    loadStudents(selectedClassId);
  }, [selectedClassId]);

  const loadStudents = async (classId) => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await adminApi.getClassGrades(classId);
      setStudents(data);
    } catch (error) {
      setMsg({ type: 'danger', text: "Lỗi tải sinh viên: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý khi gõ điểm vào ô input
  const handleInputChange = (enrollmentId, field, value) => {
    // Cho phép nhập số hoặc chuỗi rỗng (để xóa điểm)
    setStudents(prev => prev.map(s => 
        s.id === enrollmentId ? { ...s, [field]: value } : s
    ));
  };

  // 4. Bấm nút Lưu trên từng dòng
  const handleSaveRow = async (enrollmentId, midTerm, finalExam) => {
    setMsg(null);
    try {
      // Validate cơ bản
      if ((midTerm && (midTerm < 0 || midTerm > 10)) || (finalExam && (finalExam < 0 || finalExam > 10))) {
        alert("Điểm phải nằm trong khoảng 0 - 10");
        return;
      }

      // Gọi API cập nhật
      const updatedData = await adminApi.updateGrade({
        enrollmentId,
        midTerm,
        finalExam
      });

      // Cập nhật lại giao diện (hiển thị điểm tổng kết mới tính từ server)
      setStudents(prev => prev.map(s => 
        s.id === enrollmentId ? { 
            ...s, 
            total10: updatedData.total10,
            letterGrade: updatedData.letterGrade 
        } : s
      ));
      
      // Hiển thị thông báo nhỏ hoặc Toast thì tốt hơn, ở đây dùng alert cho nhanh
      // alert("Lưu thành công!"); 
    } catch (error) {
      alert("Lỗi lưu điểm: " + error.message);
    }
  };

  return (
    <Layout>
      <PageFrame title="Quản lý Điểm số" subtitle="Nhập điểm trực tiếp cho sinh viên">
        <Container fluid className="p-0">
          
          {msg && <Alert variant={msg.type}>{msg.text}</Alert>}

          {/* 1. KHUNG CHỌN LỚP */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
                <Row className="align-items-center">
                    <Col md={5}>
                        <Form.Label className="fw-bold text-primary">Chọn Lớp học phần:</Form.Label>
                        <Form.Select 
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="border-primary"
                        >
                            <option value="">-- Vui lòng chọn lớp --</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.code} - {cls.course?.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={7} className="text-end">
                         {selectedClassId && students.length > 0 && (
                             <div className="text-muted mt-4">
                                 Đang hiển thị: <strong>{students.length}</strong> sinh viên
                             </div>
                         )}
                    </Col>
                </Row>
            </Card.Body>
          </Card>

          {/* 2. BẢNG NHẬP ĐIỂM */}
          {selectedClassId && (
              <Card className="shadow-sm border-0">
                <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light text-center">
                        <tr>
                            <th className="text-start">Sinh viên</th>
                            <th style={{width: '150px'}}>Quá trình (40%)</th>
                            <th style={{width: '150px'}}>Cuối kỳ (60%)</th>
                            <th>Tổng (10)</th>
                            <th>Điểm Chữ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map((s) => (
                            <tr key={s.id}>
                                {/* Cột thông tin sinh viên */}
                                <td>
                                    <div className="fw-bold text-dark">{s.student?.name}</div>
                                    <small className="text-muted">{s.student?.code}</small>
                                </td>

                                {/* Ô nhập điểm Quá trình */}
                                <td>
                                    <Form.Control 
                                        type="number" min="0" max="10" step="0.1"
                                        value={s.midTerm !== null ? s.midTerm : ""}
                                        onChange={(e) => handleInputChange(s.id, 'midTerm', e.target.value)}
                                        className="text-center fw-bold text-primary"
                                        placeholder="..."
                                    />
                                </td>

                                {/* Ô nhập điểm Cuối kỳ */}
                                <td>
                                    <Form.Control 
                                        type="number" min="0" max="10" step="0.1"
                                        value={s.finalExam !== null ? s.finalExam : ""}
                                        onChange={(e) => handleInputChange(s.id, 'finalExam', e.target.value)}
                                        className="text-center fw-bold text-primary"
                                        placeholder="..."
                                    />
                                </td>

                                {/* Điểm tổng kết (Readonly) */}
                                <td className="text-center fw-bold fs-5">
                                    {s.total10 !== null ? s.total10 : "-"}
                                </td>

                                {/* Điểm chữ (Badge màu) */}
                                <td className="text-center">
                                    {s.letterGrade ? (
                                        <Badge bg={
                                            s.letterGrade === 'F' ? 'danger' : 
                                            s.letterGrade.includes('A') ? 'success' : 'info'
                                        } className="px-3 py-2">
                                            {s.letterGrade}
                                        </Badge>
                                    ) : "-"}
                                </td>

                                {/* Nút Lưu */}
                                <td className="text-center">
                                    <Button 
                                        variant="light" 
                                        size="sm"
                                        className="text-success border-success hover-shadow"
                                        title="Lưu điểm sinh viên này"
                                        onClick={() => handleSaveRow(s.id, s.midTerm, s.finalExam)}
                                    >
                                        <i className="bi bi-check-lg me-1"></i>Lưu
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">
                                    {loading ? "Đang tải dữ liệu..." : "Lớp này chưa có sinh viên nào đăng ký."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
              </Card>
          )}

        </Container>
      </PageFrame>
    </Layout>
  );
};

export default UploadGrades;