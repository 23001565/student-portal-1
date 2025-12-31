/* =========================
   LIST / FILTER CLASSES
========================= */
export async function listClasses({
  courseCode,
  semester,
  year,
  includeArchived,
} = {}) {
  const params = new URLSearchParams();

  if (courseCode) params.set('courseCode', courseCode);
  if (semester !== undefined && semester !== '') params.set('semester', String(semester));
  if (year !== undefined && year !== '') params.set('year', String(year));
  if (includeArchived) params.set('includeArchived', '1');

  const url = `/api/admin/classes${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Không tải được danh sách lớp học phần');
  }
  return data;
}

/* =========================
   CREATE CLASS
========================= */
export async function createClass(body) {
  const res = await fetch('/api/admin/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Tạo lớp học phần thất bại');
  }
  return data;
}

/* =========================
   UPDATE CLASS
   (code + semester + year)
========================= */
export async function updateClass(code, semester, year, body) {
  const res = await fetch(
    `/api/admin/classes/${encodeURIComponent(code)}/${semester}/${year}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Cập nhật lớp học phần thất bại');
  }
  return data;
}

/* =========================
   ARCHIVE CLASS
========================= */
export async function archiveClass(code, semester, year) {
  const res = await fetch(
    `/api/admin/classes/${encodeURIComponent(code)}/${semester}/${year}/archive`,
    { method: 'POST' },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Lưu trữ lớp học phần thất bại');
  }
  return data;
}

/* =========================
   DELETE CLASS
========================= */
export async function deleteClass(code, semester, year) {
  const res = await fetch(
    `/api/admin/classes/${encodeURIComponent(code)}/${semester}/${year}`,
    { method: 'DELETE' },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Xóa lớp học phần thất bại');
  }
  return data;
}

/* =========================
   UPLOAD CLASSES FROM CSV
========================= */
export async function uploadClasses(formData) {
  const res = await fetch('/api/admin/classes/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Tải lên CSV lớp học phần thất bại');
  }
  return data;
}
