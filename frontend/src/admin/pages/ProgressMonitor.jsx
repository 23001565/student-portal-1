import React, { useState, useEffect } from "react";
import { Container, Card, Table, Badge, Button, Row, Col, Form, Pagination, Spinner } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const AcademicProgress = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ BỘ LỌC & PHÂN TRANG ---
  const [statusFilter, setStatusFilter] = useState('all'); // all, warning, danger
  const [classFilter, setClassFilter] = useState('');      // Lọc theo lớp
  const [majorFilter, setMajorFilter] = useState('');      // Lọc theo ngành
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Số lượng hiển thị mỗi trang

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API lấy toàn bộ dữ liệu tiến độ
        const response = await adminApi.getAcademicProgress(); 
        setData(response);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. TẠO DANH SÁCH LỰA CHỌN CHO DROPDOWN (Lấy duy nhất)
  // Set giúp loại bỏ các giá trị trùng lặp
  const uniqueClasses = [...new Set(data.map(item => item.class))].sort();
  const uniqueMajors = [...new Set(data.map(item => item.major))].sort();

  // 2. XỬ LÝ LỌC DỮ LIỆU
  const filteredData = data.filter(item => {
    // Lọc theo Trạng thái (Nút bấm)
    const matchStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'warning' 
        ? item.status === 'warning' 
        : item.status === 'danger';

    // Lọc theo Lớp (Dropdown)
    const matchClass = classFilter ? item.class === classFilter : true;

    // Lọc theo Ngành (Dropdown)
    const matchMajor = majorFilter ? item.major === majorFilter : true;

    return matchStatus && matchClass && matchMajor;
  });

  // 3. XỬ LÝ PHÂN TRANG
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper hiển thị trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'danger': return <Badge bg="danger">NGUY CƠ THÔI HỌC</Badge>;
      case 'warning': return <Badge bg="warning" text="dark">CẢNH BÁO HỌC VỤ</Badge>;
      default: return <Badge bg="success">Bình thường</Badge>;
    }
  };

  return (
    <Layout>
      <PageFrame title="Theo dõi Tiến độ học tập" subtitle="Giám sát GPA và Cảnh báo học vụ">
        <Container fluid className="p-0">
          
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              {/* --- KHU VỰC BỘ LỌC --- */}
              <Row className="g-3 mb-4">
                {/* Nhóm lọc trạng thái (Buttons) */}
                <Col md={12} lg={5}>
                  <label className="form-label fw-bold d-block">Trạng thái hồ sơ:</label>
                  <div className="btn-group" role="group">
                    <Button 
                      variant={statusFilter === 'all' ? "success" : "outline-secondary"} 
                      onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                    >
                      Tất cả
                    </Button>
                    <Button 
                      variant={statusFilter === 'warning' ? "warning" : "outline-secondary"} 
                      onClick={() => { setStatusFilter('warning'); setCurrentPage(1); }}
                    >
                      Cảnh báo
                    </Button>
                    <Button 
                      variant={statusFilter === 'danger' ? "danger" : "outline-secondary"} 
                      onClick={() => { setStatusFilter('danger'); setCurrentPage(1); }}
                    >
                      Nguy cơ
                    </Button>
                  </div>
                </Col>

                {/* Nhóm lọc chi tiết (Dropdowns) */}
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Lọc theo Lớp:</Form.Label>
                    <Form.Select 
                      value={classFilter} 
                      onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">-- Tất cả lớp --</option>
                      {uniqueClasses.map((cls, idx) => (
                        <option key={idx} value={cls}>{cls}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Lọc theo Ngành:</Form.Label>
                    <Form.Select 
                      value={majorFilter} 
                      onChange={(e) => { setMajorFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">-- Tất cả ngành --</option>
                      {uniqueMajors.map((m, idx) => (
                        <option key={idx} value={m}>{m}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* --- BẢNG DỮ LIỆU --- */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Đang tính toán GPA...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th>MSSV</th>
                          <th>SINH VIÊN</th>
                          <th>LỚP / NGÀNH</th>
                          <th className="text-center">GPA TÍCH LŨY</th>
                          <th className="text-center">TÍN CHỈ TÍCH LŨY</th>
                          <th className="text-center">TC NỢ</th>
                          <th className="text-end">TRẠNG THÁI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length > 0 ? (
                          currentItems.map((sv) => (
                            <tr key={sv.id}>
                              <td className="fw-bold">{sv.code}</td>
                              <td className="fw-semibold">{sv.name}</td>
                              <td>
                                <div className="small fw-bold">{sv.class}</div>
                                <div className="small text-muted">{sv.major}</div>
                              </td>
                              <td className="text-center">
                                <span className={`fw-bold ${sv.gpa < 2.0 ? 'text-danger' : 'text-success'}`}>
                                  {sv.gpa}
                                </span>
                                {/* Thanh tiến trình GPA nhỏ */}
                                <div className="progress mt-1" style={{height: '4px', width: '60px', margin: '0 auto'}}>
                                  <div 
                                    className={`progress-bar ${sv.gpa < 2.0 ? 'bg-danger' : 'bg-success'}`} 
                                    role="progressbar" 
                                    style={{width: `${(sv.gpa/4)*100}%`}}
                                  ></div>
                                </div>
                              </td>
                              <td className="text-center">{sv.totalCredits}</td>
                              <td className="text-center text-danger fw-bold">{sv.failedCredits}</td>
                              <td className="text-end">{getStatusBadge(sv.status)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              Không tìm thấy sinh viên nào phù hợp với bộ lọc.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* --- THANH PHÂN TRANG --- */}
                  {filteredData.length > itemsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="small text-muted">
                        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} trên tổng số {filteredData.length} sinh viên
                      </div>
                      <Pagination>
                        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                        
                        {/* Logic hiển thị số trang rút gọn nếu quá nhiều trang */}
                        {[...Array(totalPages)].map((_, index) => {
                           const page = index + 1;
                           // Chỉ hiện trang đầu, trang cuối, và các trang xung quanh trang hiện tại
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

                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
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

export default AcademicProgress;