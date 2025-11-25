import React, { useEffect, useMemo, useState } from 'react';
import { getOpenCourses, submitRegistration } from '../api/registrationApi';

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
  const [filters, setFilters] = useState({ term: '', programId: '', q: '' });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');

  const loadCourses = async () => {
    setLoading(true); setError('');
    try {
      const data = await getOpenCourses(filters);
      setCourses(data?.items || []);
    } catch (e) {
      setError(e.message || 'Lỗi tải danh sách');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // optionally auto-load on mount
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCredits = useMemo(() => cart.reduce((sum, c) => sum + (c.credits || 0), 0), [cart]);
  const conflicts = useMemo(() => checkConflicts(cart), [cart]);

  const addToCart = (c) => {
    if (cart.find(x => x.courseCode === c.courseCode && x.sectionId === c.sectionId)) return;
    setCart([...cart, c]);
  };

  const removeFromCart = (c) => {
    setCart(cart.filter(x => !(x.courseCode === c.courseCode && x.sectionId === c.sectionId)));
  };

  const onSubmit = async () => {
    setMessage('');
    if (conflicts.length) {
      setMessage('Có xung đột lịch. Vui lòng điều chỉnh giỏ đăng ký.');
      return;
    }
    try {
      const payload = { term: filters.term, items: cart.map(({ courseCode, sectionId }) => ({ courseCode, sectionId })) };
      const res = await submitRegistration(payload);
      setMessage(`Đăng ký thành công ${res?.registered || cart.length} học phần.`);
      setCart([]);
    } catch (e) {
      setMessage(e.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Đăng ký học phần</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <input placeholder="Học kỳ (vd: 2024-2025 HK1)" value={filters.term} onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <input placeholder="Program ID" value={filters.programId} onChange={(e) => setFilters({ ...filters, programId: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <input placeholder="Từ khóa" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <button onClick={loadCourses} disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6 }}>
          {loading ? 'Đang tải...' : 'Tải danh sách'}
        </button>
      </div>

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
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{Array.isArray(c.schedule) ? c.schedule.map(x => typeof x === 'string' ? x : `${x.day} ${Array.isArray(x.slots) ? `${Math.min(...x.slots)}-${Math.max(...x.slots)}` : ''}`).join('; ') : (c.schedule || '')}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.credits}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.registered}/{c.capacity}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>
                      <button onClick={() => addToCart(c)} style={{ background: '#10b981', color: 'white', padding: '6px 10px', border: 'none', borderRadius: 6 }}>Thêm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Giỏ đăng ký</div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
            {(cart || []).length === 0 && <div style={{ color: '#64748b' }}>Chưa có học phần.</div>}
            {(cart || []).map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.courseCode} - {c.courseName}</div>
                  <div className="small" style={{ color: '#64748b' }}>Nhóm {c.sectionId} | {Array.isArray(c.schedule) ? c.schedule.map(x => typeof x === 'string' ? x : `${x.day} ${Array.isArray(x.slots) ? `${Math.min(...x.slots)}-${Math.max(...x.slots)}` : ''}`).join('; ') : (c.schedule || '')}</div>
                </div>
                <button onClick={() => removeFromCart(c)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px' }}>Xóa</button>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>Tổng số tín chỉ: <strong>{totalCredits}</strong></div>
            {conflicts.length > 0 && (
              <div style={{ color: '#dc2626', marginTop: 6 }}>
                Phát hiện xung đột lịch: {conflicts.map(cf => `${cf.slot} (${cf.list.join(', ')})`).join(' | ')}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={onSubmit} disabled={cart.length === 0} style={{ background: '#2563eb', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6 }}>Đăng ký</button>
            </div>
            {message && <div style={{ marginTop: 8, color: message.includes('thất bại') || message.includes('xung đột') ? '#dc2626' : '#16a34a' }}>{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
