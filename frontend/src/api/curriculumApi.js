export async function uploadCurriculum(formData) {
  const res = await fetch('/api/admin/curriculum/upload', { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Upload chương trình học thất bại'), data);
  return data;
}

export async function updateCurriculum(code, formData) {
  const res = await fetch(`/api/admin/curriculum/${encodeURIComponent(code)}`, { method: 'PATCH', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Cập nhật CTĐT thất bại'), data);
  return data;
}

export async function archiveCurriculum(code) {
  const res = await fetch(`/api/admin/curriculum/${encodeURIComponent(code)}/archive`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Lưu trữ CTĐT thất bại');
  return data;
}

export async function deleteCurriculum(code) {
  const res = await fetch(`/api/admin/curriculum/${encodeURIComponent(code)}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Xóa CTĐT thất bại');
  return data;
}

export async function cloneCurriculum(body /* URLSearchParams or FormData */) {
  const res = await fetch('/api/admin/curriculum/clone', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Clone CTĐT thất bại');
  return data;
}

export async function getCurriculumByCode(code) {
  const res = await fetch(`/api/admin/curriculum/${encodeURIComponent(code)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Không tải được CTĐT');
  return data;
}

export async function listCurricula({ majorId, startYear, endYear } = {}) {
  const params = new URLSearchParams();
  if (majorId !== undefined && majorId !== '') params.set('majorId', String(majorId));
  if (startYear !== undefined && startYear !== '') params.set('startYear', String(startYear));
  if (endYear !== undefined && endYear !== '') params.set('endYear', String(endYear));
  const url = `/api/admin/curriculum${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Không tải được danh sách CTĐT');
  return data;
}
