import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";

const AnnouncementForm = ({ onSubmit, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [content, setContent] = useState(initialValues?.content || "");
  const [priority, setPriority] = useState(initialValues?.priority || "normal");
  const [audience, setAudience] = useState(initialValues?.audience || "all");

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title,
      content,
      priority,
      audience,
      postedAt: new Date().toISOString(),
      postedBy: "Quản trị viên",
    };
    onSubmit?.(payload);
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Đăng thông báo</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="content">
            <Form.Label>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Nhập nội dung thông báo"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex gap-3 mb-3">
            <Form.Group controlId="priority" style={{ minWidth: 200 }}>
              <Form.Label>Độ ưu tiên</Form.Label>
              <Form.Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Thấp</option>
                <option value="normal">Bình thường</option>
                <option value="high">Cao</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="audience" style={{ minWidth: 200 }}>
              <Form.Label>Đối tượng</Form.Label>
              <Form.Select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="students">Sinh viên</option>
                <option value="lecturers">Giảng viên</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Đăng thông báo
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AnnouncementForm;
