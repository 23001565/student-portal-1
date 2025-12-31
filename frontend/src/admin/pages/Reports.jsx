import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Table, Button, Form, Badge, Alert, Tabs, Tab, ProgressBar
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Import API thật

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // State dữ liệu mặc định (tránh lỗi undefined khi chưa tải xong)
  const [reportData, setReportData] = useState({
    studentStats: { total: 0, byYear: {}, byMajor: {} },
    courseStats: { total: 0, popularCourses: [] },
    enrollmentStats: { total: 0, bySemester: {} },
    gradeStats: { averageGrade: 0, gradeDistribution: {}, topPerformers: [] },
    recentActivity: [],
  });

  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterSemester, setFilterSemester] = useState(1);

  // Gọi API thật thay vì Mock Data
  useEffect(() => {
    loadReports();
  }, [filterYear, filterSemester]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReports({ year: filterYear, semester: filterSemester });
      setReportData(data);
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    // Nếu timestamp là ID hoặc string chưa chuẩn, xử lý an toàn
    if (!dateTime) return "Vừa xong";
    try {
        return new Date().toLocaleDateString("vi-VN"); // Demo ngày hiện tại vì DB enrollment chưa có createdAt
    } catch { return ""; }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "Đăng ký": return "📚";
      case "Điểm": return "📊";
      case "Môn học": return "📝";
      default: return "📄";
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return "success"; // A
    if (grade >= 7.0) return "primary"; // B
    if (grade >= 5.5) return "info";    // C
    if (grade >= 4.0) return "warning"; // D
    return "danger"; // F
  };

  if (loading) {
    return (
        <Layout>
            <Container fluid className="py-4 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Đang tổng hợp dữ liệu báo cáo...</p>
            </Container>
        </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Báo cáo & Phân tích</h2>
              <div className="d-flex gap-2">
                <Form.Select
                  style={{ width: "120px" }}
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </Form.Select>
                <Form.Select
                  style={{ width: "120px" }}
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(parseInt(e.target.value))}
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                </Form.Select>
                <Button variant="primary" onClick={() => navigate("/admin/dashboard")}>
                  Quay về Dashboard
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
              
              {/* TAB 1: TỔNG QUAN */}
              <Tab eventKey="overview" title="Tổng quan">
                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                      <Card.Body>
                        <Card.Title className="text-primary display-6 fw-bold">
                          {reportData.studentStats.total || 0}
                        </Card.Title>
                        <Card.Text className="text-muted">Tổng sinh viên</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                      <Card.Body>
                        <Card.Title className="text-success display-6 fw-bold">
                          {reportData.courseStats.total || 0}
                        </Card.Title>
                        <Card.Text className="text-muted">Tổng môn học</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                      <Card.Body>
                        <Card.Title className="text-warning display-6 fw-bold">
                          {reportData.enrollmentStats.total || 0}
                        </Card.Title>
                        <Card.Text className="text-muted">Lượt đăng ký</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                      <Card.Body>
                        <Card.Title className="text-info display-6 fw-bold">
                          {reportData.gradeStats.averageGrade || 0}
                        </Card.Title>
                        <Card.Text className="text-muted">Điểm trung bình</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Card className="shadow-sm h-100">
                      <Card.Header className="bg-white"><h5 className="mb-0">Sinh viên theo năm</h5></Card.Header>
                      <Card.Body>
                        {Object.entries(reportData.studentStats.byYear || {}).map(([year, count]) => (
                          <div key={year} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span>Năm thứ {year}</span>
                              <span className="fw-bold">{count} SV</span>
                            </div>
                            <ProgressBar now={(count / (reportData.studentStats.total || 1)) * 100} variant="primary" style={{ height: "8px" }} />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="shadow-sm h-100">
                      <Card.Header className="bg-white"><h5 className="mb-0">Sinh viên theo ngành</h5></Card.Header>
                      <Card.Body>
                        {Object.entries(reportData.studentStats.byMajor || {}).map(([major, count]) => (
                          <div key={major} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span>{major}</span>
                              <span className="fw-bold">{count} SV</span>
                            </div>
                            <ProgressBar now={(count / (reportData.studentStats.total || 1)) * 100} variant="success" style={{ height: "8px" }} />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* TAB 2: PHÂN TÍCH MÔN HỌC */}
              <Tab eventKey="courses" title="Môn học">
                <Row className="g-3">
                    <Col md={12}>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white"><h5 className="mb-0">Các lớp học phần đông nhất</h5></Card.Header>
                            <Card.Body>
                                {reportData.courseStats.popularCourses?.length > 0 ? (
                                    reportData.courseStats.popularCourses.map((c, idx) => (
                                        <div key={idx} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                                            <span>{c.name}</span>
                                            <Badge bg="primary" pill>{c.enrollments} sinh viên</Badge>
                                        </div>
                                    ))
                                ) : <div className="text-muted">Chưa có dữ liệu đăng ký</div>}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
              </Tab>

              {/* TAB 3: PHÂN TÍCH ĐIỂM */}
              <Tab eventKey="grades" title="Điểm số">
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="shadow-sm h-100">
                      <Card.Header className="bg-white"><h5 className="mb-0">Phân phối điểm</h5></Card.Header>
                      <Card.Body>
                        {Object.entries(reportData.gradeStats.gradeDistribution || {}).map(([grade, count]) => (
                          <div key={grade} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span>{grade}</span>
                              <span className="fw-bold">{count} SV</span>
                            </div>
                            <ProgressBar now={(count / (reportData.enrollmentStats.total || 1)) * 100} variant="info" style={{ height: "10px" }} />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="shadow-sm h-100">
                      <Card.Header className="bg-white"><h5 className="mb-0">Top sinh viên điểm cao</h5></Card.Header>
                      <Card.Body>
                        <Table hover size="sm">
                          <thead><tr><th>Sinh viên</th><th>Điểm</th></tr></thead>
                          <tbody>
                            {reportData.gradeStats.topPerformers?.map((p, idx) => (
                              <tr key={idx}>
                                <td>{p.student}</td>
                                <td><Badge bg={getGradeColor(p.average)}>{p.average}</Badge></td>
                              </tr>
                            ))}
                            {reportData.gradeStats.topPerformers?.length === 0 && <tr><td colSpan="2">Chưa có dữ liệu điểm</td></tr>}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* TAB 4: HOẠT ĐỘNG */}
              <Tab eventKey="activity" title="Hoạt động">
                 <Card className="shadow-sm">
                    <Card.Body>
                        {reportData.recentActivity?.length > 0 ? (
                            reportData.recentActivity.map(act => (
                                <div key={act.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                    <div className="me-3 fs-2">{getActivityIcon(act.type)}</div>
                                    <div>
                                        <h6 className="mb-0">{act.description}</h6>
                                        <small className="text-muted">Sinh viên: {act.student} • {formatDateTime(act.timestamp)}</small>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-muted">Chưa có hoạt động nào gần đây</div>}
                    </Card.Body>
                 </Card>
              </Tab>

            </Tabs>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Reports;