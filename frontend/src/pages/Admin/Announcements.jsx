import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/announcements.css";

const mockAnnouncements = [
  {
    id: 1,
    title: "Chào mừng trở lại học kỳ 1!",
    content:
      "Học kỳ 1 bắt đầu vào ngày 1 tháng 3 năm 2025. Vui lòng kiểm tra lịch học của bạn.",
    postedAt: "2025-10-23T09:25:51Z",
    postedBy: "Quản trị viên 1",
    priority: "high",
    audience: "all",
  },
  {
    id: 2,
    title: "Ngày thi cuối kỳ đã được công bố",
    content:
      "Ngày thi cuối kỳ đã được công bố trên hệ thống. Vui lòng kiểm tra lịch thi của bạn.",
    postedAt: "2025-10-20T10:00:00Z",
    postedBy: "Quản trị viên 2",
    priority: "normal",
    audience: "students",
  },
];

const priorityVariant = {
  low: "secondary",
  normal: "info",
  high: "danger",
};

const Announcements = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState(mockAnnouncements);

  useEffect(() => {
    const newAnnouncement = location.state?.newAnnouncement;
    if (newAnnouncement) {
      setAnnouncements((prev) => [
        { id: Date.now(), ...newAnnouncement },
        ...prev,
      ]);
    }
  }, [location.state]);

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("vi-VN");

  const counts = useMemo(() => {
    return announcements.reduce(
      (acc, cur) => {
        acc.total += 1;
        acc[cur.priority] += 1;
        return acc;
      },
      { total: 0, low: 0, normal: 0, high: 0 }
    );
  }, [announcements]);

  return (
    <Layout>
      <Container fluid className="py-4">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h2>Quản lý thông báo</h2>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigate("/admin/post-announcement")}
              >
                Đăng thông báo
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/dashboard")}
              >
                Trang quản lý
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={12}>
            <Card className="mb-2">
              <Card.Body>
                <div className="d-flex gap-3 flex-wrap">
                  <div>
                    {" "}
                    Tổng: <Badge bg="primary">{counts.total}</Badge>
                  </div>
                  <div>
                    {" "}
                    Cao: <Badge bg="danger">{counts.high}</Badge>
                  </div>
                  <div>
                    {" "}
                    Bình thường: <Badge bg="info">{counts.normal}</Badge>
                  </div>
                  <div>
                    {" "}
                    Thấp: <Badge bg="secondary">{counts.low}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {announcements.length === 0 && (
            <Col>
              <Alert variant="info">Chưa có thông báo nào.</Alert>
            </Col>
          )}

          {announcements.map((a) => (
            <Col key={a.id} md={6} lg={4} className="mb-3">
              <Card className={`announcement-card priority-${a.priority}`}>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{a.title}</h6>
                    <Badge bg={priorityVariant[a.priority] || "secondary"}>
                      {a.priority === "high"
                        ? "Ưu tiên cao"
                        : a.priority === "normal"
                        ? "Bình thường"
                        : "Thấp"}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="mb-2 text-muted small">
                    {a.content.length > 140
                      ? `${a.content.slice(0, 140)}...`
                      : a.content}
                  </p>
                  <div className="d-flex justify-content-between align-items-center small text-muted">
                    <span>
                      Đối tượng:{" "}
                      {a.audience === "all"
                        ? "Tất cả"
                        : a.audience === "students"
                        ? "Sinh viên"
                        : "Giảng viên"}
                    </span>
                    <span>
                      Đăng bởi {a.postedBy} • {formatDateTime(a.postedAt)}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Layout>
  );
};

export default Announcements;
