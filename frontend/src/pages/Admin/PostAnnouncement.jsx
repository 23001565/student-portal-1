import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AnnouncementForm from "../../components/AnnouncementForm";
import Layout from "../../components/Layout";

const PostAnnouncement = () => {
  const navigate = useNavigate();

  const handleSubmit = (payload) => {
    // TODO: Replace with API call
    console.log("Announcement submitted:", payload);
    navigate("/admin/announcements", { state: { newAnnouncement: payload } });
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
