import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AnnouncementForm from "../../components/AnnouncementForm";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Import API

const PostAnnouncement = () => {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      // Gọi API thật
      await adminApi.createAnnouncement(payload);
      alert("Đăng thông báo thành công!");
      navigate("/admin/announcements");
    } catch (error) {
      alert("Lỗi đăng thông báo: " + error.message);
    }
  };

  return (
    <Layout>
      <Container className="py-4">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h2>Đăng thông báo</h2>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={{ span: 10, offset: 1 }}>
            <AnnouncementForm onSubmit={handleSubmit} />
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default PostAnnouncement;