import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Form, Alert, ProgressBar } from "react-bootstrap";
import { getOpenCourses, submitRegistration } from "../../api/registrationApi";
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";

// --- Logic xử lý lịch học (Giữ nguyên logic cũ) ---
function parseScheduleToSlots(schedule) {
  const items = Array.isArray(schedule) ? schedule : [schedule];
  const normalize = [];
  for (const it of items) {
    if (!it) continue;
    if (typeof it === "string") {
      const parts = it.split(";").map((s) => s.trim()).filter(Boolean);
      for (const p of parts) {
        const m = p.match(/T(\d)\s+(\d+)(?:-(\d+))?/i);
        if (m) {
          const day = `T${m[1]}`;
          const start = parseInt(m[2], 10);
          const end = m[3] ? parseInt(m[3], 10) : start;
          for (let s = start; s <= end; s++) normalize.push(`${day}-${s}`);
        }
      }
    } else if (typeof it === "object" && it.day && it.slots) {
      for (const s of it.slots) normalize.push(`${it.day}-${s}`);
    }
  }
  return normalize;
}

// Helper để hiển thị lịch học đẹp hơn
const formatScheduleDisplay = (schedule) => {
  if (Array.isArray(schedule)) {
    return schedule.map(s => `${s.day} (Tiết ${s.slots.join('-')})`).join(", ");
  }
  return schedule || "Chưa có lịch";
};

