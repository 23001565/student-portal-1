const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function http(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:logout'));
  }


  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw Object.assign(
      new Error(data?.message || 'Request failed'),
      data || {}
    );
  }

  return data;
}

