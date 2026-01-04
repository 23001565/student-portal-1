import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Tabs, Tab, Pagination, InputGroup, Spinner } from "react-bootstrap";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi";

const ManageCourses = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE BỘ LỌC & PHÂN TRANG ---
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // ---------------------------------

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

  // Reset trang và tìm kiếm khi chuyển Tab
  useEffect(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, [activeTab]);

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

  // --- XỬ LÝ LỌC & PHÂN TRANG ---
  const sourceData = activeTab === "courses" ? courses : classes;

  const filteredData = sourceData.filter(item => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "courses") {
      return item.code.toLowerCase().includes(term) || item.name.toLowerCase().includes(term);
    } else {
      return (
        item.code.toLowerCase().includes(term) || 
        item.course?.code.toLowerCase().includes(term) || 
        item.course?.name.toLowerCase().includes(term)
      );
    }
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // ------------------------------

  // --- CÁC HÀM XỬ LÝ (HANDLERS) ---

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCourse({ ...courseForm, credits: parseInt(courseForm.credits) });
      setShowCourseModal(false);
      loadData();
      alert("Thêm môn học thành công");
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  // [MỚI] Hàm xóa môn học
  const handleDeleteCourse = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa môn học ${code} không?\nLưu ý: Chỉ xóa được khi môn này chưa có lớp học phần nào.`)) {
        try {
            await adminApi.deleteCourse(id);
            alert("Đã xóa môn học thành công!");
            loadData(); 
        } catch (err) {
            alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
        }
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!classForm.courseId || classForm.courseId === "") {
        alert("Vui lòng chọn Môn học gốc trước khi mở lớp!");
        return;
    }

    try {
      const processSlots = (slotStr) => {
        if (!slotStr) return [];
        if (slotStr.includes('-')) {
            const [start, end] = slotStr.split('-').map(Number);
            const range = [];
            for (let i = start; i <= end; i++) range.push(i);
            return range;
        }
        return slotStr.split(',').map(Number);
      };

      const scheduleJSON = [{
        day: classForm.day,
        slots: processSlots(classForm.slots),
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
    } catch (err) { 
        console.error(err);
        alert("Lỗi: " + (err.response?.data?.message || err.message)); 
    }
  };

  const handleDeleteClass = async (id, code) => {
    if (window.confirm(`CẢNH BÁO: Lớp ${code} có thể đang có sinh viên theo học.\nXóa lớp sẽ xóa toàn bộ điểm số và đăng ký.\nBạn có chắc chắn không?`)) {
        try {
            await adminApi.deleteClass(id);
            alert("Đã xóa lớp thành công!");
            loadData();
        } catch (err) {
            alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
        }
    }
  };

  const renderSchedule = (sch) => {
    if(Array.isArray(sch)) return sch.map(s => `${s.day} (${s.slots.join('-')}) phòng ${s.room}`).join('; ');
    return JSON.stringify(sch);
  };

  return (
    <Layout>
      <Container fluid className="py-4">
        <h2 className="mb-4">Quản lý Đào tạo</h2>
        
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs">
          
          {/* TAB 1: DANH MỤC MÔN HỌC */}
          <Tab eventKey="courses" title="Danh mục Môn học">
            <Card className="shadow-sm border-0">
               <Card.Header className="bg-white border-bottom-0 py-3">
                   <div className="d-flex justify-content-between align-items-center">
                       <Button variant="primary" onClick={() => setShowCourseModal(true)}>+ Thêm Môn học</Button>
                       <div style={{ width: '300px' }}>
                           <InputGroup>
                               <InputGroup.Text className="bg-light"><i className="bi bi-search"></i></InputGroup.Text>
                               <Form.Control 
                                   placeholder="Tìm theo Mã môn..." 
                                   value={searchTerm}
                                   onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                               />
                           </InputGroup>
                       </div>
                   </div>
               </Card.Header>

               <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light">
                    <tr>
                        <th className="ps-4">Mã môn</th>
                        <th>Tên môn</th>
                        <th>Tín chỉ</th>
                        {/* [MỚI] Thêm cột Hành động */}
                        <th className="text-end pe-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                  {loading ? (
                     <tr><td colSpan="4" className="text-center py-4"><Spinner animation="border"/></td></tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map(c => (
                        <tr key={c.id}>
                            <td className="ps-4 fw-bold">{c.code}</td>
                            <td>{c.name}</td>
                            <td>{c.credits}</td>
                            {/* [MỚI] Thêm nút Xóa */}
                            <td className="text-end pe-4">
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteCourse(c.id, c.code)}
                                >
                                    <i className="bi bi-trash"></i> Xóa
                                </Button>
                            </td>
                        </tr>
                    ))
                  ) : (
                     <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy môn học nào.</td></tr>
                  )}
                </tbody>
              </Table>
              
              {/* Phân trang Tab 1 */}
              {filteredData.length > itemsPerPage && (
                  <Card.Footer className="bg-white border-top-0 d-flex justify-content-end py-3">
                      <Pagination className="mb-0">
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => paginate(i+1)}>
                                {i+1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                      </Pagination>
                  </Card.Footer>
              )}
            </Card>
          </Tab>

          {/* TAB 2: LỚP HỌC PHẦN */}
          <Tab eventKey="classes" title="Lớp học phần (Mở lớp)">
             <Card className="shadow-sm border-0">
                 <Card.Header className="bg-white border-bottom-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <Button variant="success" onClick={() => setShowClassModal(true)}>+ Mở Lớp mới</Button>
                        <div style={{ width: '300px' }}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light"><i className="bi bi-search"></i></InputGroup.Text>
                                <Form.Control 
                                    placeholder="Tìm theo Mã lớp, Mã môn..." 
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </InputGroup>
                        </div>
                    </div>
                </Card.Header>

                <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Mã lớp</th>
                            <th>Môn học</th>
                            <th>HK/Năm</th>
                            <th>Lịch học</th>
                            <th>Sĩ số</th>
                            <th className="text-end pe-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                           <tr><td colSpan="6" className="text-center py-4"><Spinner animation="border"/></td></tr>
                        ) : currentItems.length > 0 ? (
                           currentItems.map(c => (
                            <tr key={c.id}>
                                <td className="ps-4 fw-bold">{c.code}</td>
                                <td>{c.course?.name} <br/><small className="text-muted">{c.course?.code}</small></td>
                                <td>{c.semester}/{c.year}</td>
                                <td className="small text-muted" style={{maxWidth: '200px'}}>{renderSchedule(c.schedule)}</td>
                                <td>
                                    <Badge bg={c.enrolledCount >= c.capacity ? "danger" : "success"}>
                                        {c.enrolledCount}/{c.capacity}
                                    </Badge>
                                </td>
                                <td className="text-end pe-4">
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => handleDeleteClass(c.id, c.code)}
                                    >
                                        <i className="bi bi-trash"></i> Xóa
                                    </Button>
                                </td>
                            </tr>
                           ))
                        ) : (
                           <tr><td colSpan="6" className="text-center py-4 text-muted">Không tìm thấy lớp học phần nào.</td></tr>
                        )}
                    </tbody>
                </Table>

                {/* Phân trang Tab 2 */}
                {filteredData.length > itemsPerPage && (
                    <Card.Footer className="bg-white border-top-0 d-flex justify-content-end py-3">
                        <Pagination className="mb-0">
                            <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => paginate(i+1)}>
                                    {i+1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </Card.Footer>
                )}
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
        <Modal show={showClassModal} onHide={() => setShowClassModal(false)} size="lg">
           <Form onSubmit={handleAddClass}>
            <Modal.Header closeButton><Modal.Title>Mở Lớp học phần</Modal.Title></Modal.Header>
            <Modal.Body>
               <Row>
                 <Col><Form.Group className="mb-3"><Form.Label>Mã lớp (VD: INT3306 1)</Form.Label>
                   <Form.Control required onChange={e => setClassForm({...classForm, code: e.target.value})} />
                 </Form.Group></Col>
                 <Col>
                    <Form.Group className="mb-3">
                        <Form.Label>Môn học (ID) <span className="text-danger">*</span></Form.Label>
                        <Form.Select 
                            required 
                            value={classForm.courseId} 
                            onChange={e => setClassForm({...classForm, courseId: e.target.value})}
                        >
                            <option value="">-- Chọn môn học --</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.code} - {c.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                 </Col>
               </Row>
               <Row>
                 <Col><Form.Group className="mb-3"><Form.Label>Học kỳ</Form.Label>
                   <Form.Control type="number" value={classForm.semester} onChange={e => setClassForm({...classForm, semester: e.target.value})} />
                 </Form.Group></Col>
                 <Col><Form.Group className="mb-3"><Form.Label>Năm học</Form.Label>
                   <Form.Control type="number" value={classForm.year} onChange={e => setClassForm({...classForm, year: e.target.value})} />
                 </Form.Group></Col>
                 <Col><Form.Group className="mb-3"><Form.Label>Sĩ số</Form.Label>
                   <Form.Control type="number" value={classForm.capacity} onChange={e => setClassForm({...classForm, capacity: e.target.value})} />
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