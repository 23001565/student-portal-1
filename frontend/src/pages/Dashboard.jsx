import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../components/PageFrame";
import { useAuth } from "../context/authContext.jsx";
import { listAnnouncements } from "../api/announcementApi.js";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    loadAnnouncements();
  }, [authLoading, user, navigate]);

  const loadAnnouncements = async () => {
    try {
      const data = await listAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <PageFrame
      title="Bảng tin"
      subtitle={`Chào mừng, ${user.email}`}
    >
      <div className="card">
        <div className="card-header">Thông báo mới nhất</div>
        <div className="card-body">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {announcements.map((a) => (
              <div
                key={a.id}
                className="fade-in"
                style={{
                  borderLeft: "4px solid var(--primary-color)",
                  paddingLeft: "1rem",
                }}
              >
                <h3
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {a.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {a.content}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {new Date(a.postedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}

            {announcements.length === 0 && (
              <p
                className="text-center"
                style={{
                  color: "var(--text-tertiary)",
                  padding: "2rem",
                }}
              >
                Không có thông báo nào
              </p>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  );
};

export default Dashboard;
