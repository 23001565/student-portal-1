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

  const handleArchive = async (code) => {
    if (!window.confirm("Lưu trữ sinh viên này?")) return;
    await archiveStudent(code);
    fetchStudents();
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Xóa vĩnh viễn sinh viên này?")) return;
    await deleteStudent(code);
    fetchStudents();
  };

  /* ---------------- RENDER ---------------- */

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Quản lý Sinh viên</h2>
        <Button onClick={() => navigate("/admin/dashboard")}>
          Quay lại
        </Button>
      </div>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between mb-3">
            <Form className="d-flex" style={{ flex: 1, marginRight: 10 }}>
              <Row className="g-2" style={{ flex: 1 }}>
                <Col md={2}>
                  <FormControl
                    placeholder="Mã sinh viên"
                    value={filters.studentCode}
                    onChange={(e) => setFilters({ ...filters, studentCode: e.target.value })}
                  />
                </Col>
                <Col md={2}>
                  <FormControl
                    placeholder="Năm"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  />
                </Col>
                <Col md={2}>
                  <FormControl
                    placeholder="Tên ngành"
                    value={filters.majorName}
                    onChange={(e) => setFilters({ ...filters, majorName: e.target.value })}
                  />
                </Col>
                <Col md={2}>
                  <FormControl
                    placeholder="Mã chương trình"
                    value={filters.curriculumCode}
                    onChange={(e) => setFilters({ ...filters, curriculumCode: e.target.value })}
                  />
                </Col>
                <Col md={2}>
                  <Button onClick={handleFilter} variant="outline-primary">
                    Lọc
                  </Button>
                </Col>
              </Row>
            </Form>

            <Button
              onClick={() => {
                setEditingStudent(null);
                setForm({
                  code: "",
                  email: "",
                  name: "",
                  password: "",
                  year: "",
                  curriculumCode: "",
                });
                setShowModal(true);
              }}
            >
              Thêm sinh viên
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {loading && <Spinner />}
          {error && <Alert variant="danger">{error}</Alert>}

          <Table hover responsive>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Năm</th>
                <th>Ngành</th>
                <th>Chương trình</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.code}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.year}</td>
                  <td>{s.majorName}</td>
                  <td>{s.curriculumCode}</td>
                  <td>
                    {s.archivedAt ? (
                      <Badge bg="secondary">Đã lưu trữ</Badge>
                    ) : (
                      <Badge bg="success">Hoạt động</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleEdit(s)}
                      className="me-2"
                    >
                      Sửa
                    </Button>
                    {!s.archivedAt && (
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => handleArchive(s.code)}
                        className="me-2"
                      >
                        Lưu trữ
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(s.code)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStudent ? "Cập nhật sinh viên" : "Thêm sinh viên"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {!editingStudent && (
              <Form.Control
                className="mb-2"
                placeholder="Mã sinh viên"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
                required
              />
            )}
            <Form.Control
              className="mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
            <Form.Control
              className="mb-2"
              placeholder="Tên"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
            <Form.Control
              className="mb-2"
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <Form.Control
              className="mb-2"
              type="number"
              placeholder="Năm nhập học"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: e.target.value })
              }
            />
            <Form.Control
              className="mb-2"
              placeholder="Chương trình học"
              value={form.curriculumCode}
              onChange={(e) =>
                setForm({ ...form, curriculumCode: e.target.value })
              }
            />
          </Modal.Body>

          <Modal.Footer>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageStudents;
