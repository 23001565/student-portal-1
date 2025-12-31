import { http } from './http.js';

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

  const url = `/admin/classes${params.toString() ? `?${params.toString()}` : ''}`;
  return http(url);
}

/* =========================
   CREATE CLASS
========================= */
export async function createClass(body) {
  return http('/admin/classes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/* =========================
   UPDATE CLASS
   (code + semester + year)
========================= */
export async function updateClass(code, semester, year, body) {
  return http(
    `/admin/classes/${encodeURIComponent(code)}/${semester}/${year}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

/* =========================
   ARCHIVE CLASS
========================= */
export async function archiveClass(code, semester, year) {
  return http(
    `/admin/classes/${encodeURIComponent(code)}/${semester}/${year}/archive`,
    { method: 'POST' },
  );
}

/* =========================
   DELETE CLASS
========================= */
export async function deleteClass(code, semester, year) {
  return http(
    `/admin/classes/${encodeURIComponent(code)}/${semester}/${year}`,
    { method: 'DELETE' },
  );
}

/* =========================
   UPLOAD CLASSES FROM CSV
========================= */
export async function uploadClasses(formData) {
  return http('/admin/classes/upload', {
    method: 'POST',
    body: formData,
  });
}
