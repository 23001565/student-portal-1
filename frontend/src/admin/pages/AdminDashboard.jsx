import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageScore: 0,
    attendanceRate: 0,
    classScores: [],
    academicPerformance: {},
    recentAnnouncements: [],
    dropoutRisk: null,
  });

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockData = {
      totalStudents: 1250,
      totalClasses: 42,
      averageScore: 8.5,
      attendanceRate: 98.2,
      classScores: [
        { className: "10A1", score: 8.2 },
        { className: "10A2", score: 8.4 },
        { className: "11B1", score: 8.7 },
        { className: "11B2", score: 8.5 },
        { className: "12A1", score: 8.6 },
        { className: "12A2", score: 8.3 },
      ],
      academicPerformance: {
        excellent: 35,
        good: 40,
        average: 20,
        weak: 5,
      },
      recentAnnouncements: [
        {
          id: 1,
          title: "Lịch thi học kỳ II đã được cập nhật.",
          timeAgo: "2 giờ trước",
          icon: "🔔",
        },
        {
          id: 2,
          title: "Thông báo nghỉ lễ Giỗ Tổ Hùng Vương.",
          timeAgo: "1 ngày trước",
          icon: "📅",
        },
        {
          id: 3,
          title: 'Cuộc thi "Rung chuông vàng" sẽ diễn ra vào tuần tới.',
          timeAgo: "3 ngày trước",
          icon: "🌿",
        },
      ],
      dropoutRisk: {
        studentName: "Nguyễn Văn Hùng",
        className: "10A2",
        absences: 12,
        riskLevel: 85,
      },
    };
    setDashboardData(mockData);
  }, []);

  return (
    <Layout>
      <PageFrame
        title="Bảng điều khiển"
        subtitle="Tổng quan nhanh về hoạt động của trường học hôm nay."
        headerActions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {/* --- NÚT 1: THÊM HỌC SINH (ĐÃ SỬA) --- */}
            <Button
              variant="success" // Đổi thành success (màu xanh lá)
              style={{
                // Đã xóa dòng background: "#9333ea"
                border: "none",
                borderRadius: "0.5rem",
              }}
              onClick={() => navigate("/admin/students")}
            >
              Thêm Học sinh
            </Button>

            {/* --- NÚT 2: TẠO BÁO CÁO (ĐÃ SỬA) --- */}
            <Button
              variant="success" // Đổi thành success
              style={{
                // Đã xóa dòng background: "#9333ea"
                border: "none",
                borderRadius: "0.5rem",
              }}
              onClick={() => navigate("/admin/reports")}
            >
              Tạo Báo cáo
            </Button>
          </div>
        }
      >
        <Container fluid className="py-4">
          {/* KPI Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card
                className="text-center"
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {dashboardData.totalStudents.toLocaleString()}
                  </Card.Title>
                  <Card.Text
                    style={{ color: "#6b7280", marginBottom: "0.5rem" }}
                  >
                    Tổng số học sinh
                  </Card.Text>
                  <small style={{ color: "#10b981", fontWeight: "500" }}>
                    ↑1.5%
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="text-center"
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {dashboardData.totalClasses}
                  </Card.Title>
                  <Card.Text
                    style={{ color: "#6b7280", marginBottom: "0.5rem" }}
                  >
                    Lớp học hoạt động
                  </Card.Text>
                  <small style={{ color: "#10b981", fontWeight: "500" }}>
                    ↑ 2 lớp
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="text-center"
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {dashboardData.averageScore}
                  </Card.Title>
                  <Card.Text
                    style={{ color: "#6b7280", marginBottom: "0.5rem" }}
                  >
                    Điểm trung bình
                  </Card.Text>
                  <small style={{ color: "#ef4444", fontWeight: "500" }}>
                    ↓ 0.1
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="text-center"
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {dashboardData.attendanceRate}%
                  </Card.Title>
                  <Card.Text
                    style={{ color: "#6b7280", marginBottom: "0.5rem" }}
                  >
                    Tỷ lệ chuyên cần
                  </Card.Text>
                  <small style={{ color: "#10b981", fontWeight: "500" }}>
                    ↑0.5%
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row className="mb-4">
            <Col md={6}>
              <Card
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <Card.Header
                  style={{
                    background: "transparent",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem",
                  }}
                >
                  <h5 style={{ margin: 0, fontWeight: "600" }}>
                    Điểm trung bình theo lớp
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-around",
                      height: "200px",
                      gap: "0.5rem",
                    }}
                  >
                    {dashboardData.classScores.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: `${(item.score / 10) * 150}px`,
                            background:
                              item.className === "11B1" ? "#10b981" : "#e5e7eb", // Sửa lại màu cột highlight cho đồng bộ xanh lá luôn (nếu muốn)
                            borderRadius: "0.25rem 0.25rem 0 0",
                            marginBottom: "0.5rem",
                            transition: "all 0.3s",
                            cursor: "pointer",
                          }}
                          title={`${item.className}: ${item.score}`}
                        />
                        <small
                          style={{ fontSize: "0.75rem", color: "#6b7280" }}
                        >
                          {item.className}
                        </small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <Card.Header
                  style={{
                    background: "transparent",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem",
                  }}
                >
                  <h5 style={{ margin: 0, fontWeight: "600" }}>
                    Phân loại học lực
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "200px",
                    }}
                  >
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        background: `conic-gradient(
                        #10b981 0% ${
                          dashboardData.academicPerformance.excellent
                        }%,
                        #3b82f6 ${
                          dashboardData.academicPerformance.excellent
                        }% ${
                          dashboardData.academicPerformance.excellent +
                          dashboardData.academicPerformance.good
                        }%,
                        #f59e0b ${
                          dashboardData.academicPerformance.excellent +
                          dashboardData.academicPerformance.good
                        }% ${
                          dashboardData.academicPerformance.excellent +
                          dashboardData.academicPerformance.good +
                          dashboardData.academicPerformance.average
                        }%,
                        #ef4444 ${
                          dashboardData.academicPerformance.excellent +
                          dashboardData.academicPerformance.good +
                          dashboardData.academicPerformance.average
                        }% 100%
                      )`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1rem",
                      justifyContent: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      <span style={{ fontSize: "0.875rem" }}>• Giỏi</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#3b82f6",
                        }}
                      />
                      <span style={{ fontSize: "0.875rem" }}>• Khá</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#f59e0b",
                        }}
                      />
                      <span style={{ fontSize: "0.875rem" }}>• TB</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#ef4444",
                        }}
                      />
                      <span style={{ fontSize: "0.875rem" }}>• Yếu</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notifications and Dropout Risk */}
          <Row>
            <Col md={6}>
              <Card
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Header
                  style={{
                    background: "transparent",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem",
                  }}
                >
                  <h5 style={{ margin: 0, fontWeight: "600" }}>
                    Dự báo nguy cơ nghỉ học
                  </h5>
                </Card.Header>
                <Card.Body>
                  {dashboardData.dropoutRisk && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ef4444",
                            fontSize: "1.25rem",
                          }}
                        >
                          ⚠️
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.875rem",
                              color: "#6b7280",
                              marginBottom: "0.5rem",
                            }}
                          >
                            AI phân tích dựa trên chuyên cần & điểm số
                          </p>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: "600",
                                  color: "#111827",
                                }}
                              >
                                {dashboardData.dropoutRisk.studentName}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                }}
                              >
                                {dashboardData.dropoutRisk.className} • Nghỉ{" "}
                                {dashboardData.dropoutRisk.absences} buổi
                              </p>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              style={{
                                borderColor: "#9333ea",
                                color: "#9333ea",
                              }}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            Mức độ rủi ro
                          </span>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#ef4444",
                            }}
                          >
                            {dashboardData.dropoutRisk.riskLevel}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "#fee2e2",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${dashboardData.dropoutRisk.riskLevel}%`,
                              height: "100%",
                              background: "#ef4444",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card
                style={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Header
                  style={{
                    background: "transparent",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem",
                  }}
                >
                  <h5 style={{ margin: 0, fontWeight: "600" }}>
                    Thông báo mới
                  </h5>
                </Card.Header>
                <Card.Body>
                  {dashboardData.recentAnnouncements.length > 0 ? (
                    <div>
                      {dashboardData.recentAnnouncements.map((announcement) => (
                        <div
                          key={announcement.id}
                          style={{
                            padding: "0.75rem 0",
                            borderBottom:
                              announcement.id !==
                              dashboardData.recentAnnouncements.length
                                ? "1px solid #e5e7eb"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.75rem",
                            }}
                          >
                            <span style={{ fontSize: "1.25rem" }}>
                              {announcement.icon}
                            </span>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.875rem",
                                  color: "#111827",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {announcement.title}
                              </p>
                              <small
                                style={{
                                  color: "#9ca3af",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {announcement.timeAgo}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="link"
                        style={{
                          marginTop: "1rem",
                          padding: 0,
                          color: "#9333ea",
                          textDecoration: "none",
                        }}
                        onClick={() => navigate("/admin/announcements")}
                      >
                        Xem tất cả thông báo
                      </Button>
                    </div>
                  ) : (
                    <Alert variant="info">Không có thông báo mới</Alert>
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