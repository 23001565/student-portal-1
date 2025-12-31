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

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [form, setForm] = useState({
    code: "",
    email: "",
    name: "",
    password: "",
    year: "",
    majorId: "",
    curriculumId: "",
  });

  /* ---------------- FETCH ---------------- */

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await listStudents(
        searchTerm ? { q: searchTerm } : {}
      );
      setStudents(data);
    } catch (err) {
      setError("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.code, {
          email: form.email,
          name: form.name,
          year: Number(form.year),
          majorId: Number(form.majorId),
          curriculumId: Number(form.curriculumId),
          ...(form.password && { password: form.password }),
        });
      } else {
        await createStudent({
          code: Number(form.code),
          email: form.email,
          name: form.name,
          password: form.password,
          year: Number(form.year),
          majorId: Number(form.majorId),
          curriculumId: Number(form.curriculumId),
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
      majorId: student.majorId,
      curriculumId: student.curriculumId,
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
        <Card.Header className="d-flex justify-content-between">
          <InputGroup style={{ width: 300 }}>
            <FormControl
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Button
            onClick={() => {
              setEditingStudent(null);
              setForm({
                code: "",
                email: "",
                name: "",
                password: "",
                year: "",
                majorId: "",
                curriculumId: "",
              });
              setShowModal(true);
            }}
          >
            Thêm sinh viên
          </Button>
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
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.code}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.year}</td>
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
