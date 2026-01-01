import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const CreateStudent = () => {
  const navigate = useNavigate();
  
  // State lưu danh sách lựa chọn
  const [majors, setMajors] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // State form
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    className: "",
    phone: "",
    gender: "Nam",
    year: new Date().getFullYear(),
    majorId: "",       // Để rỗng ban đầu, bắt buộc user phải chọn
    curriculumId: ""   // Để rỗng ban đầu
  });

  // 1. Tải danh sách Ngành & CTĐT ngay khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [majorsData, curriculumsData] = await Promise.all([
          adminApi.getAllMajors(),
          adminApi.getAllCurriculums()
        ]);
        setMajors(majorsData);
        setCurriculums(curriculumsData);
        
        // (Tùy chọn) Tự động chọn cái đầu tiên nếu có dữ liệu để đỡ phải click
        if (majorsData.length > 0) setFormData(prev => ({ ...prev, majorId: majorsData[0].id }));
        if (curriculumsData.length > 0) setFormData(prev => ({ ...prev, curriculumId: curriculumsData[0].id }));

      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: Kiểm tra xem đã chọn ngành chưa
    if (!formData.majorId || !formData.curriculumId) {
        alert("Vui lòng chọn Ngành học và Chương trình đào tạo!");
        return;
    }

    try {
      // Convert ID sang số nguyên trước khi gửi (quan trọng)
      const payload = {
          ...formData,
          majorId: parseInt(formData.majorId),
          curriculumId: parseInt(formData.curriculumId),
          year: parseInt(formData.year)
      };

      await adminApi.createStudent(payload);
      alert("Thêm sinh viên thành công!");
      navigate("/admin/students");
    } catch (error) {
      alert("Lỗi thêm mới: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Layout>
      <PageFrame title="Thêm Sinh viên mới" subtitle="Nhập thông tin để tạo tài khoản">
        <Container className="p-0" style={{ maxWidth: '800px' }}>
          
          {/* Cảnh báo nếu chưa có dữ liệu danh mục */}
          {!loadingData && majors.length === 0 && (
              <Alert variant="warning">
                  Hệ thống chưa có Ngành học nào. Vui lòng tạo Ngành học trước khi thêm sinh viên!
              </Alert>
          )}

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-bold">Mã Sinh viên <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      required placeholder="VD: SV2025001"
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-bold">Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="email" required placeholder="VD: sv@school.edu"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label className="fw-bold">Họ và tên <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      required placeholder="Nhập họ tên đầy đủ"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </Col>
                  
                  {/* --- PHẦN SELECT ĐỘNG --- */}
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-bold">Ngành học <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                        required
                        value={formData.majorId}
                        onChange={(e) => setFormData({...formData, majorId: e.target.value})}
                    >
                        <option value="">-- Chọn ngành --</option>
                        {majors.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </Form.Select>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-bold">Chương trình đào tạo <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                        required
                        value={formData.curriculumId}
                        onChange={(e) => setFormData({...formData, curriculumId: e.target.value})}
                    >
                        <option value="">-- Chọn CTĐT --</option>
                        {curriculums.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Form.Select>
                  </Col>
                  {/* ----------------------- */}

                  <Col md={6} className="mb-3">
                    <Form.Label>Lớp sinh hoạt</Form.Label>
                    <Form.Control 
                      placeholder="VD: K65-CNTT"
                      value={formData.className} 
                      onChange={(e) => setFormData({...formData, className: e.target.value})}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Niên khóa</Form.Label>
                    <Form.Control 
                      type="number"
                      value={formData.year} 
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
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
                  <Col md={6} className="mb-3">
                     <Form.Label>Số điện thoại</Form.Label>
                     <Form.Control 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     />
                  </Col>
                </Row>
                
                <div className="mt-4 d-flex gap-2 justify-content-end">
                  <Button variant="secondary" onClick={() => navigate("/admin/students")}>
                    Hủy bỏ
                  </Button>
                  <Button variant="success" type="submit" disabled={majors.length === 0}>
                    <i className="bi bi-plus-lg me-2"></i>Tạo Sinh viên
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

export default CreateStudent;