import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  InputGroup,
  FormControl,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  listStudents,
  createStudent,
  updateStudent,
  archiveStudent,
  deleteStudent,
} from "../../api/studentApi";

const ManageStudents = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    studentCode: "",
    year: "",
    majorName: "",
    curriculumCode: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [form, setForm] = useState({
    code: "",
    email: "",
    name: "",
    password: "",
    year: "",
    curriculumCode: "",
  });

  /* ---------------- FETCH ---------------- */

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== "")
      );
      const data = await listStudents(activeFilters);
      setStudents(data);
    } catch (err) {
      setError("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleFilter = () => {
    fetchStudents();
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.code, {
          email: form.email,
          name: form.name,
          year: Number(form.year),
          curriculumCode: form.curriculumCode,
          ...(form.password && { password: form.password }),
        });
      } else {
        await createStudent({
          code: Number(form.code),
          email: form.email,
          name: form.name,
          password: form.password,
          year: Number(form.year),
          curriculumCode: form.curriculumCode,
        });
      }

      setShowModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch {
      alert("Lưu sinh viên thất bại");
    }
  };


  // View enrollments for a student (admin)
  const handleViewEnrollments = (student) => {
    navigate(`/admin/enrollments/${student.code}`);
  };

  /* ---------------- ACTIONS ---------------- */

  const handleEdit = (student) => {
    setEditingStudent(student);
    setForm({
      code: student.code,
      email: student.email,
      name: student.name,
      password: "",
      year: student.year,
      curriculumCode: student.curriculumCode,
    });
    setShowModal(true);
  };
  return (
  <Container className="mt-4">
    <Card>
      <Card.Body>
        <h2>Manage Students</h2>

        {/* FILTERS */}
        <div className="mb-3">
          <InputGroup>
            <FormControl
              placeholder="Student Code"
              value={filters.studentCode}
              onChange={(e) =>
                setFilters({ ...filters, studentCode: e.target.value })
              }
            />
            <FormControl
              placeholder="Year"
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: e.target.value })
              }
            />
            <FormControl
              placeholder="Major Name"
              value={filters.majorName}
              onChange={(e) =>
                setFilters({ ...filters, majorName: e.target.value })
              }
            />
            <FormControl
              placeholder="Curriculum Code"
              value={filters.curriculumCode}
              onChange={(e) =>
                setFilters({ ...filters, curriculumCode: e.target.value })
              }
            />
            <Button onClick={handleFilter}>Filter</Button>
          </InputGroup>
        </div>

        {/* TABLE */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Email</th>
              <th>Year</th>
              <th>Curriculum</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">
                  <Spinner animation="border" size="sm" /> Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.code}>
                  <td>{student.code}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.year}</td>
                  <td>{student.curriculumCode}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      className="me-2"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="me-2"
                      onClick={() => handleViewEnrollments(student)}
                    >
                      View Enrollments
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(student)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>

    {/* SINGLE MODAL */}
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingStudent ? "Edit Student" : "Add Student"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {!editingStudent && (
            <Form.Group className="mb-2">
              <Form.Label>Code</Form.Label>
              <Form.Control
                type="number"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder={
                editingStudent
                  ? "Leave blank to keep current password"
                  : ""
              }
              required={!editingStudent}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="number"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Curriculum Code</Form.Label>
            <Form.Control
              value={form.curriculumCode}
              onChange={(e) =>
                setForm({ ...form, curriculumCode: e.target.value })
              }
              required
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </Container>
);

};

export default ManageStudents;
