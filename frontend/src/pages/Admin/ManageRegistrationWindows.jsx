import React, { useEffect, useState } from 'react';
import { getAllRegistrationWindows, createRegistrationWindow, updateRegistrationWindow, deleteRegistrationWindow } from '../../api/adminApi';

export default function ManageRegistrationWindows() {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    semester: '',
    year: '',
    round: 1,
    isActive: true,
  });

  const loadWindows = async () => {
    setLoading(true);
    try {
      const data = await getAllRegistrationWindows();
      setWindows(data);
    } catch (e) {
      setError(e.message || 'Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWindows();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editing) {
        await updateRegistrationWindow(editing.id, form);
        setMessage('Cập nhật thành công');
      } else {
        await createRegistrationWindow(form);
        setMessage('Tạo thành công');
      }
      setForm({
        startTime: '',
        endTime: '',
        semester: '',
        year: '',
        round: 1,
        isActive: true,
      });
      setEditing(null);
      loadWindows();
    } catch (e) {
      setMessage(e.message || 'Lỗi');
    }
  };

  const handleEdit = (win) => {
    setEditing(win);
    setForm({
      startTime: new Date(win.startTime).toISOString().slice(0, 16),
      endTime: new Date(win.endTime).toISOString().slice(0, 16),
      semester: win.semester,
      year: win.year,
      round: win.round,
      isActive: win.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa?')) return;
    try {
      await deleteRegistrationWindow(id);
      setMessage('Xóa thành công');
      loadWindows();
    } catch (e) {
      setMessage(e.message || 'Lỗi xóa');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý đợt đăng ký học phần</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
        <h3>{editing ? 'Sửa' : 'Tạo'} đợt đăng ký</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <input
            type="datetime-local"
            placeholder="Thời gian bắt đầu"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
          />
          <input
            type="datetime-local"
            placeholder="Thời gian kết thúc"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
          />
          <input
            type="number"
            placeholder="Học kỳ"
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            required
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
          />
          <input
            type="number"
            placeholder="Năm"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            required
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
          />
          <input
            type="number"
            placeholder="Đợt"
            value={form.round}
            onChange={(e) => setForm({ ...form, round: e.target.value })}
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
          />
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Hoạt động
          </label>
        </div>
        <button type="submit" style={{ marginTop: 12, background: '#2563eb', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6 }}>
          {editing ? 'Cập nhật' : 'Tạo'}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setForm({ startTime: '', endTime: '', semester: '', year: '', round: 1, isActive: true }); }} style={{ marginLeft: 8, background: '#6b7280', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6 }}>
            Hủy
          </button>
        )}
      </form>

      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
      {message && <div style={{ color: message.includes('thành công') ? '#16a34a' : '#dc2626', marginBottom: 8 }}>{message}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Học kỳ/Năm</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Đợt</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Bắt đầu</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Kết thúc</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {windows.map((win) => (
            <tr key={win.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{win.id}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{win.semester}/{win.year}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{win.round}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{new Date(win.startTime).toLocaleString('en-US', { timeZone: 'UTC' })}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{new Date(win.endTime).toLocaleString('en-US', { timeZone: 'UTC' })}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{win.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>
                <button onClick={() => handleEdit(win)} style={{ marginRight: 8, background: '#f59e0b', color: 'white', padding: '4px 8px', border: 'none', borderRadius: 4 }}>Sửa</button>
                <button onClick={() => handleDelete(win.id)} style={{ background: '#ef4444', color: 'white', padding: '4px 8px', border: 'none', borderRadius: 4 }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}