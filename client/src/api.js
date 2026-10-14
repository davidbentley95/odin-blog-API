const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body && JSON.stringify(options.body),
  });
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    const error = new Error(data?.error ?? `Request failed (${res.status})`);
    error.details = data?.details;
    throw error;
  }
  return data;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
