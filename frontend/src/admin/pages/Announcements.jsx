import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; 
import "../../styles/announcements.css";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE CHO MODAL & FORM ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    audience: "all"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ LOGIC ---
  const handleShowCreate = () => {
    setIsEditing(false);
    setFormData({ title: "", content: "", priority: "normal", audience: "all" });
    setShowModal(true);
  };

  const handleShowEdit = (a) => {
    setIsEditing(true);
    setCurrentId(a.id);
    setFormData({
      title: a.title,
      content: a.content,
      priority: a.priority,
      audience: a.audience
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa thông báo này?")) {
      try {
        await adminApi.deleteAnnouncement(id);
        loadData(); // Tải lại danh sách
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content) return alert("Vui lòng nhập đủ thông tin!");

      if (isEditing) {
        await adminApi.updateAnnouncement(currentId, formData);
        alert("Cập nhật thành công!");
      } else {
        await adminApi.createAnnouncement(formData);
        alert("Đăng thông báo thành công!");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  // --- GIAO DIỆN CHÍNH (GIỮ NGUYÊN STYLE CŨ) ---
  return (
    <Layout>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Quản lý Thông báo</h2>
          {/* Sửa onClick: Mở Modal thay vì chuyển trang */}
          <Button onClick={handleShowCreate} variant="primary">
            + Đăng thông báo mới
          </Button>
        </div>

        {loading ? (
           <div className="text-center">Đang tải...</div>
        ) : announcements.length > 0 ? (
          <Row>
            {announcements.map((a) => (
              <Col xs={12} key={a.id} className="mb-3">
                {/* Giữ nguyên class style cũ của bạn */}
                <Card className={`announcement-card priority-${a.priority} shadow-sm`}>
<Card.Header className="bg-white d-flex justify-content-between align-items-center py-2">
  {/* Phần tiêu đề bên trái */}
  <div className="d-flex align-items-center gap-2" style={{ maxWidth: "70%" }}>
    <h5 className="mb-0 text-truncate">{a.title}</h5>
    <Badge bg={a.priority === 'high' ? 'danger' : (a.priority === 'low' ? 'secondary' : 'primary')}>
      {a.priority.toUpperCase()}
    </Badge>
  </div>

  {/* Phần nút bấm bên phải (Đã thêm chữ để dễ nhìn) */}
  <div className="d-flex gap-2">
    <Button 
      variant="outline-primary" 
      size="sm" 
      onClick={() => handleShowEdit(a)}
      style={{ minWidth: "60px" }} // Đảm bảo nút có độ rộng
    >
      <i className="bi bi-pencil me-1"></i> Sửa
    </Button>
    
    <Button 
      variant="outline-danger" 
      size="sm" 
      onClick={() => handleDelete(a.id)}
      style={{ minWidth: "60px" }}
    >
      <i className="bi bi-trash me-1"></i> Xóa
    </Button>
  </div>
</Card.Header>
                  <Card.Body>
                    <p className="card-text" style={{whiteSpace: "pre-line"}}>{a.content}</p>
<div className="d-flex justify-content-between text-muted small mt-3 border-top pt-2">
    <span>Đối tượng: <strong>{a.audience === 'all' ? 'Tất cả' : (a.audience === 'students' ? 'Sinh viên' : 'Giảng viên')}</strong></span>
    
    {/* SỬA ĐOẠN HIỂN THỊ NGÀY GIỜ TẠI ĐÂY */}
    <span>
        <i className="bi bi-clock-history me-1"></i>
        Cập nhật: {new Date(a.postedAt).toLocaleString("vi-VN", {
            hour: '2-digit', 
            minute: '2-digit', 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric'
        })}
    </span>
</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
            <p className="text-center text-muted">Chưa có thông báo nào.</p>
        )}
      </Container>

      {/* --- MODAL (THÊM MỚI VÀO ĐỂ NHẬP LIỆU) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>{isEditing ? "Chỉnh sửa thông báo" : "Đăng thông báo mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Tiêu đề</Form.Label>
                    <Form.Control 
                        type="text" value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Nội dung</Form.Label>
                    <Form.Control 
                        as="textarea" rows={4} value={formData.content} 
                        onChange={e => setFormData({...formData, content: e.target.value})} 
                    />
                </Form.Group>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mức độ</Form.Label>
                            <Form.Select 
                                value={formData.priority} 
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="normal">Bình thường</option>
                                <option value="high">Quan trọng (High)</option>
                                <option value="low">Thấp (Low)</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Đối tượng</Form.Label>
                            <Form.Select 
                                value={formData.audience} 
                                onChange={e => setFormData({...formData, audience: e.target.value})}
                            >
                                <option value="all">Tất cả</option>
                                <option value="students">Sinh viên</option>
                                <option value="teachers">Giảng viên</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Lưu thông báo</Button>
        </Modal.Footer>
      </Modal>

    </Layout>
  );
};

export default Announcements;