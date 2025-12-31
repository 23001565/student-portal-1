import React, { useState } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AnnouncementForm from "../../components/AnnouncementForm";
import { createAnnouncement } from "../../api/announcementApi";

const PostAnnouncement = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError(null);

   
      await createAnnouncement({
        title: payload.title,
        content: payload.content,
      });

      //  After success, go back to list
      navigate("/admin/announcements");
    } catch (err) {
      console.error(err);
      setError(err.message || "Không thể đăng thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h2>Đăng thông báo</h2>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Quay lại
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={{ span: 10, offset: 1 }}>
          <AnnouncementForm
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default PostAnnouncement;
