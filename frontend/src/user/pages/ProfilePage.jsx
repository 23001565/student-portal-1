import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi"; // Import API

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      // GỌI API THẬT
      const data = await studentApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Đang tải dữ liệu...</div></Layout>;
  if (!profile) return <Layout><div>Không tìm thấy hồ sơ</div></Layout>;

  // Dùng dữ liệu thật từ API để hiển thị (Giữ nguyên cấu trúc giao diện cũ)
  return (
    <Layout>
      <PageFrame title="Hồ sơ sinh viên" subtitle="Thông tin cá nhân và học vấn">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card text-center h-100 p-4">
              <div className="mb-3 mx-auto" style={{ width: 120, height: 120, background: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#64748b" }}>
                {profile.name?.charAt(0)}
              </div>
              <h4>{profile.name}</h4>
              <p className="text-muted">{profile.code}</p>
              <div className="mt-3 text-start">
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa cập nhật"}</p>
                <p><strong>Ngày sinh:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</p>
                <p><strong>Giới tính:</strong> {profile.gender || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-4">Thông tin học vấn</h5>
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Mã sinh viên</label>
                      <input type="text" className="form-control bg-light" value={profile.code} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Lớp sinh hoạt</label>
                      <input type="text" className="form-control bg-light" value={profile.className || ""} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Ngành học</label>
                      <input type="text" className="form-control bg-light" value={profile.major?.name || ""} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Niên khóa</label>
                      <input type="text" className="form-control bg-light" 
                             value={profile.curriculum ? `${profile.curriculum.startYear} - ${profile.curriculum.endYear}` : ""} disabled />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </PageFrame>
    </Layout>
  );
};

export default ProfilePage;