export default function CourseRegistration() {
  const [termId, setTermId] = useState("20241"); // Ví dụ HK1 2024
  const [courses, setCourses] = useState([]);
  const [cart, setCart] = useState([]); // List of selected class IDs
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Load dữ liệu khi vào trang
  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId]);

  const loadCourses = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await getOpenCourses({ termId });
      // Giả lập dữ liệu nếu API trả về rỗng để bạn thấy giao diện
      if (!data || data.length === 0) {
         // Mock data để test giao diện
         setCourses([
            { id: 101, code: "INT3306", name: "Cấu trúc dữ liệu và giải thuật", classCode: "INT3306 1", credits: 3, schedule: "T2 7-9", enrolled: 45, capacity: 50 },
            { id: 102, code: "INT3306", name: "Cấu trúc dữ liệu và giải thuật", classCode: "INT3306 2", credits: 3, schedule: "T3 1-3", enrolled: 10, capacity: 50 },
            { id: 103, code: "INT3123", name: "Lập trình hướng đối tượng", classCode: "INT3123 1", credits: 3, schedule: "T4 7-9", enrolled: 60, capacity: 60 },
            { id: 104, code: "MAT1093", name: "Đại số", classCode: "MAT1093 5", credits: 4, schedule: "T2 7-9", enrolled: 20, capacity: 70 }, // Trùng lịch với 101
            { id: 105, code: "PES101", name: "Giáo dục thể chất", classCode: "PES101 10", credits: 1, schedule: "T5 1-2", enrolled: 0, capacity: 30 },
         ]);
      } else {
         setCourses(data);
      }
    } catch (e) {
      console.error(e);
      setMessage("Không tải được danh sách môn học.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic chọn môn
  const handleCheck = (classItem) => {
    const exists = cart.find((c) => c.id === classItem.id);
    if (exists) {
      setCart(cart.filter((c) => c.id !== classItem.id));
    } else {
      setCart([...cart, classItem]);
    }
  };

  // 3. Tính toán xung đột và tổng tín chỉ
  const { totalCredits, conflicts } = useMemo(() => {
    let total = 0;
    const slotsMap = {};
    const conflictList = [];

    cart.forEach((c) => {
      total += parseInt(c.credits || 0);
      const slots = parseScheduleToSlots(c.schedule);
      slots.forEach((s) => {
        if (!slotsMap[s]) slotsMap[s] = [];
        slotsMap[s].push(c.classCode);
      });
    });

    for (const [slot, classes] of Object.entries(slotsMap)) {
      if (classes.length > 1) {
        conflictList.push({ slot, list: classes });
      }
    }
    return { totalCredits: total, conflicts: conflictList };
  }, [cart]);

  // 4. Submit
  const onSubmit = async () => {
    if (conflicts.length > 0) {
      alert("Bạn đang bị trùng lịch học, vui lòng kiểm tra lại!");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const classIds = cart.map((c) => c.id);
      await submitRegistration({ termId, classIds });
      setMessage("Đăng ký thành công! Vui lòng kiểm tra email xác nhận.");
      setCart([]);
    } catch (e) {
      setMessage(e.message || "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <PageFrame 
        title="Đăng ký học phần" 
        subtitle="Học kỳ 1 - Năm học 2024-2025"
        headerActions={
            <Button variant="outline" onClick={loadCourses} disabled={loading}>
                🔄 Làm mới
            </Button>
        }
      >
        <Container fluid className="p-0">
          {message && (
            <Alert variant={message.includes("thành công") ? "success" : "danger"} dismissible onClose={() => setMessage("")}>
              {message}
            </Alert>
          )}

          <Row className="g-4">
            {/* CỘT TRÁI: DANH SÁCH LỚP */}
            <Col lg={8}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3">
                  <Row className="align-items-center">
                    <Col>
                        <h5 className="mb-0 text-primary">Danh sách lớp mở</h5>
                    </Col>
                    <Col md={5}>
                        <Form.Control 
                            type="text" 
                            placeholder="🔍 Tìm môn học, mã lớp..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Chọn</th>
                                    <th>Mã lớp</th>
                                    <th>Tên học phần</th>
                                    <th>TC</th>
                                    <th>Lịch học</th>
                                    <th>Sĩ số</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.length > 0 ? filteredCourses.map((c) => {
                                    const isSelected = cart.find(item => item.id === c.id);
                                    const isFull = c.enrolled >= c.capacity;
                                    const percent = Math.round((c.enrolled / c.capacity) * 100);

                                    return (
                                        <tr key={c.id} className={isSelected ? "table-active" : ""}>
                                            <td className="ps-4">
                                                <Form.Check 
                                                    type="checkbox"
                                                    disabled={isFull && !isSelected}
                                                    checked={!!isSelected}
                                                    onChange={() => handleCheck(c)}
                                                    style={{ transform: "scale(1.2)" }}
                                                />
                                            </td>
                                            <td className="fw-bold text-primary">{c.classCode}</td>
                                            <td>
                                                <div>{c.name}</div>
                                                <small className="text-muted">{c.code}</small>
                                            </td>
                                            <td><Badge bg="secondary">{c.credits}</Badge></td>
                                            <td style={{ fontSize: "0.9rem" }}>{formatScheduleDisplay(c.schedule)}</td>
                                            <td style={{ minWidth: "100px" }}>
                                                <div className="d-flex justify-content-between text-xs mb-1">
                                                    <span>{c.enrolled}/{c.capacity}</span>
                                                    <span className={isFull ? "text-danger fw-bold" : "text-success"}>
                                                        {isFull ? "Full" : `${percent}%`}
                                                    </span>
                                                </div>
                                                <ProgressBar 
                                                    now={percent} 
                                                    variant={isFull ? "danger" : percent > 80 ? "warning" : "success"} 
                                                    style={{ height: "6px" }} 
                                                />
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-4 text-muted">
                                            Không tìm thấy lớp học phần nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
              </Card>
            </Col>

            {/* CỘT PHẢI: GIỎ HÀNG (STICKY) */}
            <Col lg={4}>
              <div style={{ position: "sticky", top: "100px" }}>
                <Card className="shadow border-0">
                    <Card.Header className="bg-primary text-white py-3">
                        <h5 className="mb-0">📦 Lớp đã chọn ({cart.length})</h5>
                    </Card.Header>
                    <Card.Body>
                        {cart.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <p>Chưa chọn lớp nào</p>
                                <small>Vui lòng tích chọn lớp từ danh sách bên trái.</small>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="d-flex justify-content-between align-items-center p-2 border rounded bg-light">
                                        <div style={{ overflow: "hidden" }}>
                                            <div className="fw-bold text-truncate">{item.name}</div>
                                            <div className="small text-muted d-flex gap-2">
                                                <span>{item.classCode}</span>
                                                <Badge bg="info" text="dark">{item.credits} TC</Badge>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleCheck(item)}
                                            style={{ minWidth: "32px", padding: "2px 8px" }}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <hr />
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted">Tổng tín chỉ:</span>
                            <span className="h4 mb-0 text-primary fw-bold">{totalCredits}</span>
                        </div>

                        {/* Cảnh báo xung đột */}
                        {conflicts.length > 0 && (
                            <Alert variant="danger" className="mb-3">
                                <div className="fw-bold mb-1">⚠️ Phát hiện trùng lịch:</div>
                                <ul className="mb-0 ps-3 small">
                                    {conflicts.map((cf, idx) => (
                                        <li key={idx}>
                                            {cf.slot}: {cf.list.join(", ")}
                                        </li>
                                    ))}
                                </ul>
                            </Alert>
                        )}

                        <Button 
                            variant="primary" 
                            className="w-100 py-2 fs-6 fw-bold"
                            disabled={cart.length === 0 || conflicts.length > 0 || submitting}
                            loading={submitting}
                            onClick={onSubmit}
                        >
                            {submitting ? "Đang xử lý..." : "Gửi đăng ký"}
                        </Button>
                    </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </PageFrame>
    </Layout>
  );
}