import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
  Tabs,
  Tab,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CourseCSVUpload from './CourseCSVUpload.jsx';


const ManageCourses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("các khóa học của trường");
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ code: '', majorId: '', curriculumCode: '' });
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { listCourses } = await import('../../api/courseApi');
      const res = await listCourses({ code: filters.code, majorId: filters.majorId, curriculumCode: filters.curriculumCode });
      setCourses(res.items || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e.message || 'Không tải được danh sách môn học');
    } finally { setLoading(false); }
  };

  // Form states
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: "",
  });

  // class management moved to dedicated pages/services; this page focuses on courses only

  // Load from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { listCourses } = await import('../../api/courseApi');
        const res = await listCourses({ code: filters.code, majorId: filters.majorId, curriculumCode: filters.curriculumCode });
        if (mounted) setCourses(res.items || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally { setLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const { createCourse, updateCourse } = await import('../../api/courseApi');
      if (editingCourse) {
        const updated = await updateCourse(editingCourse.code, {
          name: courseForm.name,
          credits: Number(courseForm.credits),
        });
        setCourses(courses.map(c => c.code === editingCourse.code ? updated : c));
      } else {
        const created = await createCourse({
          code: courseForm.code,
          name: courseForm.name,
          credits: Number(courseForm.credits),
        });
        setCourses([...(courses || []), created]);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      setCourseForm({ code: '', name: '', credits: '' });
    } catch (err) {
      alert(err.message || 'Lỗi lưu môn học');
    }
  };

  // class CRUD removed from this page

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      credits: course.credits.toString(),
    });
    setShowCourseModal(true);
  };

  // class editing removed from this page

  const handleArchiveCourse = async (courseCode) => {
    try {
      const { archiveCourse } = await import('../../api/courseApi');
      await archiveCourse(courseCode);
      setCourses(courses.map(c => c.code === courseCode ? { ...c, archivedAt: new Date().toISOString() } : c));
    } catch (e) { alert(e.message || 'Lưu trữ thất bại'); }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Quản lý môn học và lớp học</h2>
            <Button
              variant="primary"
              onClick={() => navigate("/admin/dashboard")}
            >
              Quay về Trang chủ
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <CourseCSVUpload onSuccess={loadCourses} />
        </Col>
      </Row>


      <Row>
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="courses" title="Môn học">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Quản lý môn học</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <InputGroup style={{ width: "240px" }}>
                      <FormControl
                        placeholder="Tìm kiếm môn học... (client)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    <InputGroup style={{ width: "180px" }}>
                      <FormControl
                        placeholder="Mã môn (API)"
                        value={filters.code}
                        onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                      />
                    </InputGroup>
                    <InputGroup style={{ width: "140px" }}>
                      <FormControl
                        type="number"
                        placeholder="Major ID"
                        value={filters.majorId}
                        onChange={(e) => setFilters({ ...filters, majorId: e.target.value })}
                      />
                    </InputGroup>
                    <InputGroup style={{ width: "220px" }}>
                      <FormControl
                        placeholder="Curriculum code"
                        value={filters.curriculumCode}
                        onChange={(e) => setFilters({ ...filters, curriculumCode: e.target.value })}
                      />
                    </InputGroup>
                    <Button variant="primary" onClick={loadCourses} disabled={loading}>
                      {loading ? 'Loading...' : 'Lọc (API)'}
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm({ code: "", name: "", credits: "" });
                        setShowCourseModal(true);
                      }}
                    >
                      Thêm môn học
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Mã môn học</th>
                        <th>Tên môn học</th>
                        <th>Số tín chỉ</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.id}>
                          <td>{course.code}</td>
                          <td>{course.name}</td>
                          <td>{course.credits}</td>
                          <td>
                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td>
                            {course.archivedAt ? (
                              <Badge bg="secondary">Đã lưu</Badge>
                            ) : (
                              <Badge bg="success">Đang hoạt động</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditCourse(course)}
                            >
                              Sửa
                            </Button>
                            {!course.archivedAt && (
                              <>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleArchiveCourse(course.code)}
                                >
                                  Lưu
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={async () => {
                                    if (!window.confirm('Xóa môn học này?')) return;
                                    try {
                                      const { deleteCourse } = await import('../../api/courseApi');
                                      const res = await deleteCourse(course.code);
                                      if (res?.archived) {
                                        alert(`Đã lưu trữ môn học và hủy ${res.canceledClasses || 0} lớp liên quan`);
                                        setCourses(courses.map(c => c.code === course.code ? { ...c, archivedAt: new Date().toISOString() } : c));
                                      } else if (res?.deleted) {
                                        setCourses(courses.filter(c => c.code !== course.code));
                                      } else {
                                        // fallback
                                        setCourses(courses.filter(c => c.code !== course.code));
                                      }
                                    } catch (e) { alert(e.message || 'Xóa thất bại'); }
                                  }}
                                >
                                  Xóa
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab>

            {/* Classes tab removed; manage classes via dedicated page */}
          </Tabs>
        </Col>
      </Row>

      {/* Course Modal */}
      <Modal
        show={showCourseModal}
        onHide={() => setShowCourseModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCourse ? "Sửa môn học" : "Thêm môn học mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCourseSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã môn học</Form.Label>
                  <Form.Control
                    type="text"
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, code: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số tín chỉ</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    value={courseForm.credits}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, credits: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Tên môn học</Form.Label>
              <Form.Control
                type="text"
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCourseModal(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingCourse ? "Cập nhật" : "Thêm"} môn học
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Class modal removed */}
    </Container>
  );
};

export default ManageCourses;
