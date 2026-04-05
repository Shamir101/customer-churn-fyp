import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="dashboard-layout" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Admin Overview</h2>
        <button className="btn-primary">Upload Dataset</button>
      </div>

      <div className="card-grid">
        <div className="glass-card">
          <h3>Active Models</h3>
          <p>LightGBM (84.2% Acc)</p>
          <p>XGBoost (83.5% Acc)</p>
          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '1rem' }}>Retrain Models</button>
        </div>
        
        <div className="glass-card">
          <h3>Batch Predictions</h3>
          <p>Process a massive roster of clients across all active thresholds.</p>
          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '1rem' }}>Run Batch Job</button>
        </div>

        <div className="glass-card">
          <h3>Retention Rules Engine</h3>
          <p>Adjust risk brackets and automated engagement strategies.</p>
          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '1rem' }}>Configure Logic</button>
        </div>
      </div>
    </div>
  );
}
