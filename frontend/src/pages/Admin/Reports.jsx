import React, { useState, useEffect } from "react";
import {
  Container,Row,Col,Card,Table,Button,Form,Badge,Alert,Tabs,Tab,InputGroup,FormControl, ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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
          "Computer Science": 89,
          "Business Administration": 61,
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
          { name: "Introduction to Programming", enrollments: 45 },
          { name: "Data Structures", enrollments: 38 },
          { name: "Principles of Management", enrollments: 35 },
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
          type: "enrollment",
          description: "New enrollment in CS101-1",
          student: "Alice Nguyen",
          timestamp: "2025-10-23 10:30:00",
        },
        {
          id: 2,
          type: "grade",
          description: "Grade updated for CS201",
          student: "Bob Tran",
          timestamp: "2025-10-23 09:15:00",
        },
        {
          id: 3,
          type: "course",
          description: "New course added: Advanced Programming",
          admin: "admin1",
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
      case "enrollment":
        return "📚";
      case "grade":
        return "📊";
      case "course":
        return "📝";
      default:
        return "📄";
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 9.0) return "success";
    if (grade >= 8.0) return "info";
    if (grade >= 7.0) return "warning";
    if (grade >= 5.0) return "secondary";
    return "danger";
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Reports & Analytics</h2>
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
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
                <option value={3}>Semester 3</option>
              </Form.Select>
              <Button
                variant="primary"
                onClick={() => navigate("/admin/dashboard")}
              >
                Back to Dashboard
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
            <Tab eventKey="overview" title="Overview">
              <Row>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <Card.Title className="text-primary">
                        {reportData.studentStats.total}
                      </Card.Title>
                      <Card.Text>Total Students</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <Card.Title className="text-success">
                        {reportData.courseStats.total}
                      </Card.Title>
                      <Card.Text>Total Courses</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <Card.Title className="text-warning">
                        {reportData.enrollmentStats.total}
                      </Card.Title>
                      <Card.Text>Total Enrollments</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <Card.Title className="text-info">
                        {reportData.gradeStats.averageGrade}
                      </Card.Title>
                      <Card.Text>Average Grade</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Students by Year</h5>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(reportData.studentStats.byYear).map(
                        ([year, count]) => (
                          <div key={year} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>Year {year}</span>
                              <span>{count} students</span>
                            </div>
                            <ProgressBar
                              now={
                                (count / reportData.studentStats.total) * 100
                              }
                              variant="primary"
                              style={{ height: "8px" }}
                            />
                          </div>
                        )
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Students by Major</h5>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(reportData.studentStats.byMajor).map(
                        ([major, count]) => (
                          <div key={major} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>{major}</span>
                              <span>{count} students</span>
                            </div>
                            <ProgressBar
                              now={
                                (count / reportData.studentStats.total) * 100
                              }
                              variant="success"
                              style={{ height: "8px" }}
                            />
                          </div>
                        )
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="courses" title="Course Analytics">
              <Row>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Course Statistics</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive>
                        <tbody>
                          <tr>
                            <td>
                              <strong>Total Courses</strong>
                            </td>
                            <td>{reportData.courseStats.total}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Active Courses</strong>
                            </td>
                            <td>
                              <Badge bg="success">
                                {reportData.courseStats.active}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Archived Courses</strong>
                            </td>
                            <td>
                              <Badge bg="secondary">
                                {reportData.courseStats.archived}
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
                      <h5 className="mb-0">Most Popular Courses</h5>
                    </Card.Header>
                    <Card.Body>
                      {reportData.courseStats.popularCourses.map(
                        (course, index) => (
                          <div key={index} className="mb-3 p-3 border rounded">
                            <div className="d-flex justify-content-between">
                              <span>{course.name}</span>
                              <Badge bg="primary">
                                {course.enrollments} enrollments
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

            <Tab eventKey="enrollments" title="Enrollment Analytics">
              <Row>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Enrollment Status</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive>
                        <tbody>
                          <tr>
                            <td>
                              <strong>Total Enrollments</strong>
                            </td>
                            <td>{reportData.enrollmentStats.total}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Active</strong>
                            </td>
                            <td>
                              <Badge bg="success">
                                {reportData.enrollmentStats.active}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Completed</strong>
                            </td>
                            <td>
                              <Badge bg="info">
                                {reportData.enrollmentStats.completed}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Canceled</strong>
                            </td>
                            <td>
                              <Badge bg="danger">
                                {reportData.enrollmentStats.canceled}
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
                      <h5 className="mb-0">Enrollments by Semester</h5>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(
                        reportData.enrollmentStats.bySemester
                      ).map(([semester, count]) => (
                        <div key={semester} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <span>Semester {semester}</span>
                            <span>{count} enrollments</span>
                          </div>
                          <ProgressBar
                            now={
                              (count / reportData.enrollmentStats.total) * 100
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

            <Tab eventKey="grades" title="Grade Analytics">
              <Row>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Grade Distribution</h5>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(
                        reportData.gradeStats.gradeDistribution
                      ).map(([grade, count]) => (
                        <div key={grade} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <span>{grade}</span>
                            <span>{count} students</span>
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
                      <h5 className="mb-0">Top Performers</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive size="sm">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Average</th>
                            <th>Courses</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.gradeStats.topPerformers.map(
                            (performer, index) => (
                              <tr key={index}>
                                <td>{performer.student}</td>
                                <td>
                                  <Badge bg={getGradeColor(performer.average)}>
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
                      <h5 className="mb-0">Academic Performance Summary</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <div className="text-center">
                            <h3 className="text-primary">
                              {reportData.gradeStats.averageGrade}
                            </h3>
                            <p>Average Grade</p>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <h3 className="text-success">
                              {reportData.gradeStats.passRate}%
                            </h3>
                            <p>Pass Rate</p>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <h3 className="text-info">85%</h3>
                            <p>Retention Rate</p>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="activity" title="Recent Activity">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">System Activity Log</h5>
                </Card.Header>
                <Card.Body>
                  {reportData.recentActivity.length > 0 ? (
                    <div>
                      {reportData.recentActivity.map((activity) => (
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
                                  `Student: ${activity.student}`}
                                {activity.admin && `Admin: ${activity.admin}`}
                                {" • "}
                                {formatDateTime(activity.timestamp)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="info">No recent activity</Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
