import React, { useMemo, useState } from 'react';
import FileUpload from '../../components/FileUpload';
import CSVPreviewTable from '../../components/CSVPreviewTable';
import { uploadCurriculum } from '../../api/curriculumApi';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  const rows = lines.map(l => l.split(','));
  return rows;
}

export default function UploadCurriculum() {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({
    programId: '', programName: '', courseCode: '', courseName: '', credits: '', term: '', prerequisites: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const headerOptions = useMemo(() => headers, [headers]);

  const onFileSelected = async (f) => {
    setFile(f);
    setMessage('');
    try {
      const text = await f.text();
      const r = parseCSV(text);
      if (!r.length) { setHeaders([]); setRows([]); return; }
      setHeaders(r[0]);
      setRows(r.slice(1));
      const lower = r[0].map(h => h.toLowerCase().trim());
      setMapping(m => ({
        programId: m.programId || (r[0][lower.indexOf('programid')] || r[0][lower.indexOf('ctdtid')] || ''),
        programName: m.programName || (r[0][lower.indexOf('programname')] || r[0][lower.indexOf('tenctdt')] || ''),
        courseCode: m.courseCode || (r[0][lower.indexOf('coursecode')] || r[0][lower.indexOf('mamh')] || ''),
        courseName: m.courseName || (r[0][lower.indexOf('coursename')] || r[0][lower.indexOf('tenmh')] || ''),
        credits: m.credits || (r[0][lower.indexOf('credits')] || r[0][lower.indexOf('sotinchi')] || ''),
        term: m.term || (r[0][lower.indexOf('term')] || r[0][lower.indexOf('hocky')] || ''),
        prerequisites: m.prerequisites || (r[0][lower.indexOf('prerequisites')] || r[0][lower.indexOf('tienquyet')] || ''),
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
      const res = await uploadCurriculum(form);
      setMessage(`Tải lên thành công: ${res?.inserted || 0} dòng`);
    } catch (e) {
      setMessage(e.message || 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload chương trình học (CSV)</h2>
      <p style={{ color: '#64748b' }}>Định dạng khuyến nghị: programId,programName,courseCode,courseName,credits,term,prerequisites</p>

      <div style={{ marginTop: 16 }}>
        <FileUpload onFileSelected={onFileSelected} />
      </div>

      {headers.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Mapping cột</h3>
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
