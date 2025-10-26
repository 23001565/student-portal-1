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

const ManageStudents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [studentForm, setStudentForm] = useState({
    code: "",
    email: "",
    name: "",
    password: "",
    year: "",
    majorId: "",
    curriculumId: "",
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: "",
    classId: "",
    semester: "",
    year: "",
    status: "active",
  });

  useEffect(() => {
    const mockStudents = [
      {
        id: 1,
        code: 1001,
        email: "22001497@hus.edu",
        name: "Alice Nguyen",
        password: "123456",
        year: 1,
        majorId: 1,
        curriculumId: 1,
        majorName: "Computer Science",
        createdAt: "2025-10-23 09:22:23",
        archivedAt: null,
        isActive: true,
      },
      {
        id: 2,
        code: 1002,
        email: "22001496@hus.edu",
        name: "Bob Tran",
        password: "123456",
        year: 2,
        majorId: 1,
        curriculumId: 1,
        majorName: "Computer Science",
        createdAt: "2025-10-23 09:22:23",
        archivedAt: null,
        isActive: true,
      },
      {
        id: 3,
        code: 1003,
        email: "22001495@student.edu",
        name: "Carol Le",
        password: "123456",
        year: 1,
        majorId: 2,
        curriculumId: 2,
        majorName: "Business Administration",
        createdAt: "2025-10-23 09:22:23",
        archivedAt: null,
        isActive: true,
      },
    ];

    const mockEnrollments = [
      {
        id: 1,
        classId: 1,
        studentId: 1,
        semester: 1,
        year: 2025,
        status: "active",
        createdAt: "2025-10-23 09:24:54",
        canceledAt: null,
        archivedAt: null,
        registrationWindowId: 1,
        studentName: "Alice Nguyen",
        className: "CS101-1",
        courseName: "Introduction to Programming",
      },
      {
        id: 2,
        classId: 2,
        studentId: 2,
        semester: 1,
        year: 2025,
        status: "active",
        createdAt: "2025-10-23 09:24:54",
        canceledAt: null,
        archivedAt: null,
        registrationWindowId: 1,
        studentName: "Bob Tran",
        className: "CS201-1",
        courseName: "Data Structures",
      },
      {
        id: 3,
        classId: 3,
        studentId: 3,
        semester: 1,
        year: 2025,
        status: "active",
        createdAt: "2025-10-23 09:24:54",
        canceledAt: null,
        archivedAt: null,
        registrationWindowId: 1,
        studentName: "Carol Le",
        className: "BA101-1",
        courseName: "Principles of Management",
      },
    ];

    const mockClasses = [
      {
        id: 1,
        code: "CS101-1",
        courseId: 1,
        courseName: "Introduction to Programming",
      },
      { id: 2, code: "CS201-1", courseId: 2, courseName: "Data Structures" },
      {
        id: 3,
        code: "BA101-1",
        courseId: 3,
        courseName: "Principles of Management",
      },
      { id: 4, code: "BA202-1", courseId: 4, courseName: "Marketing Basics" },
    ];

    const mockMajors = [
      { id: 1, name: "Computer Science" },
      { id: 2, name: "Business Administration" },
    ];

    setStudents(mockStudents);
    setEnrollments(mockEnrollments);
    setClasses(mockClasses);
    setMajors(mockMajors);
  }, []);
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      // Update student
      const selectedMajor = majors.find(
        (m) => m.id === parseInt(studentForm.majorId)
      );
      setStudents(
        students.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                ...studentForm,
                code: parseInt(studentForm.code),
                year: parseInt(studentForm.year),
                majorId: parseInt(studentForm.majorId),
                curriculumId: parseInt(studentForm.curriculumId),
                majorName: selectedMajor?.name || "",
              }
            : student
        )
      );
    } else {
      // Add new student
      const selectedMajor = majors.find(
        (m) => m.id === parseInt(studentForm.majorId)
      );
      const newStudent = {
        id: students.length + 1,
        ...studentForm,
        code: parseInt(studentForm.code),
        year: parseInt(studentForm.year),
        majorId: parseInt(studentForm.majorId),
        curriculumId: parseInt(studentForm.curriculumId),
        majorName: selectedMajor?.name || "",
        createdAt: new Date().toISOString(),
        archivedAt: null,
        isActive: true,
      };
      setStudents([...students, newStudent]);
    }
    setShowStudentModal(false);
    setEditingStudent(null);
    setStudentForm({
      code: "",
      email: "",
      name: "",
      password: "",
      year: "",
      majorId: "",
      curriculumId: "",
    });
  };

  const handleEnrollmentSubmit = (e) => {
    e.preventDefault();
    const selectedStudent = students.find(
      (s) => s.id === parseInt(enrollmentForm.studentId)
    );
    const selectedClass = classes.find(
      (c) => c.id === parseInt(enrollmentForm.classId)
    );

    if (editingEnrollment) {
      // Update enrollment
      setEnrollments(
        enrollments.map((enrollment) =>
          enrollment.id === editingEnrollment.id
            ? {
                ...enrollment,
                ...enrollmentForm,
                studentId: parseInt(enrollmentForm.studentId),
                classId: parseInt(enrollmentForm.classId),
                semester: parseInt(enrollmentForm.semester),
                year: parseInt(enrollmentForm.year),
                studentName: selectedStudent?.name || "",
                className: selectedClass?.code || "",
                courseName: selectedClass?.courseName || "",
              }
            : enrollment
        )
      );
    } else {
      // Add new enrollment
      const newEnrollment = {
        id: enrollments.length + 1,
        ...enrollmentForm,
        studentId: parseInt(enrollmentForm.studentId),
        classId: parseInt(enrollmentForm.classId),
        semester: parseInt(enrollmentForm.semester),
        year: parseInt(enrollmentForm.year),
        studentName: selectedStudent?.name || "",
        className: selectedClass?.code || "",
        courseName: selectedClass?.courseName || "",
        createdAt: new Date().toISOString(),
        canceledAt: null,
        archivedAt: null,
        registrationWindowId: 1,
      };
      setEnrollments([...enrollments, newEnrollment]);
    }
    setShowEnrollmentModal(false);
    setEditingEnrollment(null);
    setEnrollmentForm({
      studentId: "",
      classId: "",
      semester: "",
      year: "",
      status: "active",
    });
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      code: student.code.toString(),
      email: student.email,
      name: student.name,
      password: student.password,
      year: student.year.toString(),
      majorId: student.majorId.toString(),
      curriculumId: student.curriculumId.toString(),
    });
    setShowStudentModal(true);
  };

  const handleEditEnrollment = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEnrollmentForm({
      studentId: enrollment.studentId.toString(),
      classId: enrollment.classId.toString(),
      semester: enrollment.semester.toString(),
      year: enrollment.year.toString(),
      status: enrollment.status,
    });
    setShowEnrollmentModal(true);
  };

  const handleArchiveStudent = (studentId) => {
    setStudents(
      students.map((student) =>
        student.id === studentId
          ? { ...student, archivedAt: new Date().toISOString() }
          : student
      )
    );
  };

  const handleCancelEnrollment = (enrollmentId) => {
    setEnrollments(
      enrollments.map((enrollment) =>
        enrollment.id === enrollmentId
          ? {
              ...enrollment,
              status: "canceled",
              canceledAt: new Date().toISOString(),
            }
          : enrollment
      )
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.code.toString().includes(searchTerm) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge bg="success">Active</Badge>;
      case "canceled":
        return <Badge bg="danger">Canceled</Badge>;
      case "completed":
        return <Badge bg="info">Completed</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Manage Students & Enrollments</h2>
            <Button
              variant="primary"
              onClick={() => navigate("/admin/dashboard")}
            >
              Back to Dashboard
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
            <Tab eventKey="students" title="Students">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Student Management</h5>
                  <div className="d-flex gap-2">
                    <InputGroup style={{ width: "300px" }}>
                      <FormControl
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    <Button
                      variant="success"
                      onClick={() => {
                        setEditingStudent(null);
                        setStudentForm({
                          code: "",
                          email: "",
                          name: "",
                          password: "",
                          year: "",
                          majorId: "",
                          curriculumId: "",
                        });
                        setShowStudentModal(true);
                      }}
                    >
                      Add Student
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Year</th>
                        <th>Major</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td>{student.code}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.year}</td>
                          <td>{student.majorName}</td>
                          <td>
                            {student.archivedAt ? (
                              <Badge bg="secondary">Archived</Badge>
                            ) : (
                              <Badge bg="success">Active</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditStudent(student)}
                            >
                              Edit
                            </Button>
                            {!student.archivedAt && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleArchiveStudent(student.id)}
                              >
                                Archive
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

            <Tab eventKey="enrollments" title="Enrollments">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Enrollment Management</h5>
                  <div className="d-flex gap-2">
                    <InputGroup style={{ width: "300px" }}>
                      <FormControl
                        placeholder="Search enrollments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    <Button
                      variant="success"
                      onClick={() => {
                        setEditingEnrollment(null);
                        setEnrollmentForm({
                          studentId: "",
                          classId: "",
                          semester: "",
                          year: "",
                          status: "active",
                        });
                        setShowEnrollmentModal(true);
                      }}
                    >
                      Add Enrollment
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Class</th>
                        <th>Semester/Year</th>
                        <th>Status</th>
                        <th>Enrolled</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>{enrollment.studentName}</td>
                          <td>{enrollment.courseName}</td>
                          <td>{enrollment.className}</td>
                          <td>
                            {enrollment.semester}/{enrollment.year}
                          </td>
                          <td>{getStatusBadge(enrollment.status)}</td>
                          <td>
                            {new Date(enrollment.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditEnrollment(enrollment)}
                            >
                              Edit
                            </Button>
                            {enrollment.status === "active" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleCancelEnrollment(enrollment.id)
                                }
                              >
                                Cancel
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

      {/* Student Modal */}
      <Modal
        show={showStudentModal}
        onHide={() => setShowStudentModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStudent ? "Edit Student" : "Add New Student"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStudentSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Student Code</Form.Label>
                  <Form.Control
                    type="number"
                    value={studentForm.code}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, code: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={studentForm.email}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={studentForm.name}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={studentForm.password}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Select
                    value={studentForm.year}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, year: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Major</Form.Label>
                  <Form.Select
                    value={studentForm.majorId}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        majorId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Major</option>
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Curriculum ID</Form.Label>
                  <Form.Control
                    type="number"
                    value={studentForm.curriculumId}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        curriculumId: e.target.value,
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
              onClick={() => setShowStudentModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingStudent ? "Update" : "Add"} Student
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal
        show={showEnrollmentModal}
        onHide={() => setShowEnrollmentModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEnrollment ? "Edit Enrollment" : "Add New Enrollment"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEnrollmentSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Student</Form.Label>
                  <Form.Select
                    value={enrollmentForm.studentId}
                    onChange={(e) =>
                      setEnrollmentForm({
                        ...enrollmentForm,
                        studentId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Student</option>
                    {students
                      .filter((s) => !s.archivedAt)
                      .map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.code} - {student.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Class</Form.Label>
                  <Form.Select
                    value={enrollmentForm.classId}
                    onChange={(e) =>
                      setEnrollmentForm({
                        ...enrollmentForm,
                        classId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.code} - {cls.courseName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    value={enrollmentForm.semester}
                    onChange={(e) =>
                      setEnrollmentForm({
                        ...enrollmentForm,
                        semester: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    min="2020"
                    max="2030"
                    value={enrollmentForm.year}
                    onChange={(e) =>
                      setEnrollmentForm({
                        ...enrollmentForm,
                        year: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={enrollmentForm.status}
                    onChange={(e) =>
                      setEnrollmentForm({
                        ...enrollmentForm,
                        status: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="active">Active</option>
                    <option value="canceled">Canceled</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowEnrollmentModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingEnrollment ? "Update" : "Add"} Enrollment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageStudents;
