import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  listAnnouncements,
  deleteAnnouncement,
  deleteAllAnnouncements,
} from "../../api/announcementApi";

const Announcements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thông báo này?")) return;

    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Xóa thông báo thất bại");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ Xóa TẤT CẢ thông báo?")) return;

    try {
      await deleteAllAnnouncements();
      setAnnouncements([]);
    } catch {
      alert("Xóa tất cả thông báo thất bại");
    }
  };

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("vi-VN");

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h2>Quản lý thông báo</h2>
          <div className="d-flex gap-2">
            <Button onClick={() => navigate("/admin/post-announcement")}>
              Đăng thông báo
            </Button>
            <Button variant="danger" onClick={handleDeleteAll}>
              Xóa tất cả
            </Button>
          </div>
        </Col>
      </Row>

      {loading && <Alert variant="secondary">Đang tải...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {!loading && announcements.length === 0 && (
          <Col>
            <Alert variant="info">Chưa có thông báo nào.</Alert>
          </Col>
        )}

        {announcements.map((a) => (
          <Col key={a.id} md={6} lg={4} className="mb-3">
            <Card>
              <Card.Header>
                <h6 className="mb-0">{a.title}</h6>
              </Card.Header>
              <Card.Body>
                <p className="text-muted small mb-3">
                  {(a.content || "").length > 160
                    ? `${a.content.slice(0, 160)}...`
                    : a.content}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {formatDateTime(a.createdAt)}
                  </small>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(a.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Announcements;
