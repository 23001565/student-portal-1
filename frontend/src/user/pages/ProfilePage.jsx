import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Layout from "../../components/Layout";
import studentApi from "../../api/studentApi";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    dob: "",
    gender: "",
    password: "" // [MỚI] Thêm trường password
  });

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const data = await studentApi.getProfile();
      setProfile(data);
      setFormData({
        phone: data.phone || "",
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
        gender: data.gender || "Nam",
        password: "" // [MỚI] Luôn để rỗng khi mới load
      });
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await studentApi.updateProfile(formData);
      
      // Update UI (Lưu ý: Không cần update password vào state profile để hiển thị)
      setProfile({ ...profile, ...formData }); 
      
      // Reset lại password trong form về rỗng để tránh lộ hoặc gửi lại lần sau
      setFormData(prev => ({ ...prev, password: "" }));
      
      setIsEditing(false);
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      phone: profile.phone || "",
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
      gender: profile.gender || "Nam",
      password: "" // [MỚI] Reset pass về rỗng
    });
    setIsEditing(false);
  };

  if (loading) return <Layout><div>Đang tải dữ liệu...</div></Layout>;
  if (!profile) return <Layout><div>Không tìm thấy hồ sơ</div></Layout>;

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
                
                <div className="mb-3">
                  <strong>Số điện thoại: </strong>
                  {isEditing ? (
                    <input type="text" className="form-control form-control-sm mt-1" name="phone" value={formData.phone} onChange={handleInputChange}/>
                  ) : (
                    <span>{profile.phone || "Chưa cập nhật"}</span>
                  )}
                </div>

                <div className="mb-3">
                  <strong>Ngày sinh: </strong>
                  {isEditing ? (
                    <input type="date" className="form-control form-control-sm mt-1" name="dob" value={formData.dob} onChange={handleInputChange}/>
                  ) : (
                    <span>{profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
                  )}
                </div>

                <div className="mb-3">
                  <strong>Giới tính: </strong>
                  {isEditing ? (
                    <select className="form-select form-select-sm mt-1" name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <span>{profile.gender || "Chưa cập nhật"}</span>
                  )}
                </div>

                {/* [MỚI] KHU VỰC ĐỔI MẬT KHẨU - CHỈ HIỆN KHI EDIT */}
                {isEditing && (
                    <div className="mb-3 pt-3 mt-3 border-top">
                        <strong className="text-danger"><i className="bi bi-shield-lock me-1"></i>Đổi mật khẩu:</strong>
                        <input 
                            type="password" 
                            className="form-control form-control-sm mt-1 border-danger" 
                            name="password"
                            placeholder="Nhập mật khẩu mới..." 
                            value={formData.password} 
                            onChange={handleInputChange}
                        />
                        <div className="form-text text-muted small fst-italic">
                            Để trống nếu không muốn thay đổi.
                        </div>
                    </div>
                )}
                {/* ----------------------------------------------- */}

              </div>

              <div className="mt-auto pt-3 border-top">
                {!isEditing ? (
                  <button className="btn btn-outline-primary w-100" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa thông tin
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-success flex-grow-1" onClick={handleSubmit}>Lưu</button>
                    <button className="btn btn-secondary flex-grow-1" onClick={handleCancel}>Hủy</button>
                  </div>
                )}
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
                             value={profile.curriculum ? `${profile.curriculum.startYear} - ${profile.curriculum.endYear}` : ""} 
disabled 
/>
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