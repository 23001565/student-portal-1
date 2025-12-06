import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalClasses: 0,
    activeEnrollments: 0,
    recentAnnouncements: [],
    upcomingExams: [],
    registrationWindows: [],
  });

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockData = {
      totalStudents: 150,
      totalCourses: 25,
      totalClasses: 45,
      activeEnrollments: 320,
      recentAnnouncements: [
        {
          id: 1,
          title: "Chào mừng trở lại học kỳ 1!",
          content:
            "Học kỳ 1 bắt đầu vào ngày 1 tháng 3 năm 2025. Vui lòng kiểm tra lịch học của bạn.",
          postedAt: "2025-10-23 09:25:51",
          postedBy: "Quản trị viên 1",
        },
        {
          id: 2,
          title: "Ngày thi cuối kỳ đã được công bố",
          content: "Ngày thi cuối kỳ đã được công bố trên hệ thống. Vui lòng kiểm tra lịch thi của bạn.",
          postedAt: "2025-10-23 09:25:51",
          postedBy: "Quản trị viên 2",
        },
      ],
      upcomingExams: [
        {
          id: 1,
          courseName: "Lập trình cơ bản",
          examDate: "2025-05-10 09:00:00",
          location: "A101",
          className: "CS101-1",
        },
        {
          id: 2,
          courseName: "Cấu trúc dữ liệu",
          examDate: "2025-05-12 09:00:00",
          location: "A102",
          className: "CS201-1",
        },
      ],
      registrationWindows: [
        {
          id: 1,
          startTime: "2025-01-01 00:00:00",
          endTime: "2025-02-01 00:00:00",
          semester: 1,
          year: 2025,
          isActive: true,
        },
      ],
    };
    setDashboardData(mockData);
  }, []);

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">Hoạt động</Badge>
    ) : (
      <Badge bg="secondary">Không hoạt động</Badge>
    );
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Trang quản lý</h2>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-primary">
                {dashboardData.totalStudents}
              </Card.Title>
              <Card.Text>Tổng số sinh viên</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-success">
                {dashboardData.totalCourses}
              </Card.Title>
              <Card.Text>Tổng số môn học</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-warning">
                {dashboardData.totalClasses}
              </Card.Title>
              <Card.Text>Lớp học hoạt động</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-info">
                {dashboardData.activeEnrollments}
              </Card.Title>
              <Card.Text>Đăng ký hoạt động</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Announcements */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Thông báo gần đây</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/admin/announcements")}
              >
                Quản lý
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentAnnouncements.length > 0 ? (
                <div>
                  {dashboardData.recentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="mb-3 p-3 border rounded"
                    >
                      <h6 className="mb-2">{announcement.title}</h6>
                      <p className="text-muted small mb-1">
                        {announcement.content.length > 100
                          ? `${announcement.content.substring(0, 100)}...`
                          : announcement.content}
                      </p>
                      <small className="text-muted">
                        Bởi {announcement.postedBy} •{" "}
                        {formatDateTime(announcement.postedAt)}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info">Không có thông báo gần đây</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Exams */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Kỳ thi sắp tới</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/admin/exams")}
              >
                Quản lý
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.upcomingExams.length > 0 ? (
                <Table responsive size="sm">
                  <thead>
                    <tr>
                      <th>Môn học</th>
                      <th>Lớp học</th>
                      <th>Ngày</th>
                      <th>Vị trí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.upcomingExams.map((exam) => (
                      <tr key={exam.id}>
                        <td>{exam.courseName}</td>
                        <td>{exam.className}</td>
                        <td>{formatDateTime(exam.examDate)}</td>
                        <td>{exam.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Không có kỳ thi sắp tới</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Registration Windows */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Cửa sổ đăng ký</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/admin/registration-windows")}
              >
                Quản lý
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.registrationWindows.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Học kỳ</th>
                      <th>Năm</th>
                      <th>Giờ bắt đầu</th>
                      <th>Giờ kết thúc</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.registrationWindows.map((window) => (
                      <tr key={window.id}>
                        <td>{window.semester}</td>
                        <td>{window.year}</td>
                        <td>{formatDateTime(window.startTime)}</td>
                        <td>{formatDateTime(window.endTime)}</td>
                        <td>{getStatusBadge(window.isActive)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Không có cửa sổ đăng ký</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Hành động nhanh</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-2">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => navigate("/admin/courses")}
                  >
                    Quản lý môn học
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={() => navigate("/admin/students")}
                  >
                    Quản lý sinh viên
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button
                    variant="info"
                    className="w-100"
                    onClick={() => navigate("/admin/reports")}
                  >
                    Xem báo cáo
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button
                    variant="warning"
                    className="w-100"
                    onClick={() => navigate("/admin/announcements")}
                  >
                    Đăng bài
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
