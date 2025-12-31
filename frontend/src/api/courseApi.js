export async function listCourses({ code, majorId, curriculumCode, includeArchived } = {}) {
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (majorId !== undefined && majorId !== '') params.set('majorId', String(majorId));
  if (curriculumCode) params.set('curriculumCode', curriculumCode);
  if (includeArchived) params.set('includeArchived', '1');
  const url = `/api/admin/courses${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Không tải được danh sách môn học');
  return data;
}

export async function createCourse(body) {
  const res = await fetch('/api/admin/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Tạo môn học thất bại');
  return data;
}

export async function updateCourse(code, body) {
  const res = await fetch(`/api/admin/courses/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Cập nhật môn học thất bại');
  return data;
}

export async function archiveCourse(code) {
  const res = await fetch(`/api/admin/courses/${encodeURIComponent(code)}/archive`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Lưu trữ môn học thất bại');
  return data;
}

export async function deleteCourse(code) {
  const res = await fetch(`/api/admin/courses/${encodeURIComponent(code)}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Xóa môn học thất bại');
  return data;
}

export async function uploadCourses(formData) {
  const res = await fetch('/api/admin/courses/upload', { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Tải lên CSV môn học thất bại');
  return data;
}
