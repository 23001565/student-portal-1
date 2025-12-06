export async function getStudentProgress(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/admin/progress?${qs}`);
  if (!res.ok) throw new Error('Không tải được tiến trình');
  return res.json();
}
