import React, { useMemo, useState } from 'react';
import { uploadCurriculum } from '../../api/curriculumApi.js';

// Simple ID generator for client-side tree editing
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function GroupEditor({ group, onChange, onDelete }) {
  const [courseInput, setCourseInput] = useState('');

  const updateField = (key, value) => {
    onChange({ ...group, [key]: value });
  };

  const addCourse = () => {
    const code = courseInput.trim();
    if (!code) return;
    if (group.courses.includes(code)) return;
    onChange({ ...group, courses: [...group.courses, code] });
    setCourseInput('');
  };

  const removeCourse = (code) => {
    onChange({ ...group, courses: group.courses.filter(c => c !== code) });
  };

  const addSubgroup = () => {
    const newSub = {
      _id: uid(),
      name: '',
      type: '', // optional free-text or enum string
      required: true,
      totalCredits: 0,
      courses: [],
      subgroups: [],
    };
    onChange({ ...group, subgroups: [...group.subgroups, newSub] });
  };

  const updateSubgroup = (id, updated) => {
    onChange({
      ...group,
      subgroups: group.subgroups.map(g => (g._id === id ? updated : g)),
    });
  };

  const deleteSubgroup = (id) => {
    onChange({ ...group, subgroups: group.subgroups.filter(g => g._id !== id) });
  };

  return (
    <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: 12, paddingLeft: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nhóm"
          value={group.name}
          onChange={(e) => updateField('name', e.target.value)}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 180 }}
        />
        <input
          type="text"
          placeholder="Loại (CHUNG/KHOINGANH/NHOMNGANH/LINHVUC/NGANH)"
          value={group.type || ''}
          onChange={(e) => updateField('type', e.target.value)}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 180 }}
        />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#334155' }}>
          <input
            type="checkbox"
            checked={group.required}
            onChange={(e) => updateField('required', e.target.checked)}
          />
          Required
        </label>
        <input
          type="number"
          min={0}
          placeholder="Tổng số tín chỉ"
          value={group.totalCredits}
          onChange={(e) => updateField('totalCredits', Number(e.target.value) || 0)}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, width: 140 }}
        />
        <button
          onClick={onDelete}
          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px' }}
        >Delete group</button>
      </div>

      {/* Courses */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>Courses in this group</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Mã môn học (e.g., CHE3200)"
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCourse(); } }}
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 180 }}
          />
          <button
            onClick={addCourse}
            style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px' }}
          >Thêm môn học</button>
        </div>
        {group.courses.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {group.courses.map((c) => (
              <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e2e8f0', padding: '4px 8px', borderRadius: 999 }}>
                <span style={{ color: '#0f172a' }}>{c}</span>
                <button onClick={() => removeCourse(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subgroups */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, color: '#334155' }}>Subgroups</div>
          <button
            onClick={addSubgroup}
            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px' }}
          >Thêm nhóm con</button>
        </div>
        {group.subgroups.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {group.subgroups.map((sg) => (
              <GroupEditor
                key={sg._id}
                group={sg}
                onChange={(u) => updateSubgroup(sg._id, u)}
                onDelete={() => deleteSubgroup(sg._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadCurriculum() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Curriculum metadata
  const [code, setCode] = useState('');
  const [majorName, setMajorId] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  // Tree: top-level groups
  const [groups, setGroups] = useState([]);

  const addTopLevelGroup = () => {
    setGroups((gs) => ([
      ...gs,
      {
        _id: uid(),
        name: '',
        type: '',
        required: true,
        totalCredits: 0,
        courses: [],
        subgroups: [],
      }
    ]));
  };

  const updateGroup = (id, updated) => {
    const walk = (arr) => arr.map((g) => {
      if (g._id === id) return updated;
      if (g.subgroups?.length) return { ...g, subgroups: walk(g.subgroups) };
      return g;
    });
    setGroups((gs) => walk(gs));
  };

  const deleteGroup = (id) => {
    const walk = (arr) => arr
      .filter((g) => g._id !== id)
      .map((g) => ({ ...g, subgroups: g.subgroups ? walk(g.subgroups) : [] }));
    setGroups((gs) => walk(gs));
  };

  const stripForSubmit = (g) => ({
    name: g.name?.trim() || null,
    type: g.type?.trim() || null,
    required: !!g.required,
    totalCredits: Number(g.totalCredits) || 0,
    courses: g.courses || [],
    subgroups: (g.subgroups || []).map(stripForSubmit),
  });

  const validate = () => {
    if (!code.trim()) return 'Mã chương trình (code) là bắt buộc';
    const sy = Number(startYear);
    if (!sy || sy < 1900 || sy > 3000) return 'Năm bắt đầu không hợp lệ';
    if (endYear) {
      const ey = Number(endYear);
      if (!ey || ey < sy) return 'Năm kết thúc không hợp lệ';
    }
    // optional: ensure at least one group or course
    if (groups.length === 0) return 'Cần ít nhất một group trong CTĐT';
    return '';
  };

  const handleSubmit = async () => {
    setMessage('');
    const err = validate();
    if (err) { setMessage(err); return; }
    setLoading(true);
    try {
      const payload = {
        code: code.trim(),
        majorName: majorName ? majorName.trim() : null,
        startYear: Number(startYear),
        endYear: endYear ? Number(endYear) : null,
        groups: groups.map(stripForSubmit),
      };

      // Keep existing API shape by sending multipart with a 'payload' field
      const form = new FormData();
      form.append('payload', JSON.stringify(payload));

      const res = await uploadCurriculum(form);
      setMessage(`Tải lên thành công${res?.inserted ? `: ${res.inserted} bản ghi` : ''}`);

      // Optional: reset
      // setCode(''); setMajorId(''); setStartYear(''); setEndYear(''); setGroups([]);
    } catch (e) {
      setMessage(e?.message || 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Nhập chương trình học </h2>
      <p style={{ color: '#64748b' }}>
        Tạo CTĐT theo cấu trúc cây: Nhóm (có thể lồng) và các học phần trong từng nhóm. Trường backend sẽ nhận cấu trúc này để ghi DB.
      </p>

      {/* Metadata */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Mã chương trình (code)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g., KHDL2024"
            style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Mã ngành học</label>
          <input
            type="text"
            value={majorName}
            onChange={(e) => setMajorName(e.target.value)}
            placeholder="e.g., KHDL"
            style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Năm bắt đầu</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            placeholder="e.g., 2024"
            style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Năm kết thúc (tùy chọn)</label>
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            placeholder="e.g., 2028"
            style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%' }}
          />
        </div>
      </div>

      {/* Groups builder */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Nhóm (top-level)</h3>
          <button
            onClick={addTopLevelGroup}
            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px' }}
          >Thêm nhóm</button>
        </div>
        {groups.length === 0 && (
          <div style={{ marginTop: 8, color: '#64748b' }}>Chưa có nhóm nào. Nhấn "Thêm nhóm" để bắt đầu.</div>
        )}
        <div style={{ marginTop: 8 }}>
          {groups.map(g => (
            <GroupEditor
              key={g._id}
              group={g}
              onChange={(u) => updateGroup(g._id, u)}
              onDelete={() => deleteGroup(g._id)}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ background: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: 6, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
        >{loading ? 'Đang gửi...' : 'Lưu CTĐT'}</button>
      </div>

      {message && (
        <div style={{ marginTop: 16, color: message.toLowerCase().includes('thất bại') || message.toLowerCase().includes('không hợp l��') ? '#dc2626' : '#16a34a' }}>
          {message}
        </div>
      )}
    </div>
  );
}
