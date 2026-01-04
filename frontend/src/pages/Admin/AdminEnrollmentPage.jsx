import React, { useEffect, useState } from 'react';
import PageFrame from '../../components/PageFrame';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import {
  listEnrollments,
  deleteEnrollment,
  updateGrade,
  uploadGradeCSV,
} from '../../api/adminEnrollmentApi';

export default function AdminEnrollmentPage() {
  const [filters, setFilters] = useState({ semester: '', year: '', classCode: '', courseCode: '', studentCode: '' });
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    midTerm: '',
    finalExam: '',
    total10Scale: '',
  });

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await listEnrollments(filters);
      setEnrollments(data.items || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line
  }, [filters]);


  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return;
    try {
      await deleteEnrollment(id);
      fetchEnrollments();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditGrade = (enrollment) => {
    setEditingEnrollment(enrollment);
    setGradeForm({
      midTerm: enrollment.midTerm || '',
      finalExam: enrollment.finalExam || '',
      total10Scale: enrollment.total10Scale || '',
    });
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateGrade(editingEnrollment.id, gradeForm);
      fetchEnrollments();
      setShowGradeModal(false);
      setEditingEnrollment(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUploadCSV = async () => {
    if (!csvFile) return;
    const classCode = prompt('Class Code for CSV upload?');
    if (!classCode) return;
    try {
      await uploadGradeCSV(classCode, csvFile);
      fetchEnrollments();
      setCsvFile(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <PageFrame
      title="Admin Enrollment Management"
      headerActions={
        <div className="d-flex gap-2 flex-wrap">
          <InputGroup style={{ width: 120 }}>
            <FormControl
              placeholder="Semester"
              value={filters.semester}
              onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}
            />
          </InputGroup>
          <InputGroup style={{ width: 120 }}>
            <FormControl
              placeholder="Year"
              value={filters.year}
              onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
            />
          </InputGroup>
          <InputGroup style={{ width: 140 }}>
            <FormControl
              placeholder="Class Code"
              value={filters.classCode}
              onChange={e => setFilters(f => ({ ...f, classCode: e.target.value }))}
            />
          </InputGroup>
          <InputGroup style={{ width: 140 }}>
            <FormControl
              placeholder="Course Code"
              value={filters.courseCode}
              onChange={e => setFilters(f => ({ ...f, courseCode: e.target.value }))}
            />
          </InputGroup>
          <InputGroup style={{ width: 140 }}>
            <FormControl
              placeholder="Student Code"
              value={filters.studentCode}
              onChange={e => setFilters(f => ({ ...f, studentCode: e.target.value }))}
            />
          </InputGroup>
        </div>
      }
    >
      <Container fluid className="py-4">
        <Row className="mb-3">
          <Col>
            <InputGroup style={{ width: 300 }}>
              <FormControl
                type="file"
                accept=".csv"
                onChange={e => setCsvFile(e.target.files[0])}
              />
              <Button onClick={handleUploadCSV} disabled={!csvFile}>Upload Grade CSV</Button>
            </InputGroup>
          </Col>
        </Row>
        {error && <Row><Col><div className="text-danger">{error}</div></Col></Row>}
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Year</th>
                  <th>Class Code</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Student Code</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Midterm</th>
                  <th>Final</th>
                  <th>Total (10)</th>
                  <th>Total (4)</th>
                  <th>Letter</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={14}>Loading...</td></tr>
                ) : enrollments.length === 0 ? (
                  <tr><td colSpan={14}>No enrollments found.</td></tr>
                ) : enrollments.map(enr => (
                  <tr key={enr.id}>
                    <td>{enr.semester}</td>
                    <td>{enr.year}</td>
                    <td>{enr.classCode}</td>
                    <td>{enr.courseCode}</td>
                    <td>{enr.courseName}</td>
                    <td>{enr.studentCode}</td>
                    <td>{enr.studentName}</td>
                    <td>{enr.status}</td>
                    <td>{enr.midTerm}</td>
                    <td>{enr.finalExam}</td>
                    <td>{enr.total10Scale}</td>
                    <td>{enr.total4Scale}</td>
                    <td>{enr.letterGrade}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleEditGrade(enr)}
                      >
                        Edit Grade
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(enr.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Grade Edit Modal */}
        <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Grades</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleGradeSubmit}>
            <Modal.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Midterm Grade</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={gradeForm.midTerm}
                      onChange={(e) => setGradeForm({ ...gradeForm, midTerm: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Final Exam Grade</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={gradeForm.finalExam}
                      onChange={(e) => setGradeForm({ ...gradeForm, finalExam: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total (10 Scale)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={gradeForm.total10Scale}
                      onChange={(e) => setGradeForm({ ...gradeForm, total10Scale: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowGradeModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Grades
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </PageFrame>
  );
}
