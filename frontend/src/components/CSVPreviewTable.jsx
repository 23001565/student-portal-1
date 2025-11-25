import React from 'react';

export default function CSVPreviewTable({ headers = [], rows = [], maxRows = 20 }) {
  const previewRows = rows.slice(0, maxRows);

  if (!headers.length && !rows.length) {
    return <div style={{ color: '#64748b' }}>Chưa có dữ liệu xem trước.</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} style={{ borderBottom: '1px solid #e2e8f0', padding: '8px', textAlign: 'left', background: '#f1f5f9' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} style={{ borderBottom: '1px solid #e2e8f0', padding: '8px' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div style={{ color: '#94a3b8', marginTop: 8 }}>Hiển thị {maxRows}/{rows.length} dòng đầu tiên.</div>
      )}
    </div>
  );
}
