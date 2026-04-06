window.AppAPI = {
  async fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API Request Failed');
    }

    return response.json();
  },

  async loginUser(credentials) {
    return this.fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async predictSingleCustomer(data) {
    return this.fetchApi('/api/predictions/single', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/datasets/upload', {
      method: 'POST',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload dataset');
    return response.json();
  },

  async trainModel(dataset_id) {
    return this.fetchApi('/api/models/train', {
      method: 'POST',
      body: JSON.stringify({ dataset_id }),
    });
  },

  async runBatchPrediction(file, model_id) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_id', model_id);
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/predictions/batch', {
      method: 'POST',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to process batch');
    return response.json();
  }
};
