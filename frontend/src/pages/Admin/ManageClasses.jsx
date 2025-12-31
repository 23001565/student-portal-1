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
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ClassCSVUpload from './ClassCSVUpload.jsx';


const ManageClasses = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    courseCode: "",
    semester: "",
    year: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [classForm, setClassForm] = useState({
    code: "",
    courseCode: "",
    semester: "",
    year: "",
    capacity: "",
    dayOfWeek: "",
    startPeriod: "",
    endPeriod: "",
    location: "",
  });

  /* =========================
     LOAD CLASSES
  ========================= */
  const loadClasses = async () => {
    try {
      setLoading(true);
      const { listClasses } = await import("../../api/classApi");
      const res = await listClasses({
        courseCode: filters.courseCode,
        semester: filters.semester,
        year: filters.year,
      });
      setClasses(res.items || []);
    } catch (e) {
      console.error(e);
      alert(e.message || "Không tải được danh sách lớp học phần");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     SUBMIT FORM
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        createClass,
        updateClass,
      } = await import("../../api/classApi");

      if (editingClass) {
        const updated = await updateClass(
          editingClass.code,
          editingClass.semester,
          editingClass.year,
          {
            capacity: Number(classForm.capacity),
            dayOfWeek: Number(classForm.dayOfWeek),
            startPeriod: Number(classForm.startPeriod),
            endPeriod: Number(classForm.endPeriod),
            location: classForm.location,
            courseCode: classForm.courseCode,
          }
        );

        setClasses(
          classes.map((c) =>
            c.id === updated.id ? updated : c
          )
        );
      } else {
        const created = await createClass({
          code: classForm.code,
          courseCode: classForm.courseCode,
          semester: Number(classForm.semester),
          year: Number(classForm.year),
          capacity: Number(classForm.capacity),
          dayOfWeek: Number(classForm.dayOfWeek),
          startPeriod: Number(classForm.startPeriod),
          endPeriod: Number(classForm.endPeriod),
          location: classForm.location,
        });
        setClasses([...classes, created]);
      }

      setShowModal(false);
      setEditingClass(null);
      resetForm();
    } catch (e) {
      alert(e.message || "Lỗi lưu lớp học phần");
    }
  };

  const resetForm = () => {
    setClassForm({
      code: "",
      courseCode: "",
      semester: "",
      year: "",
      capacity: "",
      dayOfWeek: "",
      startPeriod: "",
      endPeriod: "",
      location: "",
    });
  };

  /* =========================
     ACTIONS
  ========================= */
  const handleEdit = (cls) => {
    setEditingClass(cls);
    setClassForm({
      code: cls.code,
      courseCode: cls.courseId, // keep as code input, admin knows
      semester: cls.semester,
      year: cls.year,
      capacity: cls.capacity,
      dayOfWeek: cls.dayOfWeek,
      startPeriod: cls.startPeriod,
      endPeriod: cls.endPeriod,
      location: cls.location,
    });
    setShowModal(true);
  };

  const handleArchive = async (cls) => {
    try {
      const { archiveClass } = await import("../../api/classApi");
      await archiveClass(cls.code, cls.semester, cls.year);
      setClasses(
        classes.map((c) =>
          c.id === cls.id
            ? { ...c, archivedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (e) {
      alert(e.message || "Lưu trữ thất bại");
    }
  };

  const handleDelete = async (cls) => {
    if (!window.confirm("Xóa lớp học phần này?")) return;
    try {
      const { deleteClass } = await import("../../api/classApi");
      const res = await deleteClass(cls.code, cls.semester, cls.year);

      if (res?.canceled) {
        alert("Lớp có dữ liệu, đã chuyển sang trạng thái hủy");
        setClasses(
          classes.map((c) =>
            c.id === cls.id
              ? { ...c, canceledAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        setClasses(classes.filter((c) => c.id !== cls.id));
      }
    } catch (e) {
      alert(e.message || "Xóa thất bại");
    }
  };

  /* =========================
     FILTER (CLIENT)
  ========================= */
  const filteredClasses = classes.filter(
    (cls) =>
      cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dayName = (d) =>
    ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d] || "?";

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between mb-4">
            <h2>Quản lý lớp học phần</h2>
            <Button onClick={() => navigate("/admin/dashboard")}>
              Quay về Trang chủ
            </Button>
          </div>
        </Col>
      </Row>

      {/* CSV Upload for Classes */}
    <Row className="mb-3">
        <Col>
            <ClassCSVUpload
            onSuccess={() => {
                loadClasses(); // reload table after successful upload
            }}
            />
        </Col>
    </Row>


      <Card>
        <Card.Header className="d-flex justify-content-between">
          <div className="d-flex gap-2 flex-wrap">
            <InputGroup style={{ width: 220 }}>
              <FormControl
                placeholder="Tìm lớp (client)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <InputGroup style={{ width: 160 }}>
              <FormControl
                placeholder="Mã môn"
                value={filters.courseCode}
                onChange={(e) =>
                  setFilters({ ...filters, courseCode: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup style={{ width: 120 }}>
              <FormControl
                type="number"
                placeholder="Học kỳ"
                value={filters.semester}
                onChange={(e) =>
                  setFilters({ ...filters, semester: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup style={{ width: 120 }}>
              <FormControl
                type="number"
                placeholder="Năm"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
              />
            </InputGroup>
            <Button onClick={loadClasses} disabled={loading}>
              {loading ? "Đang lọc..." : "Lọc (API)"}
            </Button>
          </div>

          <Button
            variant="success"
            onClick={() => {
              resetForm();
              setEditingClass(null);
              setShowModal(true);
            }}
          >
            Thêm lớp
          </Button>
        </Card.Header>

        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Mã lớp</th>
                <th>HK / Năm</th>
                <th>Sĩ số</th>
                <th>Thời gian</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) => (
                <tr key={cls.id}>
                  <td>{cls.code}</td>
                  <td>
                    HK {cls.semester} / {cls.year}
                  </td>
                  <td>{cls.capacity}</td>
                  <td>
                    {dayName(cls.dayOfWeek)} ({cls.startPeriod}–{cls.endPeriod})
                  </td>
                  <td>{cls.location}</td>
                  <td>
                    {cls.archivedAt ? (
                      <Badge bg="secondary">Đã lưu</Badge>
                    ) : cls.canceledAt ? (
                      <Badge bg="warning">Đã hủy</Badge>
                    ) : (
                      <Badge bg="success">Hoạt động</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => handleEdit(cls)}
                    >
                      Sửa
                    </Button>
                    {!cls.archivedAt && (
                      <>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          className="me-2"
                          onClick={() => handleArchive(cls)}
                        >
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(cls)}
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

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingClass ? "Sửa lớp học phần" : "Thêm lớp học phần"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã lớp</Form.Label>
                  <Form.Control
                    value={classForm.code}
                    disabled={!!editingClass}
                    onChange={(e) =>
                      setClassForm({ ...classForm, code: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã môn</Form.Label>
                  <Form.Control
                    value={classForm.courseCode}
                    onChange={(e) =>
                      setClassForm({ ...classForm, courseCode: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Control
                  placeholder="HK"
                  type="number"
                  value={classForm.semester}
                  onChange={(e) =>
                    setClassForm({ ...classForm, semester: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Năm"
                  type="number"
                  value={classForm.year}
                  onChange={(e) =>
                    setClassForm({ ...classForm, year: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Sĩ số"
                  type="number"
                  value={classForm.capacity}
                  onChange={(e) =>
                    setClassForm({ ...classForm, capacity: e.target.value })
                  }
                  required
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={3}>
                <Form.Control
                  placeholder="Thứ"
                  type="number"
                  value={classForm.dayOfWeek}
                  onChange={(e) =>
                    setClassForm({ ...classForm, dayOfWeek: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Tiết bắt đầu"
                  type="number"
                  value={classForm.startPeriod}
                  onChange={(e) =>
                    setClassForm({ ...classForm, startPeriod: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Tiết kết thúc"
                  type="number"
                  value={classForm.endPeriod}
                  onChange={(e) =>
                    setClassForm({ ...classForm, endPeriod: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Phòng"
                  value={classForm.location}
                  onChange={(e) =>
                    setClassForm({ ...classForm, location: e.target.value })
                  }
                  required
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {editingClass ? "Cập nhật" : "Thêm"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageClasses;
