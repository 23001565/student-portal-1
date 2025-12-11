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
import Layout from "../../components/Layout";

const ManageCourses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("các khóa học của trường");
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: "",
  });

  const [classForm, setClassForm] = useState({
    code: "",
    semester: "",
    year: "",
    capacity: "",
    dayOfWeek: "",
    startPeriod: "",
    endPeriod: "",
    location: "",
    midTermRatio: "",
    finalExamRatio: "",
    courseId: "",
  });

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockCourses = [
      {
        id: 1,
        code: "CS101",
        name: "Lập trình cơ bản",
        credits: 3,
        createdAt: "2025-10-23 09:23:13",
        archivedAt: null,
      },
      {
        id: 2,
        code: "CS201",
        name: "Cấu trúc dữ liệu",
        credits: 3,
        createdAt: "2025-10-23 09:23:13",
        archivedAt: null,
      },
      {
        id: 3,
        code: "BA101",
        name: "Nguyên lý quản lý",
        credits: 3,
        createdAt: "2025-10-23 09:23:13",
        archivedAt: null,
      },
      {
        id: 4,
        code: "BA202",
        name: "Kinh tế học cơ bản",
        credits: 3,
        createdAt: "2025-10-23 09:23:13",
        archivedAt: null,
      },
    ];

    const mockClasses = [
      {
        id: 1,
        code: "CS101-1",
        semester: 1,
        year: 2025,
        capacity: 40,
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        location: "A101",
        midTermRatio: 0.4,
        finalExamRatio: 0.6,
        courseId: 1,
        courseName: "Lập trình cơ bản",
        createdAt: "2025-10-23 09:24:20",
        canceledAt: null,
        archivedAt: null,
      },
      {
        id: 2,
        code: "CS201-1",
        semester: 1,
        year: 2025,
        capacity: 35,
        dayOfWeek: 3,
        startPeriod: 2,
        endPeriod: 4,
        location: "A102",
        midTermRatio: 0.4,
        finalExamRatio: 0.6,
        courseId: 2,
        courseName: "Cấu trúc dữ liệu",
        createdAt: "2025-10-23 09:24:20",
        canceledAt: null,
        archivedAt: null,
      },
    ];

    setCourses(mockCourses);
    setClasses(mockClasses);
  }, []);

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      // Update course
      setCourses(
        courses.map((course) =>
          course.id === editingCourse.id ? { ...course, ...courseForm } : course
        )
      );
    } else {
      // Add new course
      const newCourse = {
        id: courses.length + 1,
        ...courseForm,
        credits: parseInt(courseForm.credits),
        createdAt: new Date().toISOString(),
        archivedAt: null,
      };
      setCourses([...courses, newCourse]);
    }
    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({ code: "", name: "", credits: "" });
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    const selectedCourse = courses.find(
      (c) => c.id === parseInt(classForm.courseId)
    );

    if (editingClass) {
      // Update class
      setClasses(
        classes.map((cls) =>
          cls.id === editingClass.id
            ? {
                ...cls,
                ...classForm,
                courseName: selectedCourse?.name || "",
                semester: parseInt(classForm.semester),
                year: parseInt(classForm.year),
                capacity: parseInt(classForm.capacity),
                dayOfWeek: parseInt(classForm.dayOfWeek),
                startPeriod: parseInt(classForm.startPeriod),
                endPeriod: parseInt(classForm.endPeriod),
                midTermRatio: parseFloat(classForm.midTermRatio),
                finalExamRatio: parseFloat(classForm.finalExamRatio),
                courseId: parseInt(classForm.courseId),
              }
            : cls
        )
      );
    } else {
      // Add new class
      const newClass = {
        id: classes.length + 1,
        ...classForm,
        courseName: selectedCourse?.name || "",
        semester: parseInt(classForm.semester),
        year: parseInt(classForm.year),
        capacity: parseInt(classForm.capacity),
        dayOfWeek: parseInt(classForm.dayOfWeek),
        startPeriod: parseInt(classForm.startPeriod),
        endPeriod: parseInt(classForm.endPeriod),
        midTermRatio: parseFloat(classForm.midTermRatio),
        finalExamRatio: parseFloat(classForm.finalExamRatio),
        courseId: parseInt(classForm.courseId),
        createdAt: new Date().toISOString(),
        canceledAt: null,
        archivedAt: null,
      };
      setClasses([...classes, newClass]);
    }
    setShowClassModal(false);
    setEditingClass(null);
    setClassForm({
      code: "",
      semester: "",
      year: "",
      capacity: "",
      dayOfWeek: "",
      startPeriod: "",
      endPeriod: "",
      location: "",
      midTermRatio: "",
      finalExamRatio: "",
      courseId: "",
    });
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      credits: course.credits.toString(),
    });
    setShowCourseModal(true);
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setClassForm({
      code: cls.code,
      semester: cls.semester.toString(),
      year: cls.year.toString(),
      capacity: cls.capacity.toString(),
      dayOfWeek: cls.dayOfWeek.toString(),
      startPeriod: cls.startPeriod.toString(),
      endPeriod: cls.endPeriod.toString(),
      location: cls.location,
      midTermRatio: cls.midTermRatio.toString(),
      finalExamRatio: cls.finalExamRatio.toString(),
      courseId: cls.courseId.toString(),
    });
    setShowClassModal(true);
  };

  const handleArchiveCourse = (courseId) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, archivedAt: new Date().toISOString() }
          : course
      )
    );
  };

  const handleArchiveClass = (classId) => {
    setClasses(
      classes.map((cls) =>
        cls.id === classId
          ? { ...cls, archivedAt: new Date().toISOString() }
          : cls
      )
    );
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(
    (cls) =>
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDayName = (dayOfWeek) => {
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
    ];
    return days[dayOfWeek] || "Không xác định";
  };

  return (
    <Layout>
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
                    <div className="d-flex gap-2">
                      <InputGroup style={{ width: "300px" }}>
                        <FormControl
                          placeholder="Tìm kiếm môn học..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
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
                              {new Date(course.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
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
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleArchiveCourse(course.id)}
                                >
                                  Lưu
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="classes" title="Lớp học">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Quản lý lớp học</h5>
                    <div className="d-flex gap-2">
                      <InputGroup style={{ width: "300px" }}>
                        <FormControl
                          placeholder="Tìm kiếm lớp học..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                      <Button
                        variant="success"
                        onClick={() => {
                          setEditingClass(null);
                          setClassForm({
                            code: "",
                            semester: "",
                            year: "",
                            capacity: "",
                            dayOfWeek: "",
                            startPeriod: "",
                            endPeriod: "",
                            location: "",
                            midTermRatio: "",
                            finalExamRatio: "",
                            courseId: "",
                          });
                          setShowClassModal(true);
                        }}
                      >
                        Thêm lớp học
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Mã lớp học</th>
                          <th>Môn học</th>
                          <th>Học kỳ/Năm</th>
                          <th>Lịch học</th>
                          <th>Sức chứa</th>
                          <th>Vị trí</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClasses.map((cls) => (
                          <tr key={cls.id}>
                            <td>{cls.code}</td>
                            <td>{cls.courseName}</td>
                            <td>
                              {cls.semester}/{cls.year}
                            </td>
                            <td>
                              {getDayName(cls.dayOfWeek)}
                              <br />
                              Period {cls.startPeriod}-{cls.endPeriod}
                            </td>
                            <td>{cls.capacity}</td>
                            <td>{cls.location}</td>
                            <td>
                              {cls.archivedAt ? (
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
                                onClick={() => handleEditClass(cls)}
                              >
                                Sửa
                              </Button>
                              {!cls.archivedAt && (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleArchiveClass(cls.id)}
                                >
                                  Lưu
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>
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
                        setCourseForm({
                          ...courseForm,
                          credits: e.target.value,
                        })
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

        {/* Class Modal */}
        <Modal
          show={showClassModal}
          onHide={() => setShowClassModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingClass ? "Sửa lớp học" : "Thêm lớp học mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleClassSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mã lớp học</Form.Label>
                    <Form.Control
                      type="text"
                      value={classForm.code}
                      onChange={(e) =>
                        setClassForm({ ...classForm, code: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Môn học</Form.Label>
                    <Form.Select
                      value={classForm.courseId}
                      onChange={(e) =>
                        setClassForm({ ...classForm, courseId: e.target.value })
                      }
                      required
                    >
                      <option value="">Chọn môn học</option>
                      {courses
                        .filter((c) => !c.archivedAt)
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Học kỳ</Form.Label>
                    <Form.Select
                      value={classForm.semester}
                      onChange={(e) =>
                        setClassForm({ ...classForm, semester: e.target.value })
                      }
                      required
                    >
                      <option value="">Chọn học kỳ</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Năm</Form.Label>
                    <Form.Control
                      type="number"
                      min="2020"
                      max="2030"
                      value={classForm.year}
                      onChange={(e) =>
                        setClassForm({ ...classForm, year: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sức chứa</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="100"
                      value={classForm.capacity}
                      onChange={(e) =>
                        setClassForm({ ...classForm, capacity: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày trong tuần</Form.Label>
                    <Form.Select
                      value={classForm.dayOfWeek}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          dayOfWeek: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Chọn ngày</option>
                      <option value="1">Thứ hai</option>
                      <option value="2">Thứ ba</option>
                      <option value="3">Thứ tư</option>
                      <option value="4">Thứ năm</option>
                      <option value="5">Thứ sáu</option>
                      <option value="6">Thứ bảy</option>
                      <option value="0">Chủ nhật</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Giờ bắt đầu</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="12"
                      value={classForm.startPeriod}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          startPeriod: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Giờ kết thúc</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="12"
                      value={classForm.endPeriod}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          endPeriod: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vị trí</Form.Label>
                    <Form.Control
                      type="text"
                      value={classForm.location}
                      onChange={(e) =>
                        setClassForm({ ...classForm, location: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tỷ lệ điểm giữa kỳ</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={classForm.midTermRatio}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          midTermRatio: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tỷ lệ điểm cuối kỳ</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={classForm.finalExamRatio}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          finalExamRatio: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowClassModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingClass ? "Cập nhật" : "Thêm"} lớp học
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};

export default ManageCourses;
