import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../components/PageFrame";
import Button from "../components/Button";
import { getMyProfile } from '../api/studentApi';
import { useAuth } from '../context/authContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        setProfile(profile);
        setFormData(profile);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  }, [navigate]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (window.confirm("Bạn có chắc chắn muốn lưu thông tin?")) {
      // Here you would make an API call to update the profile
      setProfile(formData);
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <PageFrame
      title="Hồ sơ cá nhân"
      subtitle="Xem và chỉnh sửa thông tin cá nhân"
      headerActions={
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Về Dashboard
        </Button>
      }
    >
      <div className="card">
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Thông tin cá nhân</span>
          {!isEditing && user?.role !== 'student' && (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </Button>
          )}
        </div>

        <div className="card-body">
          <div className="grid grid-2 gap-6">
            {/* MSSV */}
            <div className="form-group">
              <label className="form-label">Mã số sinh viên</label>
              <input
                type="text"
                value={formData.code || ""}
                disabled
                className="form-control"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              />
            </div>

            {/* Tên */}
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
                style={
                  !isEditing
                    ? {
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-tertiary)",
                      }
                    : {}
                }
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
                style={
                  !isEditing
                    ? {
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-tertiary)",
                      }
                    : {}
                }
              />
            </div>

            {/* Năm học */}
            <div className="form-group">
              <label className="form-label">Năm học</label>
              <input
                type="text"
                value={formData.year ? `Năm ${formData.year}` : ""}
                disabled
                className="form-control"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              />
            </div>

            {/* Ngành */}
            <div className="form-group">
              <label className="form-label">Ngành học</label>
              <input
                type="text"
                value={formData.majorName || ""}
                disabled
                className="form-control"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              />
            </div>

            {/* Chương trình đào tạo */}
            <div className="form-group">
              <label className="form-label">Chương trình đào tạo</label>
              <input
                type="text"
                value={
                  formData.curriculumCode || ""
                }
                disabled
                className="form-control"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              />
            </div>

  

            {/* Trạng thái */}
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <div className="flex items-center">
                <span
                  className={`badge ${
                    formData.isActive ? "badge-success" : "badge-danger"
                  }`}
                >
                  {formData.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="card-footer">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <Button variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>Lưu thay đổi</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="card mt-6">
        <div className="card-header">Bảo mật</div>
        <div className="card-body">
          <Button variant="outline" size="sm">
            Đổi mật khẩu
          </Button>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Bạn có thể thay đổi mật khẩu của mình bất cứ lúc nào để bảo mật tài
            khoản.
          </p>
        </div>
      </div>
    </PageFrame>
  );
};

export default ProfilePage;
