import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStudentData = async () => {
    // Mock data
    const mockStudent = {
      id: parseInt(id),
      code: "HS12345",
      name: "Nguyễn Văn An",
      className: "12A1",
      dateOfBirth: "15/08/2006",
      gender: "Nam",
      placeOfBirth: "TP. Hồ Chí Minh",
      address: "123 Đường ABC, Phường 4, Quận 5, TP. Hồ Chí Minh",
      gpa: 8.5,
      academicPerformance: "Giỏi",
      conduct: "Tốt",
      ranking: "5/45",
      semester: "Học kỳ 1 (2023-2024)",
      subjects: [
        { name: "Toán", midterm: 8.0, final: 9.0, average: 8.7 },
        { name: "Vật lý", midterm: 7.5, final: 8.5, average: 8.2 },
        { name: "Hóa học", midterm: 8.5, final: 8.0, average: 8.3 },
        { name: "Sinh học", midterm: 9.0, final: 8.5, average: 8.8 },
        { name: "Ngữ văn", midterm: 8.0, final: 8.5, average: 8.3 },
        { name: "Lịch sử", midterm: 7.5, final: 8.0, average: 7.8 },
      ],
      parent: {
        motherName: "Trần Thị B",
        phone: "0909 123 456",
        email: "phuhuynh.an@email.com",
      },
    };
    setStudent(mockStudent);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "scores", label: "Điểm số chi tiết" },
    { id: "conduct", label: "Hạnh kiểm" },
    { id: "health", label: "Thông tin sức khỏe" },
  ];

  return (
    <Layout>
      <PageFrame>
        {/* Student Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
            paddingBottom: "1.5rem",
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #9333ea, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {student.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              {student.name}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: 0,
                fontSize: "1rem",
              }}
            >
              Mã số: {student.code} | Lớp: {student.className}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/students/${id}/edit`)}
            >
              Sửa thông tin
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
            >
              In hồ sơ
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.75rem 1.5rem",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid #9333ea"
                    : "3px solid transparent",
                color:
                  activeTab === tab.id ? "#9333ea" : "var(--text-secondary)",
                fontWeight: activeTab === tab.id ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "1rem",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-2 gap-6">
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">Thông tin cá nhân</div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Ngày sinh:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.dateOfBirth}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Giới tính:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.gender}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Nơi sinh:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.placeOfBirth}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Địa chỉ:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Results */}
            <div className="card">
              <div className="card-header">
                Kết quả học tập - {student.semester}
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      padding: "1rem",
                      background: "#f3e8ff",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      ĐTB
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#9333ea",
                      }}
                    >
                      {student.gpa}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "1rem",
                      background: "#d1fae5",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Học lực
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#10b981",
                      }}
                    >
                      {student.academicPerformance}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "1rem",
                      background: "#d1fae5",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Hạnh kiểm
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#10b981",
                      }}
                    >
                      {student.conduct}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "1rem",
                      background: "#f3f4f6",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Xếp hạng
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      {student.ranking}
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>MÔN HỌC</th>
                        <th>GIỮA KỲ</th>
                        <th>CUỐI KỲ</th>
                        <th>TRUNG BÌNH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.subjects.map((subject, index) => (
                        <tr key={index}>
                          <td className="font-medium">{subject.name}</td>
                          <td>{subject.midterm}</td>
                          <td>{subject.final}</td>
                          <td>{subject.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Parent Contact */}
            <div className="card">
              <div className="card-header">Liên hệ Phụ huynh</div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Họ tên Mẹ:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.parent.motherName}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Điện thoại:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.parent.phone}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Email:
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)", margin: 0 }}
                    >
                      {student.parent.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="card">
              <div className="card-header">
                Biểu đồ tiến bộ (Điểm trung bình)
              </div>
              <div className="card-body">
                <div
                  style={{
                    height: "200px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    gap: "0.5rem",
                  }}
                >
                  {[8.2, 8.3, 8.4, 8.5, 8.5, 8.5].map((score, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: `${(score / 10) * 150}px`,
                          background:
                            "linear-gradient(135deg, #9333ea, #a855f7)",
                          borderRadius: "0.25rem 0.25rem 0 0",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <small style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        HK{index + 1}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scores" && (
          <div className="card">
            <div className="card-header">Điểm số chi tiết</div>
            <div className="card-body">
              <p>Nội dung điểm số chi tiết sẽ được hiển thị ở đây.</p>
            </div>
          </div>
        )}

        {activeTab === "conduct" && (
          <div className="card">
            <div className="card-header">Hạnh kiểm</div>
            <div className="card-body">
              <p>Nội dung hạnh kiểm sẽ được hiển thị ở đây.</p>
            </div>
          </div>
        )}

        {activeTab === "health" && (
          <div className="card">
            <div className="card-header">Thông tin sức khỏe</div>
            <div className="card-body">
              <p>Nội dung thông tin sức khỏe sẽ được hiển thị ở đây.</p>
            </div>
          </div>
        )}
      </PageFrame>
    </Layout>
  );
};

export default StudentDetail;
