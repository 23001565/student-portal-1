import React, { useEffect, useMemo, useState } from 'react';
import { getOpenCourses, enrollInClass, dropClass, getMyEnrollments } from '../api/registrationApi';

// schedule format example: { day: 'T2', slots: [7,8,9] } or string 'T2 7-9'
function parseScheduleToSlots(schedule) {
  // Accept array of objects or string forms
  const items = Array.isArray(schedule) ? schedule : [schedule];
  const normalize = [];
  for (const it of items) {
    if (!it) continue;
    if (typeof it === 'string') {
      // e.g., 'T2 7-9; T5 1-3'
      const parts = it.split(';').map(s => s.trim()).filter(Boolean);
      for (const p of parts) {
        const m = p.match(/T(\d)\s+(\d+)(?:-(\d+))?/i);
        if (m) {
          const day = `T${m[1]}`;
          const start = parseInt(m[2], 10);
          const end = m[3] ? parseInt(m[3], 10) : start;
          for (let s = start; s <= end; s++) normalize.push(`${day}-${s}`);
        }
      }
    } else if (typeof it === 'object' && it.day && it.slots) {
      for (const s of it.slots) normalize.push(`${it.day}-${s}`);
    }
  }
  return new Set(normalize);
}

function checkConflicts(cart) {
  const map = new Map(); // slot -> courseCodes[]
  for (const item of cart) {
    const slots = parseScheduleToSlots(item.schedule);
    for (const sl of slots) {
      const arr = map.get(sl) || [];
      arr.push(item.courseCode + (item.sectionId ? `-${item.sectionId}` : ''));
      map.set(sl, arr);
    }
  }
  const conflicts = [];
  for (const [slot, list] of map.entries()) {
    if (list.length > 1) conflicts.push({ slot, list });
  }
  return conflicts;
}

