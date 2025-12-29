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
                variant="success"
                onClick={() => navigate("/admin/post-announcement")}
              >
                Đăng thông báo
              </Button>
              <Button
                variant="success"
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
            <Col key={a.id} md={6} lg={4} className="mb-4">
              <Card className={`announcement-card h-100 priority-${a.priority}`}>
                <Card.Header>
  {/* Đổi align-items-center thành align-items-start để căn lề trên */}
  <div className="d-flex justify-content-between align-items-start">
    
    {/* --- SỬA Ở ĐÂY: Bỏ text-truncate và maxWidth --- */}
    <h6 className="mb-0 me-3" style={{ lineHeight: '1.4' }}>
        {a.title}
    </h6>
    {/* ----------------------------------------------- */}

    {/* Thêm whiteSpace: 'nowrap' để giữ Badge luôn thẳng hàng, không bị méo */}
    <Badge 
      bg={priorityVariant[a.priority] || "secondary"} 
      style={{ whiteSpace: 'nowrap', marginTop: '2px' }}
    >
      {a.priority === "high"
        ? "Ưu tiên cao"
        : a.priority === "normal"
        ? "Bình thường"
        : "Thấp"}
    </Badge>
  </div>
</Card.Header>
                <Card.Body className="d-flex flex-column">
                  <p className="mb-3 text-secondary small flex-grow-1">
                    {a.content.length > 140
                      ? `${a.content.slice(0, 140)}...`
                      : a.content}
                  </p>
                  
                  {/* --- PHẦN ĐÃ SỬA GIAO DIỆN --- */}
                  {/* --- ĐOẠN CODE ĐÃ SỬA: 3 DÒNG RIÊNG BIỆT --- */}
<div className="mt-auto pt-3 border-top">

  {/* Dòng 1: ĐỐI TƯỢNG */}
  <div className="mb-2">
    <span className="text-muted fw-bold text-uppercase me-2" style={{ fontSize: '0.7rem' }}>
      ĐỐI TƯỢNG:
    </span>
    <span className="fw-bold text-dark">
      {a.audience === "all"
        ? "Tất cả"
        : a.audience === "students"
        ? "Sinh viên"
        : "Giảng viên"}
    </span>
  </div>

  {/* Dòng 2: NGƯỜI ĐĂNG */}
  <div className="text-muted small mb-1">
    Đăng bởi <strong>{a.postedBy}</strong>
  </div>

  {/* Dòng 3: NGÀY GIỜ */}
  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
    {formatDateTime(a.postedAt)}
  </div>

</div>
                  {/* ----------------------------- */}

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