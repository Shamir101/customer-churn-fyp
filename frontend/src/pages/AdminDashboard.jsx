import React, { useState, useRef } from 'react';
import { uploadDataset, trainModel, runBatchPrediction } from '../api';

export default function AdminDashboard() {
  const [datasetId, setDatasetId] = useState(null);
  const [status, setStatus] = useState('');
  const [models, setModels] = useState([
    { name: 'LightGBM', acc: '84.2%' },
    { name: 'XGBoost', acc: '83.5%' }
  ]);
  
  const uploadInputRef = useRef(null);
  const batchInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Uploading dataset...');
    try {
      const res = await uploadDataset(file);
      setDatasetId(res.dataset_id);
      setStatus(`Dataset uploaded successfully! (ID: ${res.dataset_id})`);
    } catch (err) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleRetrain = async () => {
    if (!datasetId) {
      setStatus('Please upload a new dataset first to retrain models.');
      return;
    }
    setStatus('Training new model. This might take a minute...');
    try {
      const res = await trainModel(datasetId);
      setStatus(`Training complete! New Model ID: ${res.model_id}`);
      setModels(prev => [{name: 'New Custom Model', acc: `${(res.accuracy * 100).toFixed(1)}%`}, ...prev]);
    } catch (err) {
      setStatus(`Training failed: ${err.message}`);
    }
  };

  const handleBatchJob = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Processing batch predictions...');
    try {
      const res = await runBatchPrediction(file, 1 /* mock model id */);
      setStatus(`Batch complete! Successfully processed records. ${res.message}`);
    } catch (err) {
      setStatus(`Batch failed: ${err.message}`);
    }
  };

  return (
    <div className="dashboard-layout" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Admin Overview</h2>
        <div>
          <input type="file" ref={uploadInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleUpload} />
          <button className="btn-primary" onClick={() => uploadInputRef.current.click()}>Upload Dataset</button>
        </div>
      </div>
      
      {status && (
        <div style={{ padding: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#60a5fa' }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      <div className="card-grid">
        <div className="glass-card">
          <h3>Active Models</h3>
          {models.map((m, idx) => <p key={idx}>{m.name} ({m.acc} Acc)</p>)}
          <button className="btn-primary" onClick={handleRetrain} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '1rem' }}>Retrain Models</button>
        </div>
        
        <div className="glass-card">
          <h3>Batch Predictions</h3>
          <p>Process a massive roster of clients across all active thresholds.</p>
          <input type="file" ref={batchInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleBatchJob} />
          <button className="btn-primary" onClick={() => batchInputRef.current.click()} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '1rem' }}>Pick File & Run Batch</button>
        </div>

        <div className="glass-card">
          <h3>Retention Rules Engine</h3>
          <p>Adjust risk brackets and automated engagement strategies.</p>
          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '1rem', opacity: 0.5, cursor: 'not-allowed' }}>Configure Logic (Coming Soon)</button>
        </div>
      </div>
    </div>
  );
}
