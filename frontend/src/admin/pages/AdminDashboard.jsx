import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Import API
import "./adminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Khởi tạo state rỗng, không dùng mock data
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    recentAnnouncements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <Layout>
      <PageFrame
        title="Quản trị hệ thống"
        subtitle="Tổng quan tình hình đào tạo"
      >
        <Container fluid className="p-0">
          <Row className="dashboard-grid g-4 g-md-5 mb-4 justify-content-around">
            <Col xs={12} sm={6} lg={5}>
              <Card className="stat-card">
                <Card.Body className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-start justify-content-between">
                    <div>
                      <div className="stat-label mb-1">Tổng sinh viên</div>
                      <div className="stat-value text-primary">
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          stats.totalStudents
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(47,143,47,0.1)",
                      }}
                    >
                      👥
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={5}>
              <Card className="stat-card">
                <Card.Body className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-start justify-content-between">
                    <div>
                      <div className="stat-label mb-1">Lớp học phần</div>
                      <div className="stat-value text-success">
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          stats.totalClasses
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(16,185,129,0.1)",
                      }}
                    >
                      📘
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-3 g-md-4">
            {/* Danh sách thông báo mới nhất */}
            <Col xs={12} lg={7}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3 d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Thông báo gần đây</h5>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate("/admin/announcements")}
                  >
                    Quản lý
                  </button>
                </Card.Header>
                <Card.Body>
                  {stats.recentAnnouncements?.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {stats.recentAnnouncements.map((ann) => (
                        <div
                          key={ann.id}
                          className="list-group-item px-0 py-2 d-flex flex-column"
                        >
                          <div className="fw-semibold text-truncate-2">
                            {ann.title}
                          </div>
                          <small className="text-muted">
                            {new Date(ann.postedAt).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="info" className="mb-0">
                      Chưa có thông báo nào
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </PageFrame>
    </Layout>
  );
};

export default AdminDashboard;
