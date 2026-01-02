import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Tabs, Tab } from "react-bootstrap";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // API

const ManageCourses = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  
  // Forms
  const [courseForm, setCourseForm] = useState({ code: "", name: "", credits: 3 });
  const [classForm, setClassForm] = useState({ 
    code: "", courseId: "", semester: 1, year: 2025, capacity: 50, 
    day: "T2", slots: "1-3", room: "101" 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, classesData] = await Promise.all([
        adminApi.getAllCourses(),
        adminApi.getAllClasses()
      ]);
      setCourses(coursesData);
      setClasses(classesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCourse({ ...courseForm, credits: parseInt(courseForm.credits) });
      setShowCourseModal(false);
      loadData();
      alert("Thêm môn học thành công");
    } catch (err) { alert("Lỗi: " + err.message); }
  };

// src/admin/pages/ManageCourses.jsx

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      // 1. Xử lý chuỗi "1-3" thành mảng [1, 2, 3]
      const processSlots = (slotStr) => {
        if (slotStr.includes('-')) {
            const [start, end] = slotStr.split('-').map(Number);
            const range = [];
            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        }
        // Nếu nhập kiểu "1,2,3" hoặc số đơn "1"
        return slotStr.split(',').map(Number);
      };

      const scheduleJSON = [{
        day: classForm.day, // VD: "T2"
        slots: processSlots(classForm.slots), // SỬA TẠI ĐÂY: Dùng hàm processSlots
        room: classForm.room
      }];

      await adminApi.createClass({
        code: classForm.code,
        courseId: parseInt(classForm.courseId),
        semester: parseInt(classForm.semester),
        year: parseInt(classForm.year),
        capacity: parseInt(classForm.capacity),
        schedule: scheduleJSON
      });
      setShowClassModal(false);
      loadData();
      alert("Thêm lớp thành công");
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  // [MỚI] Hàm xử lý xóa lớp
const handleDeleteClass = async (id, code) => {
    // Cảnh báo gắt hơn
    if (window.confirm(`CẢNH BÁO: Lớp ${code} có thể đang có sinh viên theo học.\n\nHành động xóa này sẽ:\n1. Xóa vĩnh viễn lớp học.\n2. Hủy đăng ký của tất cả sinh viên trong lớp.\n3. XÓA TOÀN BỘ ĐIỂM SỐ của sinh viên trong lớp này.\n\nBạn có chắc chắn muốn tiếp tục?`)) {
        try {
            await adminApi.deleteClass(id);
            alert("Đã xóa lớp và dọn dẹp dữ liệu thành công!");
            loadData();
        } catch (err) {
            alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
        }
    }
};

  // Helper hiển thị lịch
  const renderSchedule = (sch) => {
    if(Array.isArray(sch)) return sch.map(s => `${s.day} (${s.slots.join('-')}) phòng ${s.room}`).join('; ');
    return JSON.stringify(sch);
  };

  return (
    <Layout>
      <Container fluid className="py-4">
        <h2 className="mb-4">Quản lý Đào tạo</h2>
        
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          {/* TAB MÔN HỌC */}
          <Tab eventKey="courses" title="Danh mục Môn học">
            <Button className="mb-3" onClick={() => setShowCourseModal(true)}>+ Thêm Môn học</Button>
            <Card className="shadow-sm">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light"><tr><th>Mã môn</th><th>Tên môn</th><th>Tín chỉ</th></tr></thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.code}</td>
                      <td>{c.name}</td>
                      <td>{c.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Tab>

          {/* TAB LỚP HỌC PHẦN */}
          <Tab eventKey="classes" title="Lớp học phần (Mở lớp)">
             <Button className="mb-3" onClick={() => setShowClassModal(true)}>+ Mở Lớp mới</Button>
             <Card className="shadow-sm">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light">
                    <tr>
                        <th>Mã lớp</th>
                        <th>Môn học</th>
                        <th>HK/Năm</th>
                        <th>Lịch học</th>
                        <th>Sĩ số</th>
                        <th className="text-end">Hành động</th> {/* [MỚI] Thêm cột Action */}
                    </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.code}</td>
                      <td>{c.course?.name}</td>
                      <td>{c.semester}/{c.year}</td>
                      <td className="small text-muted">{renderSchedule(c.schedule)}</td>
                      <td>
                        <Badge bg={c.enrolledCount >= c.capacity ? "danger" : "success"}>
                            {c.enrolledCount}/{c.capacity}
                        </Badge>
                      </td>
                      {/* [MỚI] Nút Xóa */}
                      <td className="text-end">
                        <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDeleteClass(c.id, c.code)}
                        >
                            <i className="bi bi-trash"></i> Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                      <tr><td colSpan="6" className="text-center text-muted py-3">Chưa có lớp học phần nào</td></tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Tab>
        </Tabs>

        {/* MODAL THÊM MÔN */}
        <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)}>
          <Form onSubmit={handleAddCourse}>
            <Modal.Header closeButton><Modal.Title>Thêm Môn học</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3"><Form.Label>Mã môn (VD: INT3306)</Form.Label>
                <Form.Control required onChange={e => setCourseForm({...courseForm, code: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3"><Form.Label>Tên môn</Form.Label>
                <Form.Control required onChange={e => setCourseForm({...courseForm, name: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3"><Form.Label>Số tín chỉ</Form.Label>
                <Form.Control type="number" required onChange={e => setCourseForm({...courseForm, credits: e.target.value})} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer><Button type="submit">Lưu</Button></Modal.Footer>
          </Form>
        </Modal>

        {/* MODAL THÊM LỚP */}
        <Modal show={showClassModal} onHide={() => setShowClassModal(false)}>
           <Form onSubmit={handleAddClass}>
            <Modal.Header closeButton><Modal.Title>Mở Lớp học phần</Modal.Title></Modal.Header>
            <Modal.Body>
               <Row>
                 <Col><Form.Group className="mb-3"><Form.Label>Mã lớp (VD: INT3306 1)</Form.Label>
                    <Form.Control required onChange={e => setClassForm({...classForm, code: e.target.value})} />
                 </Form.Group></Col>
                 <Col><Form.Group className="mb-3"><Form.Label>Môn học (ID)</Form.Label>
                    <Form.Select onChange={e => setClassForm({...classForm, courseId: e.target.value})}>
                        <option>Chọn môn...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </Form.Select>
                 </Form.Group></Col>
               </Row>
               <Row>
                 <Col><Form.Group className="mb-3"><Form.Label>Học kỳ</Form.Label>
                    <Form.Control type="number" value={classForm.semester} onChange={e => setClassForm({...classForm, semester: e.target.value})} />
                 </Form.Group></Col>
                 <Col><Form.Group className="mb-3"><Form.Label>Năm học</Form.Label>
                    <Form.Control type="number" value={classForm.year} onChange={e => setClassForm({...classForm, year: e.target.value})} />
                 </Form.Group></Col>
               </Row>
               <Form.Label>Lịch học</Form.Label>
               <Row>
                  <Col md={4}><Form.Control placeholder="Thứ (VD: T2)" onChange={e => setClassForm({...classForm, day: e.target.value})} /></Col>
                  <Col md={4}><Form.Control placeholder="Tiết (VD: 1-3)" onChange={e => setClassForm({...classForm, slots: e.target.value})} /></Col>
                  <Col md={4}><Form.Control placeholder="Phòng" onChange={e => setClassForm({...classForm, room: e.target.value})} /></Col>
               </Row>
            </Modal.Body>
            <Modal.Footer><Button type="submit">Lưu</Button></Modal.Footer>
           </Form>
        </Modal>

      </Container>
    </Layout>
  );
};
export default ManageCourses;