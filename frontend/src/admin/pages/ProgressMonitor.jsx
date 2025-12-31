import React, { useState, useEffect } from "react";
// Import đầy đủ để tránh lỗi màn hình trắng
import { Container, Row, Col, Card, Table, Badge, ProgressBar, Form, Button } from "react-bootstrap";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import adminApi from "../../api/adminApi";

const ProgressMonitor = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, warning, danger, normal

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
    setLoading(true);
    try {
      // 1. Gọi API
      const response = await adminApi.getAcademicProgress();
      console.log("🔍 Dữ liệu gốc từ API:", response); // Bật F12 xem dòng này

      let finalData = [];

      // 2. Kiểm tra và trích xuất mảng dữ liệu an toàn
      if (Array.isArray(response)) {
        // Trường hợp A: API trả về mảng luôn -> Quá tốt
        finalData = response;
      } 
      else if (response && Array.isArray(response.data)) {
        // Trường hợp B: API trả về { data: [...] } -> Lấy phần .data
        finalData = response.data;
      } 
      else if (response && Array.isArray(response.students)) {
         // Trường hợp C: API trả về { students: [...] } (ví dụ)
         finalData = response.students;
      }
      else if (response && response.result && Array.isArray(response.result)) {
        // Trường hợp D: API trả về { result: [...] }
        finalData = response.result;
      }
      else {
        console.warn("⚠️ Cảnh báo: Dữ liệu nhận được không phải là mảng!", response);
        // Không set dữ liệu bậy để tránh crash
        finalData = [];
      }

      // 3. Cập nhật State
      setStudents(finalData);

    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu:", error);
      // Có thể thêm thông báo lỗi UI ở đây nếu muốn
      setStudents([]); 
    } finally {
      setLoading(false);
    }
};

  const getStatusBadge = (status) => {
    switch (status) {
      case "danger": return <Badge bg="danger">Nguy cơ thôi học</Badge>;
      case "warning": return <Badge bg="warning" text="dark">Cảnh báo học vụ</Badge>;
      default: return <Badge bg="success">Bình thường</Badge>;
    }
  };

  const getGpaColor = (gpa) => {
    if (gpa >= 3.6) return "success";
    if (gpa >= 3.2) return "primary";
    if (gpa >= 2.5) return "info";
    if (gpa >= 2.0) return "warning";
    return "danger";
  };

  // Lọc dữ liệu hiển thị
  const filteredStudents = students.filter(s => 
    filterStatus === "all" ? true : s.status === filterStatus
  );

  return (
    <Layout>
      <PageFrame title="Theo dõi Tiến độ học tập" subtitle="Giám sát GPA và Cảnh báo học vụ">
        <Container fluid className="p-0">
          
          {/* Bộ lọc trạng thái */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-muted"><i className="bi bi-funnel"></i> Lọc trạng thái:</span>
                    <Button 
                        variant={filterStatus === 'all' ? 'primary' : 'outline-secondary'} 
                        size="sm" onClick={() => setFilterStatus('all')}
                    >
                        Tất cả
                    </Button>
                    <Button 
                        variant={filterStatus === 'warning' ? 'warning' : 'outline-warning'} 
                        size="sm" onClick={() => setFilterStatus('warning')}
                    >
                        Cảnh báo
                    </Button>
                    <Button 
                        variant={filterStatus === 'danger' ? 'danger' : 'outline-danger'} 
                        size="sm" onClick={() => setFilterStatus('danger')}
                    >
                        Nguy cơ
                    </Button>
                </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Đang phân tích dữ liệu điểm...</p>
                </div>
            ) : (
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>MSSV</th>
                            <th>Sinh viên</th>
                            <th>Lớp / Ngành</th>
                            <th>GPA Tích lũy</th>
                            <th>Tín chỉ tích lũy</th>
                            <th>TC Nợ</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? filteredStudents.map((sv) => (
                            <tr key={sv.id}>
                                <td className="fw-bold">{sv.code}</td>
                                <td>
                                    <div className="fw-medium">{sv.name}</div>
                                </td>
                                <td className="small text-muted">
                                    <div>{sv.class}</div>
                                    <div>{sv.major}</div>
                                </td>
                                <td style={{width: '150px'}}>
                                    <div className="d-flex align-items-center">
                                        <span className={`fw-bold me-2 text-${getGpaColor(sv.gpa)}`}>{sv.gpa}</span>
                                        <ProgressBar 
                                            now={(sv.gpa / 4) * 100} 
                                            variant={getGpaColor(sv.gpa)} 
                                            style={{height: '6px', flexGrow: 1}} 
                                        />
                                    </div>
                                </td>
                                <td className="text-center">{sv.totalCredits}</td>
                                <td className={`text-center fw-bold ${sv.failedCredits > 0 ? 'text-danger' : 'text-muted'}`}>
                                    {sv.failedCredits}
                                </td>
                                <td>{getStatusBadge(sv.status)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                    Không tìm thấy sinh viên nào theo bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
          </Card>
        </Container>
      </PageFrame>
    </Layout>
  );
};

export default ProgressMonitor;