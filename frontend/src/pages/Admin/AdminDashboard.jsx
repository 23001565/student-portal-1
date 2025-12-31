import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { listAnnouncements } from "../../api/announcementApi.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await listAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("vi-VN");

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h2>Trang quản lý</h2>
          <Button
            variant="primary"
            onClick={() => navigate("/admin/announcements")}
          >
            Quản lý thông báo
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Thông báo gần đây</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <Alert variant="secondary">Đang tải thông báo...</Alert>
              ) : announcements.length > 0 ? (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className="mb-3 p-3 border rounded"
                  >
                    <h6 className="mb-2">{a.title}</h6>
                    <p className="text-muted small mb-1">
                      {a.content.length > 150
                        ? `${a.content.substring(0, 150)}...`
                        : a.content}
                    </p>
                    <small className="text-muted">
                      Đăng lúc {formatDateTime(a.createdAt)}
                    </small>
                  </div>
                ))
              ) : (
                <Alert variant="info">
                  Chưa có thông báo nào được đăng
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
