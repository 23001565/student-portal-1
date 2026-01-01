import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    code: "",
    className: "",
    phone: "",
    gender: "Nam",
    password: "" // [MỚI] Trường password
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await adminApi.getStudentById(id);
        setFormData({
            name: data.name,
            email: data.email,
            code: data.code,
            className: data.className || "",
            phone: data.phone || "",
            gender: data.gender || "Nam",
            password: "" // Luôn để rỗng khi mới load lên (không hiển thị pass cũ vì đã mã hóa)
        });
      } catch (error) {
        alert("Lỗi tải dữ liệu sinh viên");
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateStudent(id, formData);
      alert("Cập nhật thành công!");
      navigate(`/admin/students/${id}`);
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  return (
    <Layout>
      <PageFrame title="Chỉnh sửa Sinh viên" subtitle="Cập nhật thông tin hồ sơ">
        <Container className="p-0" style={{maxWidth: '800px'}}>
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label>Mã Sinh viên</Form.Label>
                                <Form.Control value={formData.code} disabled className="bg-light"/>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control value={formData.email} disabled className="bg-light"/>
                            </Col>
                            
                            {/* [MỚI] Ô NHẬP PASSWORD */}
                            <Col md={12} className="mb-3">
                                <Form.Label className="fw-bold text-primary">Đặt lại mật khẩu (Tùy chọn)</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Chỉ nhập nếu muốn đổi mật khẩu mới..."
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </Col>
                            
                            <Col md={12} className="mb-3">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Lớp sinh hoạt</Form.Label>
                                <Form.Control 
                                    value={formData.className} 
                                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Giới tính</Form.Label>
                                <Form.Select 
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <div className="mt-4 d-flex gap-2 justify-content-end">
                            <Button variant="secondary" onClick={() => navigate(`/admin/students/${id}`)}>
                                Hủy bỏ
                            </Button>
                            <Button variant="primary" type="submit">
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
      </PageFrame>
    </Layout>
  );
};

export default EditStudent;