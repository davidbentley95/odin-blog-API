const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:5173';

const TOKEN_KEY = 'blog-admin-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Attaches the stored JWT as a Bearer token. A 401 means it expired or was
// revoked (e.g. JWT_SECRET rotated), so drop it and send the user to log in.
export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: options.body && JSON.stringify(options.body),
  });
  const data = res.status === 204 ? null : await res.json();
  if (res.status === 401 && token) {
    clearToken();
    window.location.assign('/login');
  }
  if (!res.ok) {
    const error = new Error(data?.error ?? `Request failed (${res.status})`);
    error.details = data?.details;
    throw error;
  }
  return data;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
