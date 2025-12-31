import React, { useMemo, useState } from 'react';
import { uploadCourses } from '../../api/courseApi.js';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  const rows = lines.map(l => l.split(','));
  return rows;
}

export default function UploadCourses() {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ code: '', name: '', credits: '', majorId: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const headerOptions = useMemo(() => headers, [headers]);

  const onFileSelected = async (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setMessage('');
    if (!f) return;
    try {
      const text = await f.text();
      const r = parseCSV(text);
      if (!r.length) { setHeaders([]); setRows([]); return; }
      setHeaders(r[0]);
      setRows(r.slice(1));
      const lower = r[0].map(h => h.toLowerCase().trim());
      setMapping(m => ({
        code: m.code || (r[0][lower.indexOf('code')] || r[0][lower.indexOf('mamh')] || ''),
        name: m.name || (r[0][lower.indexOf('name')] || r[0][lower.indexOf('tenmh')] || ''),
        credits: m.credits || (r[0][lower.indexOf('credits')] || r[0][lower.indexOf('sotinchi')] || ''),
        majorId: m.majorId || (r[0][lower.indexOf('majorid')] || r[0][lower.indexOf('manganh')] || ''),
      }));
    } catch (e) {
      console.error(e);
      setMessage('Không thể đọc file CSV');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('mapping', JSON.stringify(mapping));
      const res = await uploadCourses(form);
      const errCount = (res.errors || []).length;
      setMessage(`Đã xử lý. Thêm mới: ${res.inserted}, cập nhật: ${res.updated}${errCount ? `, lỗi: ${errCount}` : ''}`);
    } catch (e) {
      setMessage(e.message || 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload môn học (CSV)</h2>
      <p className="text-muted">Định dạng: code,name,credits,majorId</p>

      <div style={{ marginTop: 12 }}>
        <input type="file" accept=".csv" onChange={onFileSelected} />
      </div>

      {headers.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Mapping cột</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            {Object.keys(mapping).map((key) => (
              <div key={key}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>{key}</label>
                <select
                  value={mapping[key]}
                  onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                  style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%' }}
                >
                  <option value="">-- chọn cột --</option>
                  {headerOptions.map((h, idx) => (
                    <option key={idx} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Xem trước</h4>
          <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e2e8f0' }}>
            <table className="table table-sm">
              <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && <div className="text-muted">Hiển thị 50 dòng đầu</div>}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>{loading ? 'Đang tải...' : 'Tải lên'}</button>
      </div>

      {message && (<div style={{ marginTop: 12 }}>{message}</div>)}
    </div>
  );
}
