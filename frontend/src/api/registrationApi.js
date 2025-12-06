export async function getOpenCourses(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/registration/courses?${qs}`);
  if (!res.ok) throw new Error('Không tải được danh sách học phần');
  return res.json();
}

export async function submitRegistration(payload) {
  const res = await fetch('/api/registration/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Đăng ký thất bại');
  return res.json();
}
