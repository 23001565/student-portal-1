import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Alert,
  Tabs,
  Tab,
  InputGroup,
  FormControl,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState({
    studentStats: {},
    courseStats: {},
    enrollmentStats: {},
    gradeStats: {},
    recentActivity: [],
  });
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterSemester, setFilterSemester] = useState(1);

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockData = {
      studentStats: {
        total: 150,
        byYear: { 1: 45, 2: 38, 3: 35, 4: 32 },
        byMajor: {
          "Công nghệ thông tin": 89,
          "Quản trị kinh doanh": 61,
        },
        active: 145,
        archived: 5,
      },
      courseStats: {
        total: 25,
        active: 23,
        archived: 2,
        byCredits: { 1: 2, 2: 5, 3: 15, 4: 3 },
        popularCourses: [
          { name: "Lập trình cơ bản", enrollments: 45 },
          { name: "Cấu trúc dữ liệu", enrollments: 38 },
          { name: "Nguyên lý quản lý", enrollments: 35 },
        ],
      },
      enrollmentStats: {
        total: 320,
        active: 285,
        completed: 25,
        canceled: 10,
        bySemester: { 1: 180, 2: 140 },
        byStatus: {
          active: 285,
          completed: 25,
          canceled: 10,
        },
      },
      gradeStats: {
        averageGrade: 7.8,
        gradeDistribution: {
          "A (9.0-10.0)": 15,
          "B+ (8.0-8.9)": 25,
          "B (7.0-7.9)": 35,
          "C+ (6.0-6.9)": 20,
          "C (5.0-5.9)": 5,
        },
        passRate: 85.5,
        topPerformers: [
          { student: "Alice Nguyen", average: 9.2, courses: 5 },
          { student: "Bob Tran", average: 8.8, courses: 4 },
          { student: "Carol Le", average: 8.5, courses: 3 },
        ],
      },
      recentActivity: [
        {
          id: 1,
          type: "Đăng ký",
          description: "Đăng ký mới trong CS101-1",
          student: "Alice Nguyen",
          timestamp: "2025-10-23 10:30:00",
        },
        {
          id: 2,
          type: "Điểm",
          description: "Điểm được cập nhật cho CS201",
          student: "Bob Tran",
          timestamp: "2025-10-23 09:15:00",
        },
        {
          id: 3,
          type: "Môn học",
          description: "Môn học mới được thêm: Cấu trúc dữ liệu",
          admin: "Quản trị viên 1",
          timestamp: "2025-10-22 16:45:00",
        },
      ],
    };
    setReportData(mockData);
  }, [filterYear, filterSemester]);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "Đăng ký":
        return "📚";
      case "Điểm":
        return "📊";
      case "Môn học":
        return "📝";
      default:
        return "📄";
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 9.0) return "Xuất sắc";
    if (grade >= 8.0) return "Giỏi";
    if (grade >= 7.0) return "Khá";
    if (grade >= 5.0) return "Trung bình";
    return "Yếu";
  };

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
                  style={{ width: "100px" }}
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(parseInt(e.target.value))}
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                </Form.Select>
                <Button
                  variant="primary"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Quay về Trang chủ
                </Button>
              </div>
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
              <Tab eventKey="overview" title="Tổng quan">
                <Row>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title className="text-primary">
                          {reportData.studentStats.total || 0}
                        </Card.Title>
                        <Card.Text>Tổng số học sinh</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title className="text-success">
                          {reportData.courseStats.total || 0}
                        </Card.Title>
                        <Card.Text>Tổng số môn học</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title className="text-warning">
                          {reportData.enrollmentStats.total || 0}
                        </Card.Title>
                        <Card.Text>Tổng số đăng ký</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title className="text-info">
                          {reportData.gradeStats.averageGrade || 0}
                        </Card.Title>
                        <Card.Text>Điểm trung bình</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Học sinh theo năm</h5>
                      </Card.Header>
                      <Card.Body>
                        {Object.entries(
                          reportData.studentStats.byYear || {}
                        ).map(([year, count]) => (
                          <div key={year} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>Năm {year}</span>
                              <span>{count} Học sinh</span>
                            </div>
                            <ProgressBar
                              now={
                                (count / (reportData.studentStats.total || 1)) *
                                100
                              }
                              variant="primary"
                              style={{ height: "8px" }}
                            />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Học sinh theo chuyên ngành</h5>
                      </Card.Header>
                      <Card.Body>
                        {Object.entries(
                          reportData.studentStats.byMajor || {}
                        ).map(([major, count]) => (
                          <div key={major} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>{major}</span>
                              <span>{count} Học sinh</span>
                            </div>
                            <ProgressBar
                              now={
                                (count / (reportData.studentStats.total || 1)) *
                                100
                              }
                              variant="success"
                              style={{ height: "8px" }}
                            />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="courses" title="Phân tích môn học">
                <Row>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Thống kê môn học</h5>
                      </Card.Header>
                      <Card.Body>
                        <Table responsive>
                          <tbody>
                            <tr>
                              <td>
                                <strong>Tổng số môn học</strong>
                              </td>
                              <td>{reportData.courseStats.total || 0}</td>
                            </tr>
                            <tr>
                              <td>
                                <strong>Môn học đang hoạt động</strong>
                              </td>
                              <td>
                                <Badge bg="success">
                                  {reportData.courseStats.active || 0}
                                </Badge>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <strong>Môn học đã lưu</strong>
                              </td>
                              <td>
                                <Badge bg="secondary">
                                  {reportData.courseStats.archived || 0}
                                </Badge>
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Môn học phổ biến</h5>
                      </Card.Header>
                      <Card.Body>
                        {(reportData.courseStats.popularCourses || []).map(
                          (course, index) => (
                            <div
                              key={index}
                              className="mb-3 p-3 border rounded"
                            >
                              <div className="d-flex justify-content-between">
                                <span>{course.name}</span>
                                <Badge bg="primary">
                                  {course.enrollments} đăng ký
                                </Badge>
                              </div>
                            </div>
                          )
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="enrollments" title="Phân tích đăng ký">
                <Row>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Trạng thái đăng ký</h5>
                      </Card.Header>
                      <Card.Body>
                        <Table responsive>
                          <tbody>
                            <tr>
                              <td>
                                <strong>Tổng số đăng ký</strong>
                              </td>
                              <td>{reportData.enrollmentStats.total || 0}</td>
                            </tr>
                            <tr>
                              <td>
                                <strong>Đang học</strong>
                              </td>
                              <td>
                                <Badge bg="success">
                                  {reportData.enrollmentStats.active || 0}
                                </Badge>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <strong>Đã hoàn thành</strong>
                              </td>
                              <td>
                                <Badge bg="info">
                                  {reportData.enrollmentStats.completed || 0}
                                </Badge>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <strong>Đã hủy</strong>
                              </td>
                              <td>
                                <Badge bg="danger">
                                  {reportData.enrollmentStats.canceled || 0}
                                </Badge>
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Đăng ký theo học kỳ</h5>
                      </Card.Header>
                      <Card.Body>
                        {Object.entries(
                          reportData.enrollmentStats.bySemester || {}
                        ).map(([semester, count]) => (
                          <div key={semester} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>Semester {semester}</span>
                              <span>{count} đăng ký</span>
                            </div>
                            <ProgressBar
                              now={
                                (count /
                                  (reportData.enrollmentStats.total || 1)) *
                                100
                              }
                              variant="warning"
                              style={{ height: "8px" }}
                            />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="grades" title="Phân tích điểm">
                <Row>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Phân phối điểm</h5>
                      </Card.Header>
                      <Card.Body>
                        {Object.entries(
                          reportData.gradeStats.gradeDistribution || {}
                        ).map(([grade, count]) => (
                          <div key={grade} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>{grade}</span>
                              <span>{count} học sinh</span>
                            </div>
                            <ProgressBar
                              now={(count / 100) * 100}
                              variant="info"
                              style={{ height: "8px" }}
                            />
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Top Điểm cao</h5>
                      </Card.Header>
                      <Card.Body>
                        <Table responsive size="sm">
                          <thead>
                            <tr>
                              <th>Học sinh</th>
                              <th>Điểm trung bình</th>
                              <th>Môn học</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(reportData.gradeStats.topPerformers || []).map(
                              (performer, index) => (
                                <tr key={index}>
                                  <td>{performer.student}</td>
                                  <td>
                                    <Badge
                                      bg={getGradeColor(performer.average)}
                                    >
                                      {performer.average}
                                    </Badge>
                                  </td>
                                  <td>{performer.courses}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Tổng quan hiệu suất học tập</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={4}>
                            <div className="text-center">
                              <h3 className="text-primary">
                                {reportData.gradeStats.averageGrade || 0}
                              </h3>
                              <p>Average Grade</p>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="text-center">
                              <h3 className="text-success">
                                {reportData.gradeStats.passRate || 0}%
                              </h3>
                              <p>Tỷ lệ qua môn</p>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="text-center">
                              <h3 className="text-info">85%</h3>
                              <p>Tỷ lệ giữ học sinh</p>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="activity" title="Hoạt động gần đây">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Hệ thống hoạt động</h5>
                  </Card.Header>
                  <Card.Body>
                    {(reportData.recentActivity || []).length > 0 ? (
                      <div>
                        {(reportData.recentActivity || []).map((activity) => (
                          <div
                            key={activity.id}
                            className="mb-3 p-3 border rounded"
                          >
                            <div className="d-flex align-items-center">
                              <span
                                className="me-3"
                                style={{ fontSize: "1.5rem" }}
                              >
                                {getActivityIcon(activity.type)}
                              </span>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{activity.description}</h6>
                                <small className="text-muted">
                                  {activity.student &&
                                    `Học sinh: ${activity.student}`}
                                  {activity.admin &&
                                    `Quản trị viên: ${activity.admin}`}
                                  {" • "}
                                  {formatDateTime(activity.timestamp)}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">Không có hoạt động gần đây</Alert>
                    )}
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
