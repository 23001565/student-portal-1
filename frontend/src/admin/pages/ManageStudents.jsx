import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import điều hướng
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook điều hướng

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cảnh báo: Xóa sinh viên sẽ xóa toàn bộ điểm số và lịch sử học tập. Bạn có chắc không?")) {
      try {
        await adminApi.deleteStudent(id);
        alert("Đã xóa thành công!");
        loadData(); // Tải lại danh sách
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    }
  };

  return (
    <Layout>
      <PageFrame title="Quản lý Sinh viên" subtitle="Danh sách sinh viên toàn trường">
        <Container fluid className="p-0">
          <div className="d-flex justify-content-end mb-3">
             <Button variant="success" onClick={() => navigate('/admin/students/new')}>
                + Thêm Sinh viên
             </Button>
          </div>

          <Card className="shadow-sm border-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Lớp/Ngành</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td className="fw-bold">{st.code}</td>
                    <td>{st.name}</td>
                    <td>{st.email}</td>
                    <td>
                        <div className="small fw-bold">{st.className}</div>
                        <div className="small text-muted">{st.major?.name}</div>
                    </td>
                    <td className="text-center">
                        <Badge bg="success">Đang học</Badge>
                    </td>
                    <td className="text-end">
                      {/* Nút Xem Chi Tiết */}
                      <Button 
                        variant="outline-primary" size="sm" className="me-2"
                        onClick={() => navigate(`/admin/students/${st.id}`)}
                        title="Xem chi tiết & Sửa"
                      >
                        <i className="bi bi-eye"></i> Chi tiết
                      </Button>
                      
                      {/* Nút Xóa */}
                      <Button 
                        variant="outline-danger" size="sm"
                        onClick={() => handleDelete(st.id)}
                        title="Xóa sinh viên"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {loading && <div className="text-center p-4">Đang tải dữ liệu...</div>}
          </Card>
        </Container>
      </PageFrame>
    </Layout>
  );
};

export default ManageStudents;