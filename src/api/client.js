const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, { retryAfter = null, body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
    this.body = body;
  }
}

async function request(path, { userId, method = 'GET', body } = {}) {
  const headers = { 'X-User-Id': userId };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('Retry-After')) || data?.retryAfterSeconds || null;
    throw new ApiError(data?.message || `Request failed with status ${response.status}`, response.status, {
      retryAfter,
      body: data,
    });
  }
  return data;
}

export const api = {
  generate: (userId, prompt) => request('/api/ai/generate', { userId, method: 'POST', body: { prompt } }),
  getStatus: (userId) => request('/api/quota/status', { userId }),
  getHistory: (userId) => request('/api/quota/history', { userId }),
  upgrade: (userId, plan) => request('/api/quota/upgrade', { userId, method: 'POST', body: { plan } }),
};

export const API_URL = BASE_URL;
