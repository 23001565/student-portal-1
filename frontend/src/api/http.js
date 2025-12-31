const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function http(url, options = {}) {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    credentials: 'include', //  REQUIRED for cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    // Optional: redirect to login page
    // Frontend cannot "delete" HttpOnly cookie
    // Backend logout endpoint must clear it
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}
