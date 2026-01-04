import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Alert, Form, ProgressBar } from "react-bootstrap";
import studentApi from "../../api/studentApi"; 
import Layout from "../../components/Layout";
import PageFrame from "../../components/PageFrame";
import Button from "../../components/Button";

// Hàm parse lịch học
function parseScheduleToSlots(schedule) {
  if (!schedule) return [];
  if (Array.isArray(schedule)) {
    const slots = [];
    schedule.forEach(s => {
      if (s.day && s.slots) {
        s.slots.forEach(slot => slots.push(`${s.day}-${slot}`));
      }
    });
    return slots;
  }
  return [];
}

export default function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [cart, setCart] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); 

  // 1. Tải dữ liệu
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await studentApi.getOpenCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'danger', text: 'Lỗi tải danh sách môn học' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic thêm/bớt môn vào giỏ
  const toggleCourse = (course) => {
    const exists = cart.find((c) => c.id === course.id);
    if (exists) {
      setCart(cart.filter((c) => c.id !== course.id));
    } else {
      setCart([...cart, course]);
    }
    setMessage(null); // Xóa thông báo cũ khi thao tác
  };

  // 3. Logic kiểm tra trùng lịch (TRONG GIỎ HÀNG - Client Side)
  // Cái này giúp chặn user chọn 2 môn trùng nhau ngay từ đầu
  const conflicts = useMemo(() => {
    const slotMap = {};
    const conflictList = [];

    cart.forEach((c) => {
      const slots = parseScheduleToSlots(c.schedule);
      slots.forEach((s) => {
        if (!slotMap[s]) slotMap[s] = [];
        slotMap[s].push(c.classCode); // Dùng classCode để hiển thị dễ nhìn hơn
      });
    });

    for (const [slot, codes] of Object.entries(slotMap)) {
      if (codes.length > 1) {
        conflictList.push({ slot, list: codes });
      }
    }
    return conflictList;
  }, [cart]);

  const totalCredits = cart.reduce((sum, c) => sum + c.credits, 0);

  // 4. Gửi đăng ký (ĐÃ SỬA LOGIC)
  const onSubmit = async () => {
    // Chặn nếu nội bộ giỏ hàng đã bị trùng
    if (conflicts.length > 0) return;

    setSubmitting(true);
    setMessage(null);

    let successCount = 0;
    let errorList = [];
    
    // Danh sách môn đăng ký thành công để loại khỏi giỏ
    let registeredIds = [];

    // Duyệt qua từng môn trong giỏ để đăng ký (Gọi API check trùng lịch phía Server)
    for (const course of cart) {
        try {
            // Gọi API đăng ký từng lớp (Hàm này đã thêm ở bước trước)
            await studentApi.registerClass(course.id);
            successCount++;
            registeredIds.push(course.id);
        } catch (error) {
            // Lấy thông báo lỗi cụ thể từ Backend (VD: "Trùng lịch học với lớp INT3306...")
            const msg = error.response?.data?.message || "Lỗi không xác định";
            errorList.push(`- Lớp ${course.classCode}: ${msg}`);
        }
    }

    // Xử lý kết quả sau khi chạy hết vòng lặp
    if (errorList.length > 0) {
        // Có lỗi xảy ra (dù có thể có môn thành công)
        setMessage({ 
            type: 'danger', 
            // Hiển thị danh sách lỗi dòng xuống dòng
            text: (
                <div>
                    <strong>Có {errorList.length} môn đăng ký thất bại:</strong>
                    <br/>
                    {errorList.map((e, i) => <div key={i}>{e}</div>)}
                    {successCount > 0 && <div className="mt-2 text-success">Đã đăng ký thành công {successCount} môn khác.</div>}
                </div>
            )
        });
    } else {
        // Thành công 100%
        setMessage({ type: 'success', text: `Đăng ký thành công tất cả ${successCount} môn!` });
    }

    // Cập nhật lại giỏ hàng (chỉ giữ lại những môn bị lỗi)
    const remainingCart = cart.filter(c => !registeredIds.includes(c.id));
    setCart(remainingCart);

    // Tải lại danh sách để cập nhật sĩ số mới nhất
    loadCourses();
    setSubmitting(false);
  };

  // --- GIAO DIỆN KHÔNG THAY ĐỔI ---
  return (
    <Layout>
      <PageFrame title="Đăng ký tín chỉ">
        <Container fluid className="p-0">
            {message && <Alert variant={message.type}>{message.text}</Alert>}
            
            <Row>
            {/* DANH SÁCH MÔN HỌC (BÊN TRÁI) */}
            <Col md={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0 text-primary">Danh sách lớp học phần đang mở</h5>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Mã lớp</th>
                                <th>Tên môn học</th>
                                <th>TC</th>
                                <th>Lịch học</th>
                                <th>Sĩ số</th>
                                <th>Chọn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => {
                                const isSelected = cart.some(c => c.id === course.id);
                                const isFull = course.enrolled >= course.capacity;
                                
                                const renderSchedule = (sch) => {
                                    if(Array.isArray(sch)) {
                                        return sch.map((s, idx) => (
                                            <div key={idx} className="small">
                                                Thứ {s.day.replace('T', '')}, Tiết {s.slots.join(',')} ({s.room})
                                            </div>
                                        ));
                                    }
                                    return sch; 
                                };

                                return (
                                    <tr key={course.id} className={isSelected ? "table-primary" : ""}>
                                            <td className="fw-bold">{course.classCode}</td>
                                            <td>
                                                <div className="fw-semibold">{course.name}</div>
                                                <small className="text-muted">{course.code}</small>
                                            </td>
                                            <td>{course.credits}</td>
                                            <td>{renderSchedule(course.schedule)}</td>
                                            <td>
                                                <Badge bg={isFull ? 'danger' : 'success'}>
                                                    {course.enrolled}/{course.capacity}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Form.Check 
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isFull && !isSelected}
                                                    onChange={() => toggleCourse(course)}
                                                />
                                            </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
              </Card>
            </Col>

            {/* GIỎ ĐĂNG KÝ (BÊN PHẢI) */}
            <Col md={4}>
              <div className="sticky-top" style={{ top: "100px", zIndex: 1 }}>
                <Card className="shadow-sm border-primary">
                    <Card.Header className="bg-primary text-white py-3">
                        <h5 className="mb-0">Phiếu đăng ký</h5>
                    </Card.Header>
                    <Card.Body>
                        {/* List môn đã chọn */}
                        {cart.length === 0 ? (
                            <p className="text-muted text-center py-3">Chưa chọn môn học nào</p>
                        ) : (
                            <ul className="list-group list-group-flush mb-3">
                                {cart.map((c, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <div>
                                            <div className="fw-bold">{c.name}</div>
                                            <small className="text-muted">{c.classCode}</small>
                                        </div>
                                        <Badge bg="info" className="rounded-pill">{c.credits} TC</Badge>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <hr />
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="h6 mb-0 text-muted">Tổng tín chỉ:</span>
                            <span className="h4 mb-0 text-primary fw-bold">{totalCredits}</span>
                        </div>

                        {/* Cảnh báo trùng lịch nội bộ */}
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