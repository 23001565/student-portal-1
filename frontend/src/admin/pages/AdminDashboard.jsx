import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi"; // Import API

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Khởi tạo state rỗng, không dùng mock data
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    recentAnnouncements: []
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
      <PageFrame title="Quản trị hệ thống" subtitle="Tổng quan tình hình đào tạo">
        <Container fluid className="p-0">
          {/* Thẻ Thống kê */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card className="shadow-sm border-0 h-100 text-center py-3">
                <Card.Body>
                  <h3 className="display-6 fw-bold text-primary">{stats.totalStudents}</h3>
                  <div className="text-muted">Tổng sinh viên</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 h-100 text-center py-3">
                <Card.Body>
                  <h3 className="display-6 fw-bold text-success">{stats.totalClasses}</h3>
                  <div className="text-muted">Lớp học phần</div>
                </Card.Body>
              </Card>
            </Col>
            {/* Bạn có thể thêm các thẻ thống kê khác nếu API trả về */}
          </Row>

          <Row>
            {/* Danh sách thông báo mới nhất */}
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0">Thông báo gần đây</h5>
                </Card.Header>
                <Card.Body>
                  {stats.recentAnnouncements?.length > 0 ? (
                    <div>
                      {stats.recentAnnouncements.map((ann) => (
                        <div key={ann.id} className="border-bottom py-2">
                          <div className="fw-bold">{ann.title}</div>
                          <small className="text-muted">
                            {new Date(ann.postedAt).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="info">Chưa có thông báo nào</Alert>
                  )}
                  <div className="mt-3 text-end">
                    <button className="btn btn-link" onClick={() => navigate("/admin/announcements")}>
                        Quản lý thông báo &rarr;
                    </button>
                  </div>
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