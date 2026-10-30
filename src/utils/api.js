import { getToken, clearAuth } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to make authenticated requests.
 * Automatically attaches Bearer token and handles 401 responses.
 */
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  // If 401, token is invalid/expired — clear auth and redirect
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired — please log in again');
  }

  return res;
}

// ─── Auth APIs ────────────────────────────────────────────────────────────────

export async function apiRegister(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Registration failed');
  return json.data; // { token, user }
}

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json.data; // { token, user }
}

export async function apiGetMe() {
  const res = await authFetch(`${API_BASE}/auth/me`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to get user info');
  return json.data;
}

// ─── Project APIs ─────────────────────────────────────────────────────────────

export async function fetchProjects() {
  const res = await authFetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  const json = await res.json();
  return json.data;
}

export async function fetchProject(id) {
  const res = await authFetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Project not found');
  const json = await res.json();
  return json.data;
}

export async function createProject(projectData) {
  const res = await authFetch(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error('Failed to create project');
  const json = await res.json();
  return json.data;
}

export async function updateProject(id, projectData) {
  const res = await authFetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error('Failed to update project');
  const json = await res.json();
  return json.data;
}

export async function deleteProject(id) {
  const res = await authFetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete project');
  const json = await res.json();
  return json.data;
}

export async function generatePresentation(topic, slideCount = 6, style = 'professional') {
  const res = await authFetch(`${API_BASE}/ai/generate`, {
    method: 'POST',
    body: JSON.stringify({ topic, slideCount, style }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI generation failed');
  }
  const json = await res.json();
  return json.data;
}

// ─── AI Slide Action APIs ─────────────────────────────────────────────────────

export async function aiSlideAction(slide, action, customPrompt = '', projectId = '') {
  const res = await authFetch(`${API_BASE}/ai/slide-action`, {
    method: 'POST',
    body: JSON.stringify({ slide, action, customPrompt, projectId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI slide action failed');
  }
  const json = await res.json();
  return json.data;
}

export async function aiSuggestSlide(slides, projectId = '') {
  const res = await authFetch(`${API_BASE}/ai/suggest-slide`, {
    method: 'POST',
    body: JSON.stringify({ slides, projectId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI suggest failed');
  }
  const json = await res.json();
  return json.data;
}

// ─── Unsplash API ─────────────────────────────────────────────────────────────

export async function fetchUnsplashImage(query) {
  const res = await authFetch(`${API_BASE}/unsplash/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch Unsplash image');
  }
  const json = await res.json();
  return json.data;
}
