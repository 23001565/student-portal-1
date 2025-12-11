export async function getOpenCourses(params = {}) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/registration/courses?${qs}`, {
    headers,
  });
  if (!res.ok) throw new Error("Không tải được danh sách học phần");
  return res.json();
}

export async function submitRegistration(payload) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/registration/submit", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Đăng ký thất bại");
  return res.json();
}
