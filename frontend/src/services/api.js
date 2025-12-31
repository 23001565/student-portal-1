/*
// Small API helper using fetch and Vite env for base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function buildUrl(path) {
  if (!path) return API_BASE;
  return path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
}

async function request(path, { method = 'GET', body = null, token = null, headers = {} } = {}) {
  const url = buildUrl(path);
  const opts = { method, headers: { ...headers } };

  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body != null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    const err = new Error((data && data.error) || res.statusText || 'API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function login(email, password, role) {
  return request('/auth/login', { method: 'POST', body: { email, password, role } });
}

export default { request, login };
*/
