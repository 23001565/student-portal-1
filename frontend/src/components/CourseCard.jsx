import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

const CourseCard = ({
  course,
  onView,
  onEdit,
  onEnroll,
  actions = ["view", "edit", "enroll"],
}) => {
  if (!course) return null;

  const { code, name, credits, instructor, schedule, archivedAt } = course;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="mb-0">{name}</h5>
              {archivedAt ? (
                <Badge bg="secondary">Archived</Badge>
              ) : (
                <Badge bg="success">Active</Badge>
              )}
            </div>
            <div className="text-muted mb-2">
              <span className="me-3">
                <strong>Code:</strong> {code}
              </span>
              {typeof credits !== "undefined" && (
                <span className="me-3">
                  <strong>Credits:</strong> {credits}
                </span>
              )}
              {instructor && (
                <span className="me-3">
                  <strong>Instructor:</strong> {instructor}
                </span>
              )}
            </div>
            {schedule && (
              <div className="small text-muted">
                <strong>Schedule:</strong> {schedule}
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            {actions.includes("view") && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onView?.(course)}
              >
                View
              </Button>
            )}
            {actions.includes("edit") && !archivedAt && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onEdit?.(course)}
              >
                Edit
              </Button>
            )}
            {actions.includes("enroll") && !archivedAt && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEnroll?.(course)}
              >
                Enroll
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
