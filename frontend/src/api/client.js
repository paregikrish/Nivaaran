const API_BASE = '/api';

/**
 * Make an authenticated or public fetch request to the backend.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('nivaaran_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || (data.message) || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Conversations
  getConversations: () => request('/conversations'),
  getConversation: (id) => request(`/conversations/${id}`),
  createConversation: (payload = {}) => request('/conversations', { method: 'POST', body: JSON.stringify(payload) }),
  renameConversation: (id, title) => request(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),
  sendMessage: (id, content) => request(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  regenerateMessage: (id) => request(`/conversations/${id}/regenerate`, { method: 'POST' }),

  // Resources
  getResources: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/resources${queryString}`);
  },
  getCategories: () => request('/resources/categories'),
};
