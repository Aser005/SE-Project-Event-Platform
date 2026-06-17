const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const authApi = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};
