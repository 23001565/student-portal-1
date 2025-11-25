import React, { useMemo, useState } from 'react';
import FileUpload from '../../components/FileUpload';
import CSVPreviewTable from '../../components/CSVPreviewTable';
import { uploadGrades } from '../../api/gradesApi';

function parseCSV(text) {
  // Simple CSV parser (no quoted commas). For production replace with PapaParse if needed.
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  const rows = lines.map(l => l.split(','));
  return rows;
}

export default function UploadGrades() {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ studentId: '', courseCode: '', term: '', score: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const headerOptions = useMemo(() => headers, [headers]);

  const onFileSelected = async (f) => {
    setFile(f);
    setMessage('');
    try {
      const text = await f.text();
      const r = parseCSV(text);
      if (!r.length) {
        setHeaders([]); setRows([]);
        return;
      }
      setHeaders(r[0]);
      setRows(r.slice(1));
      // Auto map based on common names
      const lower = r[0].map(h => h.toLowerCase().trim());
      setMapping(m => ({
        studentId: m.studentId || (r[0][lower.indexOf('studentid')] || r[0][lower.indexOf('mssv')] || ''),
        courseCode: m.courseCode || (r[0][lower.indexOf('coursecode')] || r[0][lower.indexOf('mamh')] || ''),
        term: m.term || (r[0][lower.indexOf('term')] || r[0][lower.indexOf('hocky')] || ''),
        score: m.score || (r[0][lower.indexOf('score')] || r[0][lower.indexOf('diem')] || ''),
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
      const res = await uploadGrades(form);
      setMessage(`Tải lên thành công: ${res?.inserted || 0} bản ghi`);
    } catch (e) {
      setMessage(e.message || 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload điểm sinh viên (CSV)</h2>
      <p style={{ color: '#64748b' }}>Định dạng khuyến nghị: studentId,courseCode,term,score</p>

      <div style={{ marginTop: 16 }}>
        <FileUpload onFileSelected={onFileSelected} />
      </div>

      {headers.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Mapping cột</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            {['studentId','courseCode','term','score'].map((key) => (
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
        <div style={{ marginTop: 24 }}>
          <h3>Xem trước</h3>
          <CSVPreviewTable headers={headers} rows={rows} />
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            background: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: 6,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >{loading ? 'Đang tải...' : 'Tải lên'}</button>
      </div>

      {message && (
        <div style={{ marginTop: 16, color: message.includes('thất bại') ? '#dc2626' : '#16a34a' }}>{message}</div>
      )}
    </div>
  );
}
