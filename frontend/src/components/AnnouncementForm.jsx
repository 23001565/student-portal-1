import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";

const AnnouncementForm = ({
  onSubmit,
  initialValues,
  submitting = false,
}) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [content, setContent] = useState(initialValues?.content || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ title, content });
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Đăng thông báo</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang đăng..." : "Đăng thông báo"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AnnouncementForm;
