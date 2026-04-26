import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DatasetManager() {
  const [datasets, setDatasets] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/datasets/');
      setDatasets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://localhost:5000/api/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Dataset uploaded successfully!');
      setFile(null);
      fetchDatasets();
    } catch (e) {
      console.error(e);
      alert('Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/datasets/${id}`);
      fetchDatasets();
    } catch (e) {
      console.error(e);
      alert('Failed to delete dataset');
    }
  };

  return (
    <div className="glass-panel">
      <h2>Dataset Management</h2>
      <form onSubmit={handleUpload} className="upload-form mt-4">
        <input 
          type="file" 
          accept=".csv" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="file-input"
        />
        <button type="submit" className="primary-btn" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload Data'}
        </button>
      </form>

      <table className="data-table mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Filename</th>
            <th>Status</th>
            <th>Upload Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.filename}</td>
              <td><span className={`status-badge ${d.status.toLowerCase()}`}>{d.status}</span></td>
              <td>{new Date(d.upload_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(d.id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
          {datasets.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">No datasets uploaded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DatasetManager;
