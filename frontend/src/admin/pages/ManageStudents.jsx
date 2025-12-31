import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Import API

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State form thêm mới
  const [formData, setFormData] = useState({
    code: "", name: "", email: "", password: "",
    year: 1, majorId: 1, curriculumId: 1
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Gọi API tạo mới (Backend cần có route POST /admin/students)
      await adminApi.createStudent({
        ...formData,
        year: parseInt(formData.year),
        majorId: parseInt(formData.majorId),
        curriculumId: parseInt(formData.curriculumId)
      });
      setShowModal(false);
      loadStudents(); // Load lại bảng
      alert("Thêm sinh viên thành công!");
    } catch (error) {
      alert("Lỗi thêm sinh viên: " + error.response?.data?.message);
    }
  };

  return (
    <Layout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Quản lý Sinh viên</h2>
          <Button onClick={() => setShowModal(true)}>+ Thêm Sinh viên</Button>
        </div>

        <Card className="shadow-sm">
          <Table hover responsive>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Niên khóa</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Đang tải...</td></tr>
              ) : students.length > 0 ? (
                students.map((sv) => (
                  <tr key={sv.id}>
                    <td>{sv.code}</td>
                    <td>{sv.name}</td>
                    <td>{sv.email}</td>
                    <td>{sv.year}</td>
                    <td><Badge bg={sv.isActive ? 'success' : 'secondary'}>{sv.isActive ? 'Đang học' : 'Nghỉ'}</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2">Sửa</Button>
                      <Button size="sm" variant="outline-danger">Xóa</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">Chưa có sinh viên nào</td></tr>
              )}
            </tbody>
          </Table>
        </Card>

        {/* MODAL THÊM SINH VIÊN */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Form onSubmit={handleSave}>
            <Modal.Header closeButton>
              <Modal.Title>Thêm sinh viên mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>MSSV</Form.Label>
                <Form.Control required onChange={e => setFormData({...formData, code: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control required onChange={e => setFormData({...formData, name: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mặc định</Form.Label>
                <Form.Control type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
              </Form.Group>
              <Row>
                  <Col>
                    <Form.Group className="mb-3">
                        <Form.Label>Năm thứ</Form.Label>
                        <Form.Control type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                    </Form.Group>
                  </Col>
                  {/* Có thể thêm Select box cho MajorId nếu có API getMajors */}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
              <Button variant="primary" type="submit">Lưu</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};

export default ManageStudents;