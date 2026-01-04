import React, { useState, useEffect } from "react";
import { Container, Card, Form, Table, Button, Row, Col, Badge, Alert, Pagination, InputGroup } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const UploadGrades = () => {
  // State quản lý dữ liệu gốc
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // State quản lý Phân trang & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Hiển thị 10 sinh viên mỗi trang

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

  // 2. Khi chọn lớp -> Tải bảng điểm & Reset bộ lọc
  useEffect(() => {
    if (!selectedClassId) {
        setStudents([]);
        return;
    }
    loadStudents(selectedClassId);
    
    // Reset lại bộ lọc và phân trang khi đổi lớp
    setSearchTerm("");
    setCurrentPage(1);
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

  // --- LOGIC LỌC VÀ PHÂN TRANG ---
  // A. Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredStudents = students.filter((item) => {
      const term = searchTerm.toLowerCase();
      const name = item.student?.name?.toLowerCase() || "";
      const code = item.student?.code?.toLowerCase() || "";
      return name.includes(term) || code.includes(term);
  });

  // B. Tính toán phân trang dựa trên danh sách đã lọc
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // --------------------------------

  // 3. Xử lý khi gõ điểm vào ô input (Cập nhật vào State gốc)
  const handleInputChange = (enrollmentId, field, value) => {
    setStudents(prev => prev.map(s => 
        s.id === enrollmentId ? { ...s, [field]: value } : s
    ));
  };

  // 4. Bấm nút Lưu trên từng dòng
  const handleSaveRow = async (enrollmentId, midTerm, finalExam) => {
    setMsg(null);
    try {
      if ((midTerm && (midTerm < 0 || midTerm > 10)) || (finalExam && (finalExam < 0 || finalExam > 10))) {
        alert("Điểm phải nằm trong khoảng 0 - 10");
        return;
      }

      const updatedData = await adminApi.updateGrade({
        enrollmentId,
        midTerm,
        finalExam
      });

      setStudents(prev => prev.map(s => 
        s.id === enrollmentId ? { 
            ...s, 
            total10: updatedData.total10,
            letterGrade: updatedData.letterGrade 
        } : s
      ));
      
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

          {/* 1. KHUNG ĐIỀU KHIỂN: CHỌN LỚP & TÌM KIẾM */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
                <Row className="g-3 align-items-end">
                    {/* Chọn lớp */}
                    <Col md={4}>
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
                    
                    {/* Tìm kiếm (Chỉ hiện khi đã chọn lớp) */}
                    {selectedClassId && (
                        <Col md={4}>
                             <Form.Label className="fw-bold">Tìm kiếm sinh viên:</Form.Label>
                             <InputGroup>
                                <InputGroup.Text className="bg-light"><i className="bi bi-search"></i></InputGroup.Text>
                                <Form.Control 
                                    type="text"
                                    placeholder="Nhập tên hoặc MSSV..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                                    }}
                                />
                             </InputGroup>
                        </Col>
                    )}

                    {/* Thống kê số lượng */}
                    <Col md={4} className="text-end align-self-center">
                         {selectedClassId && (
                             <div className="text-muted">
                                 Hiển thị <strong>{filteredStudents.length}</strong> / {students.length} sinh viên
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
                            <th className="text-start ps-4">Sinh viên</th>
                            <th style={{width: '150px'}}>Quá trình (40%)</th>
                            <th style={{width: '150px'}}>Cuối kỳ (60%)</th>
                            <th>Tổng (10)</th>
                            <th>Điểm Chữ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStudents.length > 0 ? currentStudents.map((s) => (
                            <tr key={s.id}>
                                {/* Cột thông tin sinh viên */}
                                <td className="ps-4">
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

                                {/* Điểm tổng kết */}
                                <td className="text-center fw-bold fs-5">
                                    {s.total10 !== null ? s.total10 : "-"}
                                </td>

                                {/* Điểm chữ */}
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
                                        onClick={() => handleSaveRow(s.id, s.midTerm, s.finalExam)}
                                    >
                                        <i className="bi bi-check-lg me-1"></i>Lưu
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">
                                    {loading ? "Đang tải dữ liệu..." : "Không tìm thấy sinh viên phù hợp."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {/* 3. PHÂN TRANG (PAGINATION) */}
                {filteredStudents.length > itemsPerPage && (
                    <div className="d-flex justify-content-end p-3 border-top">
                        <Pagination className="mb-0">
                            <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                            
                            {[...Array(totalPages)].map((_, index) => (
                                <Pagination.Item 
                                    key={index + 1} 
                                    active={index + 1 === currentPage}
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}

                            <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>
                )}
              </Card>
          )}

        </Container>
      </PageFrame>
    </Layout>
  );
};

export default UploadGrades;