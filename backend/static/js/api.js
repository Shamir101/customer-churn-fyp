/**
 * ChurnSense API client (vanilla JS)
 * Wraps all fetch calls, attaches JWT from localStorage, handles errors.
 */
window.AppAPI = {

  _token() { return localStorage.getItem('token'); },

  /** Generic fetch with auto JWT header */
  async fetch(endpoint, options = {}) {
    const token = this._token();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options.headers || {}),
    };
    const res = await window.fetch(endpoint, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
    return data;
  },

  /** Fetch with FormData (file uploads) */
  async fetchForm(endpoint, formData) {
    const token = this._token();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await window.fetch(endpoint, { method: 'POST', headers, body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `Upload failed (${res.status})`);
    return data;
  },

  // ── Auth ─────────────────────────────────────────────────────────────

  async login(credentials) {
    return this.fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  },

  async register(data) {
    return this.fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
  },

  async forgotPassword(email) {
    return this.fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },

  logout() {
    const token = this._token();
    if (token) {
      window.fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  },

  // ── Guard ─────────────────────────────────────────────────────────────

  requireAuth() {
    if (!this._token()) {
      window.location.href = '/login';
    }
  },

  // ── Toast notifications ───────────────────────────────────────────────

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },
};
