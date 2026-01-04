import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Table, Badge, Row, Col, Spinner, Pagination } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const RegistrationManager = () => {
  // State cấu hình thời gian
  const [config, setConfig] = useState({
    startDate: "",
    endDate: "",
    isActive: false
  });
  
  // State danh sách lớp
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // --- STATE BỘ LỌC & PHÂN TRANG (MỚI) ---
  const [semesterFilter, setSemesterFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // ---------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, classesData] = await Promise.all([
        adminApi.getRegistrationConfig(),
        adminApi.getAllClassesConfig()
      ]);

      const formatInputDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
      };

      if (configData) {
        setConfig({
          startDate: formatInputDate(configData.startDate),
          endDate: formatInputDate(configData.endDate),
          isActive: configData.isActive
        });
      }
      setClasses(classesData || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LỌC & PHÂN TRANG ---
  // 1. Lấy danh sách Học kỳ và Năm học duy nhất để tạo Dropdown
  const uniqueSemesters = [...new Set(classes.map(c => c.semester))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(classes.map(c => c.year))].sort((a, b) => b - a); // Năm giảm dần

  // 2. Lọc dữ liệu
  const filteredClasses = classes.filter(cls => {
    const matchSemester = semesterFilter ? cls.semester.toString() === semesterFilter : true;
    const matchYear = yearFilter ? cls.year.toString() === yearFilter : true;
    return matchSemester && matchYear;
  });

  // 3. Phân trang
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // ------------------------------

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await adminApi.setRegistrationConfig(config); // Hoặc setRegistrationPeriod tùy tên hàm trong api của bạn
      alert("Đã cập nhật thời gian đợt đăng ký!");
    } catch (error) {
      alert("Lỗi lưu cấu hình: " + error.message);
    }
  };

  const handleToggleClass = async (classId, currentStatus) => {
    try {
      await adminApi.toggleClassStatus(classId, !currentStatus);
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, isRegistrationOpen: !currentStatus } : c
      ));
    } catch (error) {
      alert("Không thể cập nhật trạng thái lớp!");
    }
  };

  // Hàm xử lý hàng loạt (Đã nâng cấp để dùng với bộ lọc)
  const handleBatchUpdate = async (isOpen) => {
    const actionText = isOpen ? "MỞ" : "KHÓA";
    
    // Cảnh báo rõ ràng hơn về phạm vi tác động
    const scopeText = (semesterFilter || yearFilter) 
        ? "các lớp TRONG DANH SÁCH LỌC hiện tại" 
        : "TẤT CẢ các lớp học phần";

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} đăng ký cho ${scopeText}?`)) {
      return;
    }

    try {
      setUpdating(true);
      
      // Chỉ update những lớp ĐANG HIỂN THỊ (filteredClasses) và có trạng thái khác mong muốn
      const classesToUpdate = filteredClasses.filter(cls => cls.isRegistrationOpen !== isOpen);

      if (classesToUpdate.length === 0) {
        alert("Các lớp trong danh sách lọc đã ở trạng thái này rồi!");
        return;
      }

      await Promise.all(
        classesToUpdate.map(cls => adminApi.toggleClassStatus(cls.id, isOpen))
      );

      // Cập nhật State cục bộ
      setClasses(prev => prev.map(c => {
         // Nếu lớp nằm trong danh sách cần update thì đổi trạng thái
         if (classesToUpdate.find(u => u.id === c.id)) {
             return { ...c, isRegistrationOpen: isOpen };
         }
         return c;
      }));
      
      alert(`Đã ${actionText} đăng ký thành công cho ${classesToUpdate.length} lớp!`);

    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi cập nhật hàng loạt.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Layout>
      <PageFrame title="Quản lý Đăng ký Tín chỉ" subtitle="Thiết lập thời gian và mở lớp học phần">
        <Container fluid className="p-0">
          
          {/* PHẦN 1: CẤU HÌNH THỜI GIAN */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0 fw-bold"><i className="bi bi-clock-history me-2"></i>Thiết lập Thời gian Đăng ký</h6>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSaveConfig}>
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Ngày bắt đầu</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={config.startDate}
                        onChange={(e) => setConfig({...config, startDate: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Ngày kết thúc</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={config.endDate}
                        onChange={(e) => setConfig({...config, endDate: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Trạng thái Cổng</Form.Label>
                      <Form.Check 
                        type="switch"
                        id="portal-switch"
                        label={config.isActive ? "ĐANG MỞ" : "ĐANG ĐÓNG"}
                        checked={config.isActive}
                        onChange={(e) => setConfig({...config, isActive: e.target.checked})}
                        className={config.isActive ? "text-success fw-bold" : "text-danger fw-bold"}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Button type="submit" variant="primary" className="w-100">
                      <i className="bi bi-save me-2"></i>Lưu Cấu hình
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* PHẦN 2: DANH SÁCH LỚP HỌC PHẦN */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-0">
              <Row className="align-items-center g-2">
                {/* Tiêu đề & Tổng số */}
                <Col md={3}>
                    <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-0 fw-bold text-dark">Kiểm soát môn học</h6>
                        <Badge bg="info">{filteredClasses.length} lớp</Badge>
                    </div>
                </Col>

                {/* Bộ lọc Học kỳ & Năm học */}
                <Col md={2}>
                    <Form.Select 
                        size="sm" 
                        value={semesterFilter}
                        onChange={(e) => { setSemesterFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">-- Tất cả Học kỳ --</option>
                        {uniqueSemesters.map(sem => (
                            <option key={sem} value={sem}>Học kỳ {sem}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select 
                        size="sm" 
                        value={yearFilter}
                        onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">-- Tất cả Năm --</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Select>
                </Col>
                
                {/* Nút tác vụ hàng loạt */}
                <Col className="text-end">
                    <div className="d-flex gap-2 justify-content-end">
                        <Button 
                            variant="link" 
                            className="text-decoration-none p-0 me-2 text-success fw-bold small" 
                            onClick={() => handleBatchUpdate(true)}
                            disabled={updating || loading}
                        >
                            Mở tất cả
                        </Button>
                        <Button 
                            variant="link" 
                            className="text-decoration-none p-0 text-danger fw-bold small" 
                            onClick={() => handleBatchUpdate(false)}
                            disabled={updating || loading}
                        >
                            Khóa tất cả
                        </Button>
                    </div>
                </Col>
              </Row>
            </Card.Header>
            
            <Card.Body className="p-0">
                <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light">
                    <tr>
                    <th className="ps-4">MÃ LỚP</th>
                    <th>MÔN HỌC</th>
                    <th>LỊCH HỌC</th>
                    <th className="text-center">SĨ SỐ</th>
                    <th className="text-center">TRẠNG THÁI MỞ</th>
                    <th className="text-end pe-4">HÀNH ĐỘNG</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-4"><Spinner animation="border" /></td></tr>
                    ) : currentItems.length > 0 ? (
                        currentItems.map((cls) => (
                        <tr key={cls.id} className={!cls.isRegistrationOpen ? "table-secondary opacity-75" : ""}>
                            <td className="ps-4 fw-bold">{cls.code}</td>
                            <td>
                            <div className="fw-bold">{cls.course?.name}</div>
                            <small className="text-muted">{cls.course?.code} ({cls.course?.credits} TC) - HK{cls.semester}/{cls.year}</small>
                            </td>
                            <td className="small text-muted" style={{maxWidth: '200px'}}>
                            {Array.isArray(cls.schedule) 
                                ? cls.schedule.map(s => `T${s.day}(${s.slots})`).join(", ") 
                                : "Chưa xếp lịch"}
                            </td>
                            <td className="text-center">
                            {cls.enrolledCount} / {cls.capacity}
                            </td>
                            <td className="text-center">
                            <Badge bg={cls.isRegistrationOpen ? "success" : "secondary"}>
                                {cls.isRegistrationOpen ? "ĐANG MỞ" : "ĐÃ KHÓA"}
                            </Badge>
                            </td>
                            <td className="text-end pe-4">
                            <Form.Check 
                                type="switch"
                                checked={cls.isRegistrationOpen}
                                onChange={() => handleToggleClass(cls.id, cls.isRegistrationOpen)}
                                label=""
                                className="d-inline-block fs-5"
                            />
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">Không có lớp học nào phù hợp.</td></tr>
                    )}
                </tbody>
                </Table>

                {/* THANH PHÂN TRANG */}
                {filteredClasses.length > itemsPerPage && (
                    <div className="d-flex justify-content-end p-3 border-top bg-light bg-opacity-10">
                        <Pagination className="mb-0 shadow-sm">
                            <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => paginate(i+1)}>
                                    {i+1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>
                )}
            </Card.Body>
          </Card>

        </Container>
      </PageFrame>
    </Layout>
  );
};

export default RegistrationManager;