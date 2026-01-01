import React, { useEffect, useMemo, useState } from 'react';
import {
  listCurricula,
  getCurriculumByCode,
  uploadCurriculum,
  updateCurriculum,
  archiveCurriculum,
  deleteCurriculum,
  cloneCurriculum,
} from '../../api/curriculumApi.js';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeGroupForEditor(g) {
  return {
    _id: uid(),
    name: g.name || '',
    type: g.type || '',
    required: !!g.required,
    totalCredits: Number(g.totalCredits) || 0,
    courses: Array.isArray(g.courses) ? g.courses.map(c => typeof c === 'string' ? c : c.code).filter(Boolean) : [],
    subgroups: Array.isArray(g.subgroups) ? g.subgroups.map(normalizeGroupForEditor) : [],
  };
}

function stripGroupForSubmit(g) {
  return {
    name: g.name?.trim() || null,
    type: g.type?.trim() || null,
    required: !!g.required,
    totalCredits: Number(g.totalCredits) || 0,
    courses: g.courses || [],
    subgroups: (g.subgroups || []).map(stripGroupForSubmit),
  };
}

function GroupEditor({ group, onChange, onDelete }) {
  const [courseInput, setCourseInput] = useState('');

  const updateField = (key, value) => onChange({ ...group, [key]: value });

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
      _id: uid(), name: '', type: '', required: true, totalCredits: 0, courses: [], subgroups: [],
    };
    onChange({ ...group, subgroups: [...group.subgroups, newSub] });
  };

  const updateSubgroup = (id, updated) => {
    onChange({ ...group, subgroups: group.subgroups.map(g => (g._id === id ? updated : g)) });
  };

  const deleteSubgroup = (id) => {
    onChange({ ...group, subgroups: group.subgroups.filter(g => g._id !== id) });
  };

  return (
    <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: 12, paddingLeft: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Group name"
          value={group.name}
          onChange={(e) => updateField('name', e.target.value)}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 180 }}
        />
        <input
          type="text"
          placeholder="Type (e.g., CORE/ELECTIVE)"
          value={group.type || ''}
          onChange={(e) => updateField('type', e.target.value)}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 180 }}
        />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#334155' }}>
          <input type="checkbox" checked={group.required} onChange={(e) => updateField('required', e.target.checked)} />
          Required
        </label>
        <input
          type="number"
          min={0}
          placeholder="Total Credits"
          value={group.totalCredits}
          onChange={(e) => updateField('totalCredits', Number(e.target.value) || 0)}
          style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, width: 140 }}
        />
        <button onClick={onDelete} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px' }}>Delete group</button>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>Courses in this group</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Course code (e.g., CS101)"
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCourse(); } }}
            style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 180 }}
          />
          <button onClick={addCourse} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px' }}>Add course</button>
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

      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, color: '#334155' }}>Subgroups</div>
          <button onClick={addSubgroup} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px' }}>Add subgroup</button>
        </div>
        {group.subgroups.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {group.subgroups.map((sg) => (
              <GroupEditor key={sg._id} group={sg} onChange={(u) => updateSubgroup(sg._id, u)} onDelete={() => deleteSubgroup(sg._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageCurricula() {
  const [mode, setMode] = useState('create'); // 'create' | 'update' | 'clone'

  // Filter/list state
  const [filters, setFilters] = useState({ majorName: '', startYear: '', endYear: '' });
  const [curricula, setCurricula] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Selected / details for update/clone
  const [selectedCode, setSelectedCode] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  // Metadata and tree editor state
  const [code, setCode] = useState('');
  const [majorName, setMajorName] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [groups, setGroups] = useState([]);

  // Clone
  const [cloneFromCode, setCloneFromCode] = useState('');
  const [cloneToCode, setCloneToCode] = useState('');

  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const loadList = async () => {
    setListLoading(true);
    setMessage('');
    try {
      const data = await listCurricula({
        majorName: filters.majorName ? filters.majorName : undefined,
        startYear: filters.startYear ? Number(filters.startYear) : undefined,
        endYear: filters.endYear ? Number(filters.endYear) : undefined,
      });
      setCurricula(data.items || []);
    } catch (e) {
      setMessage(e?.message || 'Tải danh sách CTĐT thất bại');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { loadList(); /* initial */ }, []);

  const resetEditor = () => {
    setCode(''); setMajorName(''); setStartYear(''); setEndYear(''); setGroups([]);
  };

  const addTopLevelGroup = () => {
    setGroups(gs => ([...gs, { _id: uid(), name: '', type: '', required: true, totalCredits: 0, courses: [], subgroups: [] }]));
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

  const validate = () => {
    if (mode !== 'clone') {
      if (!code.trim()) return 'Mã chương trình (code) là bắt buộc';
      const sy = Number(startYear); if (!sy || sy < 1900 || sy > 3000) return 'Năm bắt đầu không hợp lệ';
      if (endYear) { const ey = Number(endYear); if (!ey || ey < sy) return 'Năm kết thúc không hợp lệ'; }
      if (groups.length === 0) return 'Cần ít nhất một group trong CTĐT';
    } else {
      if (!cloneFromCode.trim()) return 'Chọn CTĐT nguồn để clone';
      if (!cloneToCode.trim()) return 'Nhập mã CTĐT mới';
    }
    return '';
  };

  const loadDetail = async (codeValue) => {
    setDetailLoading(true);
    setMessage('');
    try {
      const d = await getCurriculumByCode(codeValue);
      setSelectedCode(d.code);
      setCode(d.code);
      setMajorName(d.majorName ?? '');
      setStartYear(d.startYear ?? '');
      setEndYear(d.endYear ?? '');
      const eg = (d.groups || []).map(normalizeGroupForEditor);
      setGroups(eg);
    } catch (e) {
      setMessage(e?.message || 'Không tải được CTĐT');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    const err = validate(); if (err) { setMessage(err); return; }
    setSaving(true); setMessage('');
    try {
      const payload = {
        code: code.trim(),
        majorName: majorName ? majorName : null,
        startYear: Number(startYear),
        endYear: endYear ? Number(endYear) : null,
        groups: groups.map(stripGroupForSubmit),
      };
      const form = new FormData();
      form.append('payload', JSON.stringify(payload));

      if (mode === 'create') {
        const res = await uploadCurriculum(form);
        setMessage(`Tạo CTĐT thành công (ID ${res?.curriculumId || ''})`);
        await loadList();
      } else {
        const res = await updateCurriculum(selectedCode || code, form);
        setMessage(`Cập nhật CTĐT thành công (ID ${res?.curriculumId || ''})`);
        await loadList();
      }
    } catch (e) {
      const missing = e?.details?.missing; // if backend returns details
      if (missing) setMessage(`Thiếu mã học phần: ${missing.join(', ')}`);
      else setMessage(e?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedCode) { setMessage('Chọn CTĐT để lưu trữ'); return; }
    setSaving(true); setMessage('');
    try {
      await archiveCurriculum(selectedCode);
      setMessage('Đã lưu trữ CTĐT');
      await loadList();
    } catch (e) { setMessage(e?.message || 'Lưu trữ thất bại'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedCode) { setMessage('Chọn CTĐT để xóa'); return; }
    if (!confirm('Xóa CTĐT này? Hành động không thể hoàn tác.')) return;
    setSaving(true); setMessage('');
    try {
      await deleteCurriculum(selectedCode);
      setMessage('Đã xóa CTĐT');
      setSelectedCode('');
      resetEditor();
      await loadList();
    } catch (e) { setMessage(e?.message || 'Xóa thất bại'); }
    finally { setSaving(false); }
  };

  const handleClone = async () => {
    const err = validate(); if (err) { setMessage(err); return; }
    setSaving(true); setMessage('');
    try {
      const body = new URLSearchParams();
      body.set('fromCode', cloneFromCode.trim());
      body.set('toCode', cloneToCode.trim());
      if (majorName) body.set('majorName', majorName);
      if (startYear) body.set('startYear', String(Number(startYear)));
      if (endYear) body.set('endYear', String(Number(endYear)));
      const res = await cloneCurriculum(body);
      setMessage(`Đã clone CTĐT (ID ${res?.curriculumId || ''}). Đang tải CTĐT mới để chỉnh sửa...`);
      await loadList();
      await loadDetail(cloneToCode.trim());
      setMode('update');
    } catch (e) { setMessage(e?.message || 'Clone thất bại'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý Chương trình học</h2>

      {/* Filter panel */}
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 }}>
        <div>
          <label className="form-label">Major Name</label>
          <input type="text" className="form-control" value={filters.majorName} onChange={(e) => setFilters({ ...filters, majorName: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Start Year</label>
          <input type="number" className="form-control" value={filters.startYear} onChange={(e) => setFilters({ ...filters, startYear: e.target.value })} />
        </div>
        <div>
          <label className="form-label">End Year</label>
          <input type="number" className="form-control" value={filters.endYear} onChange={(e) => setFilters({ ...filters, endYear: e.target.value })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button className="btn btn-primary" onClick={loadList} disabled={listLoading}>{listLoading ? 'Đang lọc...' : 'Lọc'}</button>
        </div>
      </div>

      {/* List */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách CTĐT</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {curricula.map((c) => (
            <button key={c.code} className={`btn btn-sm ${selectedCode === c.code ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => loadDetail(c.code)}>
              {c.code} (Major {c.majorName ?? '-'}, {c.startYear}{c.endYear ? `-${c.endYear}` : ''}){c.archivedAt ? ' [archived]' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ marginTop: 16 }}>
        <div className="btn-group" role="group">
          <input type="radio" className="btn-check" name="mode" id="mode-create" autoComplete="off" checked={mode==='create'} onChange={() => { setMode('create'); resetEditor(); setSelectedCode(''); }} />
          <label className="btn btn-outline-primary" htmlFor="mode-create">Create</label>
          <input type="radio" className="btn-check" name="mode" id="mode-update" autoComplete="off" checked={mode==='update'} onChange={() => setMode('update')} />
          <label className="btn btn-outline-primary" htmlFor="mode-update">Update</label>
          <input type="radio" className="btn-check" name="mode" id="mode-clone" autoComplete="off" checked={mode==='clone'} onChange={() => { setMode('clone'); setCloneFromCode(selectedCode || ''); setCloneToCode(''); }} />
          <label className="btn btn-outline-primary" htmlFor="mode-clone">Clone</label>
        </div>
      </div>

      {/* Editor or Clone panel */}
      {mode !== 'clone' ? (
        <div style={{ marginTop: 16 }}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Code</label>
              <input type="text" className="form-control" value={code} onChange={(e) => setCode(e.target.value)} disabled={mode==='update'} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Major Name</label>
              <input type="number" className="form-control" value={majorName} onChange={(e) => setMajorName(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Year</label>
              <input type="number" className="form-control" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Year</label>
              <input type="number" className="form-control" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <h4 style={{ margin: 0 }}>Groups</h4>
            <button className="btn btn-success" onClick={addTopLevelGroup}>Add group</button>
          </div>
          {groups.length === 0 && <div className="text-muted" style={{ marginTop: 8 }}>No groups yet.</div>}
          <div style={{ marginTop: 8 }}>
            {groups.map(g => (
              <GroupEditor key={g._id} group={g} onChange={(u) => updateGroup(g._id, u)} onDelete={() => deleteGroup(g._id)} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleCreateOrUpdate} disabled={saving}>{saving ? 'Saving...' : (mode==='create' ? 'Create' : 'Update')}</button>
            {mode === 'update' && (
              <>
                <button className="btn btn-warning" onClick={handleArchive} disabled={saving || !selectedCode}>Archive</button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={saving || !selectedCode}>Delete</button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">From code</label>
              <input type="text" className="form-control" value={cloneFromCode} onChange={(e) => setCloneFromCode(e.target.value)} placeholder="Existing code" />
            </div>
            <div className="col-md-4">
              <label className="form-label">To code</label>
              <input type="text" className="form-control" value={cloneToCode} onChange={(e) => setCloneToCode(e.target.value)} placeholder="New unique code" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Major Name (optional)</label>
              <input type="text" className="form-control" value={majorName} onChange={(e) => setMajorName(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Start Year (optional)</label>
              <input type="number" className="form-control" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Year (optional)</label>
              <input type="number" className="form-control" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleClone} disabled={saving}>{saving ? 'Cloning...' : 'Clone'}</button>
          </div>
        </div>
      )}

      {message && (
        <div style={{ marginTop: 16, color: /thất bại|fail|không hợp lệ|Thiếu/.test(message) ? '#dc2626' : '#16a34a' }}>{message}</div>
      )}
    </div>
  );
}
