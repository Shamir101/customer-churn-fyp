// General API request wrapper
export async function fetchApi(endpoint, options = {}) {
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
}

// Auth API Calls
export async function loginUser(credentials) {
  return fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Prediction API Calls 
export async function predictSingleCustomer(data) {
  return fetchApi('/api/predictions/single', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Admin API Calls
export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Custom fetch to avoid json wrapper for FormData
  const token = localStorage.getItem('token');
  const response = await fetch('/api/datasets/upload', {
    method: 'POST',
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload dataset');
  return response.json();
}

export async function trainModel(dataset_id) {
  return fetchApi('/api/models/train', {
    method: 'POST',
    body: JSON.stringify({ dataset_id }),
  });
}

export async function runBatchPrediction(file, model_id) {
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
