import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Table, Badge, Row, Col, Alert } from "react-bootstrap";
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Gọi song song 2 API: Lấy cấu hình & Lấy danh sách lớp
      const [configData, classesData] = await Promise.all([
        adminApi.getRegistrationConfig(),
        adminApi.getAllClassesConfig()
      ]);

      // Format ngày để hiển thị đúng trong input type="date" (YYYY-MM-DD)
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
      setClasses(classesData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lưu cấu hình thời gian
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await adminApi.setRegistrationConfig(config);
      alert("Đã cập nhật cấu hình đợt đăng ký!");
    } catch (error) {
      alert("Lỗi lưu cấu hình: " + error.message);
    }
  };

  // Xử lý bật/tắt từng lớp
  const handleToggleClass = async (classId, currentStatus) => {
    try {
      // Gọi API cập nhật
      await adminApi.toggleClassStatus(classId, !currentStatus);
      
      // Cập nhật State giao diện ngay lập tức (Optimistic UI)
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, isRegistrationOpen: !currentStatus } : c
      ));
    } catch (error) {
      alert("Không thể cập nhật trạng thái lớp!");
    }
  };

  return (
    <Layout>
      <PageFrame title="Quản lý Đăng ký Tín chỉ" subtitle="Cấu hình thời gian và mở lớp học phần">
        <Container fluid className="p-0">
          
          {/* PHẦN 1: CẤU HÌNH THỜI GIAN CHUNG */}
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
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-dark">Kiểm soát môn học được phép đăng ký</h6>
                <Badge bg="info">Tổng: {classes.length} lớp</Badge>
              </div>
            </Card.Header>
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Mã lớp</th>
                  <th>Môn học</th>
                  <th>Lịch học</th>
                  <th className="text-center">Sĩ số</th>
                  <th className="text-center">Trạng thái mở</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className={!cls.isRegistrationOpen ? "table-secondary opacity-75" : ""}>
                    <td className="fw-bold">{cls.code}</td>
                    <td>
                      <div>{cls.course?.name}</div>
                      <small className="text-muted">{cls.course?.code} - {cls.course?.credits} TC</small>
                    </td>
                    <td className="small text-muted" style={{maxWidth: '200px'}}>
                         {/* Hàm hiển thị JSON schedule của bạn */}
                         {Array.isArray(cls.schedule) 
                            ? cls.schedule.map(s => `T${s.day}(${s.slots})`).join(", ") 
                            : "Chưa xếp lịch"}
                    </td>
                    <td className="text-center">
                      {cls.enrolledCount} / {cls.capacity}
                    </td>
                    <td className="text-center">
                      <Badge bg={cls.isRegistrationOpen ? "success" : "danger"}>
                        {cls.isRegistrationOpen ? "Cho phép" : "Đã khóa"}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Form.Check 
                        type="switch"
                        checked={cls.isRegistrationOpen}
                        onChange={() => handleToggleClass(cls.id, cls.isRegistrationOpen)}
                        label=""
                        className="d-inline-block"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {classes.length === 0 && !loading && (
              <div className="text-center py-5 text-muted">Chưa có lớp học phần nào.</div>
            )}
          </Card>

        </Container>
      </PageFrame>
    </Layout>
  );
};

export default RegistrationManager;