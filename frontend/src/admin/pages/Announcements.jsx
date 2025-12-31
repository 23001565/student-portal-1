import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Import API
import "../../styles/announcements.css";

const Announcements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminApi.getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Quản lý Thông báo</h2>
          <Button onClick={() => navigate("/admin/post-announcement")}>
            + Đăng thông báo mới
          </Button>
        </div>

        {loading ? (
           <div className="text-center">Đang tải...</div>
        ) : announcements.length > 0 ? (
          <Row>
            {announcements.map((a) => (
              <Col xs={12} key={a.id} className="mb-3">
                <Card className={`announcement-card priority-${a.priority} shadow-sm`}>
                  <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{a.title}</h5>
                    <Badge bg={a.priority === 'high' ? 'danger' : 'info'}>
                        {a.priority}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <p className="card-text">{a.content}</p>
                    <div className="d-flex justify-content-between text-muted small mt-3">
                        <span>Đối tượng: {a.audience}</span>
                        <span>Đăng ngày: {new Date(a.postedAt).toLocaleDateString()}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
            <p className="text-center text-muted">Chưa có thông báo nào.</p>
        )}
      </Container>
    </Layout>
  );
};

export default Announcements;