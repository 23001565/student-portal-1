import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    className: "",
    dateOfBirth: "",
    gender: "Nam",
    status: "Đang học",
    province: "",
    district: "",
    ward: "",
    street: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStudentData = async () => {
    // Mock data
    const mockStudent = {
      id: parseInt(id),
      code: "HS1001",
      name: "Nguyễn Văn An",
      className: "10A1",
      dateOfBirth: "15/05/2008",
      gender: "Nam",
      status: "Đang học",
      province: "",
      district: "",
      ward: "",
      street: "123 Đường ABC, Phường 4, Quận 5, TP. Hồ Chí Minh",
    };
    setFormData(mockStudent);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle save logic here
    alert("Cập nhật thông tin học sinh thành công!");
    navigate(`/admin/students/${id}`);
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

  return (
    <Layout>
      <PageFrame
        title="Chỉnh sửa Học sinh"
        subtitle="Điền thông tin chi tiết để cập nhật hồ sơ học sinh."
        headerActions={
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/students/${id}`)}
          >
            ← Quay lại
          </Button>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header">Thông tin cơ bản</div>
            <div className="card-body">
              <div className="grid grid-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Mã học sinh</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lớp</label>
                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    style={{
                      appearance: "auto",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Chọn lớp</option>
                    <option value="10A1">10A1</option>
                    <option value="10A2">10A2</option>
                    <option value="11B1">11B1</option>
                    <option value="11B2">11B2</option>
                    <option value="12A1">12A1</option>
                    <option value="12A2">12A2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    style={{
                      position: "relative",
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={formData.gender === "Nam"}
                        onChange={handleInputChange}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      <span>Nam</span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={formData.gender === "Nữ"}
                        onChange={handleInputChange}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      <span>Nữ</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    style={{
                      appearance: "auto",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Tạm nghỉ">Tạm nghỉ</option>
                    <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
                    <option value="Chuyển trường">Chuyển trường</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Địa chỉ liên hệ</div>
            <div className="card-body">
              <div className="grid grid-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Tỉnh/Thành phố</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="form-control"
                    style={{
                      appearance: "auto",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      paddingRight: "2.5rem",
                      color: formData.province
                        ? "var(--text-primary)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quận/Huyện</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="form-control"
                    style={{
                      appearance: "auto",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      paddingRight: "2.5rem",
                      color: formData.district
                        ? "var(--text-primary)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    <option value="Quận 1">Quận 1</option>
                    <option value="Quận 2">Quận 2</option>
                    <option value="Quận 3">Quận 3</option>
                    <option value="Quận 4">Quận 4</option>
                    <option value="Quận 5">Quận 5</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phường/Xã</label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="form-control"
                    style={{
                      appearance: "auto",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      paddingRight: "2.5rem",
                      color: formData.ward
                        ? "var(--text-primary)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    <option value="Phường 1">Phường 1</option>
                    <option value="Phường 2">Phường 2</option>
                    <option value="Phường 3">Phường 3</option>
                    <option value="Phường 4">Phường 4</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Số nhà, Tên đường</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập số nhà và tên đường"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
            }}
          >
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/students/${id}`)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      </PageFrame>
    </Layout>
  );
};

export default EditStudent;
