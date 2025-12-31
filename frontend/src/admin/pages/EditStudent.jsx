import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";
import Layout from "../../components/Layout";
import adminApi from "../../api/adminApi";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await adminApi.getStudentById(id);
      setFormData(res);
    } catch (error) {
      alert("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Loại bỏ các trường object quan hệ để tránh lỗi khi gửi PUT
      const { major, curriculum, enrollments, ...payload } = formData;
      await adminApi.updateStudent(id, payload);
      alert("Cập nhật thành công!");
      navigate(`/admin/students/${id}`);
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <PageFrame title="Chỉnh sửa thông tin sinh viên">
        <form onSubmit={handleSubmit} className="card p-4">
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Họ tên</label>
                    <input className="form-control" value={formData.name || ''} 
                        onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">MSSV</label>
                    <input className="form-control" value={formData.code || ''} 
                        onChange={e => setFormData({...formData, code: e.target.value})} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={formData.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Lớp hành chính</label>
                    <input className="form-control" value={formData.className || ''} 
                        onChange={e => setFormData({...formData, className: e.target.value})} />
                </div>
                <div className="col-12 mt-4">
                    <Button type="submit">Lưu thay đổi</Button>
                    <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>Hủy</Button>
                </div>
            </div>
        </form>
      </PageFrame>
    </Layout>
  );
};
export default EditStudent;