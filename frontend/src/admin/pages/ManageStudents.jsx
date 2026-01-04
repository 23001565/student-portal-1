import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Form, Row, Col, Badge, Pagination, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const ManageStudent = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE BỘ LỌC & PHÂN TRANG ---
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Hiển thị 10 sv mỗi trang

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminApi.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Lỗi tải danh sách sinh viên:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. TẠO DANH SÁCH LỰA CHỌN CHO FILTER (Lấy duy nhất)
  const uniqueClasses = [...new Set(students.map(s => s.className).filter(Boolean))].sort();
  const uniqueMajors = [...new Set(students.map(s => s.major?.name).filter(Boolean))].sort();

  // 2. LOGIC LỌC DỮ LIỆU
  const filteredStudents = students.filter(student => {
    // Tìm kiếm tương đối theo Tên, MSSV hoặc Email
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      student.name.toLowerCase().includes(searchLower) || 
      student.code.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower);

    // Lớp và Ngành khớp chính xác
    const matchClass = classFilter ? student.className === classFilter : true;
    const matchMajor = majorFilter ? student.major?.name === majorFilter : true;

    return matchSearch && matchClass && matchMajor;
  });

  // 3. LOGIC PHÂN TRANG
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <PageFrame title="Quản lý Sinh viên" subtitle="Danh sách sinh viên toàn trường">
        <Container fluid className="p-0">
          <Card className="shadow-sm border-0">
            
            {/* HEADER: Gồm nút thêm và Bộ lọc */}
            <Card.Header className="bg-white py-4 border-0">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold text-dark">Danh sách sinh viên</h5>
                    <Button variant="success" onClick={() => navigate('/admin/students/add')}>
                        <i className="bi bi-plus-lg me-2"></i>Thêm Sinh viên
                    </Button>
                </div>

                {/* THANH CÔNG CỤ LỌC */}
                <Row className="g-3">
                    <Col md={4}>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Tìm theo tên, MSSV, email..."
                                className="border-start-0 bg-light"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={classFilter}
                            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">-- Tất cả lớp --</option>
                            {uniqueClasses.map((cls, idx) => (
                                <option key={idx} value={cls}>{cls}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={majorFilter}
                            onChange={(e) => { setMajorFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">-- Tất cả ngành --</option>
                            {uniqueMajors.map((m, idx) => (
                                <option key={idx} value={m}>{m}</option>
                            ))}
                        </Form.Select>
                    </Col>
                     <Col md={2} className="text-end align-self-center">
                        <span className="text-muted small">
                            Kết quả: <b>{filteredStudents.length}</b> SV
                        </span>
                    </Col>
                </Row>
            </Card.Header>

            <Card.Body className="p-0">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="success" />
                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">MSSV</th>
                                        <th>HỌ TÊN</th>
                                        <th>EMAIL</th>
                                        <th>LỚP / NGÀNH</th>
                                        <th className="text-center">TRẠNG THÁI</th>
                                        <th className="text-end pe-4">HÀNH ĐỘNG</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStudents.length > 0 ? (
                                        currentStudents.map((sv) => (
                                            <tr key={sv.id}>
                                                <td className="ps-4 fw-bold">{sv.code}</td>
                                                <td className="fw-semibold">{sv.name}</td>
                                                <td>{sv.email}</td>
                                                <td>
                                                    <div className="fw-bold small">{sv.className}</div>
                                                    <div className="text-muted small" style={{fontSize: '0.85rem'}}>
                                                        {sv.major?.name}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg="success" className="px-3 py-2 rounded-pill fw-normal">
                                                        ĐANG HỌC
                                                    </Badge>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button 
                                                        variant="link" 
                                                        size="sm" 
                                                        className="text-decoration-none text-primary fw-bold"
                                                        onClick={() => navigate(`/admin/students/${sv.id}`)}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted fst-italic">
                                                Không tìm thấy sinh viên nào phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {/* THANH PHÂN TRANG */}
                        {filteredStudents.length > itemsPerPage && (
                            <div className="d-flex justify-content-end p-3 border-top bg-light bg-opacity-10">
                                <Pagination className="mb-0 shadow-sm">
                                    <Pagination.Prev 
                                        onClick={() => paginate(currentPage - 1)} 
                                        disabled={currentPage === 1} 
                                    />
                                    
                                    {/* Logic hiển thị trang thông minh (Rút gọn nếu quá nhiều trang) */}
                                    {[...Array(totalPages)].map((_, idx) => {
                                        const page = idx + 1;
                                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                            return (
                                                <Pagination.Item 
                                                    key={page} 
                                                    active={page === currentPage}
                                                    onClick={() => paginate(page)}
                                                >
                                                    {page}
                                                </Pagination.Item>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <Pagination.Ellipsis key={page} disabled />;
                                        }
                                        return null;
                                    })}

                                    <Pagination.Next 
                                        onClick={() => paginate(currentPage + 1)} 
                                        disabled={currentPage === totalPages} 
                                    />
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </Card.Body>
          </Card>
        </Container>
      </PageFrame>
    </Layout>
  );
};

export default ManageStudent;