export default function CourseRegistration() {
  const [filters, setFilters] = useState({ curriculumId: null, q: '' });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [registrationWindow, setRegistrationWindow] = useState(null);

  const loadCourses = async () => {
    setLoading(true); setError('');
    try {
      // Prepare curriculumId for API: null for all, 'my-curriculum' for personal, or number
      let sendFilters = { ...filters };
      if (filters.curriculumId === null) sendFilters.curriculumId = null;
      else if (filters.curriculumId === 'my-curriculum') sendFilters.curriculumId = 'my-curriculum';
      else sendFilters.curriculumId = filters.curriculumId;
      const data = await getOpenCourses(sendFilters);
      setCourses(data?.items || []);
      setRegistrationWindow(data?.window || null);
    } catch (e) {
      setError(e.message || 'Lỗi tải danh sách');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadCourses();
    loadMyEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyEnrollments = async () => {
    try {
      const data = await getMyEnrollments();
      const enrolledClasses = (data?.enrollments || []).map(e => ({
        id: e.class.id,
        courseCode: e.class.course.code,
        courseName: e.class.course.name,
        credits: e.class.course.credits,
        sectionId: e.class.code,
        schedule: `${e.class.dayOfWeek} ${e.class.startPeriod}-${e.class.endPeriod}`,
        location: e.class.location,
        capacity: e.class.capacity,
        registered: 0, // will be updated
      }));
      setCart(enrolledClasses);
    } catch (e) {
      console.error('Failed to load enrollments', e);
    }
  };

  const totalCredits = useMemo(() => cart.reduce((sum, c) => sum + (c.credits || 0), 0), [cart]);
  const conflicts = useMemo(() => checkConflicts(cart), [cart]);

  // Check if a class would conflict with current cart
  const wouldConflict = (newClass) => {
    const tempCart = [...cart, newClass];
    const tempConflicts = checkConflicts(tempCart);
    return tempConflicts.length > 0;
  };

  // Check if class is for same course as already selected
  const sameCourse = (newClass) => {
    return cart.some(c => c.courseCode === newClass.courseCode);
  };

  const addToCart = async (c) => {
    if (cart.find(x => x.id === c.id)) return;
    try {
      await enrollInClass(c.id);
      setCart([...cart, c]);
      setMessage('Đăng ký thành công');
    } catch (e) {
      setMessage(e.message || 'Đăng ký thất bại');
    }
  };

  const removeFromCart = async (c) => {
    try {
      await dropClass(c.id);
      setCart(cart.filter(x => x.id !== c.id));
      setMessage('Hủy đăng ký thành công');
    } catch (e) {
      setMessage(e.message || 'Hủy đăng ký thất bại');
    }
  };

  // Removed onSubmit since enroll/drop are immediate

  return (
    <div style={{ padding: 20 }}>
      <h2>Đăng ký học phần</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <select
          value={filters.curriculumId === null ? '' : filters.curriculumId}
          onChange={(e) => {
            const val = e.target.value;
            setFilters({
              ...filters,
              curriculumId: val === '' ? null : val === 'my-curriculum' ? 'my-curriculum' : parseInt(val, 10)
            });
          }}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        >
          <option value="">Tất cả CT</option>
          <option value="my-curriculum">CT của tôi</option>
        </select>
        <input placeholder="Từ khóa" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <button onClick={loadCourses} disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6 }}>
          {loading ? 'Đang tải...' : 'Tải danh sách'}
        </button>
      </div>
      {registrationWindow && (
        <div style={{ marginTop: 8, color: '#16a34a' }}>
          Đợt đăng ký: {registrationWindow.semester}/{registrationWindow.year} (từ {new Date(registrationWindow.startTime).toLocaleString()} đến {new Date(registrationWindow.endTime).toLocaleString()})
        </div>
      )}

      {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 20 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Học phần mở đăng ký</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Mã MH</th>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Tên môn</th>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Nhóm</th>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Lịch học</th>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Địa điểm</th>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>TC</th>
                   <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Sĩ số</th>
                   <th></th>
                 </tr>
              </thead>
              <tbody>
                {(courses || []).map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.courseCode}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.courseName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.sectionId}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.schedule}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.location}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.credits}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.registered}/{c.capacity}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>
                      {(() => {
                        const isEnrolled = cart.find(x => x.id === c.id);
                        const hasConflict = wouldConflict(c);
                        const hasSameCourse = sameCourse(c);
                        const disabled = isEnrolled || hasConflict || hasSameCourse;
                        let buttonText = 'Đăng ký';
                        let bgColor = '#10b981';
                        if (isEnrolled) {
                          buttonText = 'Đã đăng ký';
                          bgColor = '#6b7280';
                        } else if (hasSameCourse) {
                          buttonText = 'Cùng môn';
                          bgColor = '#f59e0b';
                        } else if (hasConflict) {
                          buttonText = 'Xung đột';
                          bgColor = '#ef4444';
                        }
                        return (
                          <button
                            onClick={() => addToCart(c)}
                            disabled={disabled}
                            style={{ background: bgColor, color: 'white', padding: '6px 10px', border: 'none', borderRadius: 6 }}
                          >
                            {buttonText}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Lớp đã đăng ký ({cart.length})</div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, maxHeight: '400px', overflowY: 'auto' }}>
            {(cart || []).length === 0 && <div style={{ color: '#64748b' }}>Chưa đăng ký lớp nào.</div>}
            {(cart || []).map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.courseCode} - {c.courseName}</div>
                  <div className="small" style={{ color: '#64748b' }}>Nhóm {c.sectionId} | {c.schedule} | {c.location}</div>
                </div>
                <button onClick={() => removeFromCart(c)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px' }}>Hủy</button>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600 }}>Tổng số tín chỉ: <strong>{totalCredits}</strong></div>
            </div>
            {message && <div style={{ marginTop: 8, color: message.includes('thất bại') || message.includes('xung đột') ? '#dc2626' : '#16a34a' }}>{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
