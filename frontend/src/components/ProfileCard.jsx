import React from "react";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";

// Props:
// user: { name, email, role, studentId, department, avatarUrl }
// onEdit?: () => void
// onLogout?: () => void
const ProfileCard = ({ user = {}, onEdit, onLogout }) => {
  const { name, email, role, studentId, department, avatarUrl } = user;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Row className="align-items-center g-3">
          <Col xs="auto">
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e9ecef",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || "avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span className="text-muted" style={{ fontSize: 24 }}>
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
          </Col>
          <Col>
            <h5 className="mb-1 d-flex align-items-center gap-2">
              {name || "Unnamed User"}
              {role && <Badge bg="info">{role}</Badge>}
            </h5>
            {email && <div className="text-muted small mb-1">{email}</div>}
            <div className="text-muted small">
              {studentId && (
                <span className="me-3">
                  <strong>ID:</strong> {studentId}
                </span>
              )}
              {department && (
                <span>
                  <strong>Dept:</strong> {department}
                </span>
              )}
            </div>
          </Col>
          <Col
            xs="12"
            md="auto"
            className="d-flex gap-2 justify-content-md-end"
          >
            {onEdit && (
              <Button variant="outline-primary" size="sm" onClick={onEdit}>
                Edit Profile
              </Button>
            )}
            {onLogout && (
              <Button variant="outline-danger" size="sm" onClick={onLogout}>
                Logout
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;
