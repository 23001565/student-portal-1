import React, { useEffect, useMemo, useState } from 'react';
import { getStudentProgress } from '../../api/progressApi';

export default function ProgressMonitor() {
  const [filters, setFilters] = useState({ programId: '', className: '', studentId: '' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getStudentProgress(filters);
      setData(res);
    } catch (e) {
      setError(e.message || 'Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // Optionally auto load when any filter changes
  }, []);

  const completion = useMemo(() => {
    if (!data?.summary) return null;
    const { earnedCredits = 0, totalCredits = 0 } = data.summary;
    const pct = totalCredits ? Math.round((earnedCredits / totalCredits) * 100) : 0;
    return { earnedCredits, totalCredits, pct };
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Giám sát tiến trình học</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <input placeholder="Program ID" value={filters.programId} onChange={(e) => setFilters({ ...filters, programId: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <input placeholder="Year" value={filters.className} onChange={(e) => setFilters({ ...filters, className: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <input placeholder="MSSV" value={filters.studentId} onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={load} disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6 }}>
          {loading ? 'Đang tải...' : 'Tải dữ liệu'}
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}

      {completion && (
        <div style={{ marginTop: 20, padding: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Tổng quan</div>
          <div>Đã tích lũy: {completion.earnedCredits}/{completion.totalCredits} tín chỉ ({completion.pct}%)</div>
          <div style={{ height: 10, background: '#e2e8f0', borderRadius: 6, marginTop: 8 }}>
            <div style={{ width: `${completion.pct}%`, height: '100%', background: '#22c55e', borderRadius: 6 }}></div>
          </div>
        </div>
      )}

      {data?.courses && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Chi tiết học phần</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Mã MH</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Tên môn</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Số TC</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Học kỳ</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.courseCode}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.courseName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.credits}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{c.term}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12,
                        background: c.status === 'Đạt' ? '#dcfce7' : c.status === 'Đang học' ? '#dbeafe' : '#fee2e2',
                        color: c.status === 'Đạt' ? '#16a34a' : c.status === 'Đang học' ? '#2563eb' : '#dc2626',
                        fontWeight: 600,
                        fontSize: 12,
                      }}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
