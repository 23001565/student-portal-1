import React, { useRef } from 'react';

const ACCEPT_MAP = {
  csv: '.csv,text/csv',
};

export default function FileUpload({
  label = 'Chọn tệp',
  accept = 'csv',
  onFileSelected,
  maxSizeMB = 10,
  required = true,
  className = '',
}) {
  const inputRef = useRef(null);
  const acceptAttr = ACCEPT_MAP[accept] || accept;

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      alert(`File vượt quá ${maxSizeMB}MB`);
      e.target.value = '';
      return;
    }

    onFileSelected?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      alert(`File vượt quá ${maxSizeMB}MB`);
      return;
    }
    onFileSelected?.(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className={`file-upload ${className}`}>
      <label className="file-upload-label">{label}{required ? ' *' : ''}</label>
      <div
        className="file-upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #cbd5e1',
          padding: '20px',
          borderRadius: 8,
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f8fafc',
        }}
      >
        <div style={{ color: '#475569', marginBottom: 8 }}>Kéo thả tệp vào đây hoặc bấm để chọn</div>
        <small style={{ color: '#64748b' }}>Hỗ trợ: {acceptAttr}</small>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}
