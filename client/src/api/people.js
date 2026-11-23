// Thin fetch wrappers around the /api/people REST endpoints.
// Every function returns the parsed JSON body and throws an Error (with the
// server's message, when available) on a non-2xx response.
//
// VITE_API_BASE_URL points requests at a separately-deployed API (e.g. the
// Railway URL, when the client is deployed on Vercel). Left unset — as in
// local dev — requests stay relative and go through Vite's /api proxy
// (see vite.config.js) to the server running on localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export function listPeople({ q = '', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', page);
  params.set('limit', limit);

  return request(`/api/people?${params.toString()}`);
}

export function addPerson({ name, address, phone }) {
  return request('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address, phone }),
  });
}

export function updatePerson(id, { name, address, phone }) {
  return request(`/api/people/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address, phone }),
  });
}

export function deletePerson(id) {
  return request(`/api/people/${id}`, { method: 'DELETE' });
}
