import React from 'react';

export default function UserDashboard() {
  return (
    <div className="dashboard-layout" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2>Predict Single Customer Churn</h2>
      
      <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Tenure (Months)</label>
            <input type="number" style={inputStyle} placeholder="e.g. 12" />
          </div>
          <div>
            <label style={labelStyle}>Monthly Charges ($)</label>
            <input type="number" step="0.01" style={inputStyle} placeholder="e.g. 75.50" />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Contract Type</label>
            <select style={inputStyle}>
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </div>
          
          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            <button type="button" className="btn-primary" style={{ width: '100%' }}>Run Prediction</button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
        <h3 style={{ color: '#f87171', margin: '0 0 1rem 0' }}>High Risk (78% Probability)</h3>
        <p><strong>Recommendation:</strong> Immediate personal outreach, exclusive discount, loyalty program entry.</p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--glass-border)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  outline: 'none',
  marginTop: '0.5rem'
};

const labelStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};
