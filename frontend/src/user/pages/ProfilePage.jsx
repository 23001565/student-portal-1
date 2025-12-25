import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout"; // <-- Thêm dòng này

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    loadProfile(parsedUser.id);
  }, [navigate]);

  const loadProfile = async (userId) => {
    try {
      // Mock data
      const mockProfile = {
        id: userId,
        code: 1001,
        name: "Nguyễn Văn An",
        email: "student@hus.edu.vn",
        year: 1,
        major: {
          id: 1,
          name: "Công nghệ thông tin",
        },
        curriculum: {
          id: 1,
          startYear: 2024,
          endYear: 2028,
        },
        createdAt: "2024-09-05",
        status: "Đang học",
        address: "Hà Nội, Việt Nam",
        phone: "0987654321",
        dob: "2006-01-01",
      };
      setProfile(mockProfile);
      setFormData(mockProfile);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setProfile(formData);
    setIsEditing(false);
    alert("Cập nhật hồ sơ thành công!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <Layout> {/* <-- Bọc Layout ở đây */}
      <PageFrame
        title="Hồ sơ sinh viên"
        subtitle="Thông tin cá nhân và tài khoản"
        headerActions={
          !isEditing && (
            <Button onClick={handleEdit} variant="primary">
              ✏️ Chỉnh sửa
            </Button>
          )
        }
      >
        <div className="row g-4">
          {/* Cột trái: Avatar & Info cơ bản */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 text-center p-4 h-100">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-light text-primary fw-bold"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  fontSize: "3rem",
                  border: "4px solid white",
                  boxShadow: "0 0 0 2px #e2e8f0",
                }}
              >
                {profile.name.charAt(0)}
              </div>
              <h4 className="mb-1">{profile.name}</h4>
              <p className="text-muted mb-3">{profile.code}</p>
              <div className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                {profile.status}
              </div>
            </div>
          </div>

          {/* Cột phải: Form chi tiết */}
          <div className="col-md-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Thông tin chi tiết</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Họ và tên</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Mã sinh viên</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={formData.code || ""}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Email</label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={formData.email || ""}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Số điện thoại</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small">Địa chỉ</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Ngành học</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={formData.major?.name || ""}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Niên khóa</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={`${formData.curriculum?.startYear} - ${formData.curriculum?.endYear}`}
                        disabled
                      />
                    </div>
                  </div>
                </form>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button variant="outline-secondary" onClick={handleCancel}>
                      Hủy bỏ
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageFrame>
    </Layout>
  );
};

export default ProfilePage;