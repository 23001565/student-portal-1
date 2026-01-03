import React, { useEffect, useMemo, useState } from 'react';
import { getOpenCourses } from '../../api/registrationApi';
import { listCurricula } from '../../api/curriculumApi';

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

export default function AdminCourseRegistration() {
  const [filters, setFilters] = useState({ curriculumId: null, q: '' });
  const [courses, setCourses] = useState([]);
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationWindow, setRegistrationWindow] = useState(null);
/*
  const loadCurricula = async () => {
    try {
      const data = await listCurricula();
      setCurricula(data || []);
    } catch (e) {
      console.error('Failed to load curricula', e);
    }
  };
*/
  const loadCurricula = async () => {
  try {
    const data = await listCurricula();
    setCurricula(data?.items || []);
  } catch (e) {
    console.error('Failed to load curricula', e);
    setCurricula([]);
  }
};


  const loadCourses = async () => {
    setLoading(true); setError('');
    try {
      // curriculumId: null for all, or a number for specific curriculum
      let sendCurriculumId = filters.curriculumId;
      const data = await getOpenCourses({ curriculumId: sendCurriculumId, q: filters.q });
      setCourses(data?.items || []);
      setRegistrationWindow(data?.window || null);
    } catch (e) {
      setError(e.message || 'Lỗi tải danh sách');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadCurricula();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [filters.curriculumId, filters.q]);

  const totalCredits = useMemo(() => courses.reduce((sum, c) => sum + (c.credits || 0), 0), [courses]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Xem trước đăng ký học phần</h2>
      <p>Chọn chương trình đào tạo để xem danh sách lớp học phần mà sinh viên sẽ thấy.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <select
           value={filters.curriculumId === null ? '' : filters.curriculumId}
           onChange={(e) => {
             const val = e.target.value;
             setFilters({
               ...filters,
               curriculumId: val === '' ? null : parseInt(val, 10)
             });
           }}
           style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
         >
          <option value="">Tất cả các lớp mở</option>
          {curricula.map((curriculum) => (
            <option key={curriculum.id} value={curriculum.id}>
              {curriculum.code} - {curriculum.majorName} ({curriculum.startYear}-{curriculum.endYear || 'Hiện tại'})
            </option>
          ))}
        </select>
        <input
          placeholder="Từ khóa tìm kiếm"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
      </div>

      {registrationWindow && (
        <div style={{ marginTop: 8, color: '#16a34a' }}>
          Đợt đăng ký: {registrationWindow.semester}/{registrationWindow.year} (từ {new Date(registrationWindow.startTime).toLocaleString('en-US', { timeZone: 'UTC' })} đến {new Date(registrationWindow.endTime).toLocaleString('en-US', { timeZone: 'UTC' })})
        </div>
      )}

      {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Học phần mở đăng ký ({courses.length} lớp)
        </div>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                    Đang tải...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                    Không có lớp học phần nào.
                  </td>
                </tr>
              ) : (
                courses.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.courseCode}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.courseName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.sectionId}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.schedule}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.location}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.credits}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.registered}/{c.capacity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && courses.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600 }}>Tổng số tín chỉ: <strong>{totalCredits}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}