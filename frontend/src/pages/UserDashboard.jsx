import React, { useState } from 'react';
import { predictSingleCustomer } from '../api';

export default function UserDashboard() {
  const [tenure, setTenure] = useState('');
  const [monthlyCharges, setMonthlyCharges] = useState('');
  const [contractType, setContractType] = useState('Month-to-month');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePredict = async () => {
    setLoading(true);
    setErrorMsg('');
    setPrediction(null);
    try {
      const result = await predictSingleCustomer({
        model_id: 1, // Mock model_id for now as backend requires it
        features: {
          tenure: parseInt(tenure),
          monthly_charges: parseFloat(monthlyCharges),
          contract_type: contractType
        }
      });
      setPrediction(result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2>Predict Single Customer Churn</h2>
      
      <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Tenure (Months)</label>
            <input type="number" value={tenure} onChange={e=>setTenure(e.target.value)} style={inputStyle} placeholder="e.g. 12" />
          </div>
          <div>
            <label style={labelStyle}>Monthly Charges ($)</label>
            <input type="number" step="0.01" value={monthlyCharges} onChange={e=>setMonthlyCharges(e.target.value)} style={inputStyle} placeholder="e.g. 75.50" />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Contract Type</label>
            <select value={contractType} onChange={e=>setContractType(e.target.value)} style={inputStyle}>
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </div>
          
          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            {errorMsg && <div style={{color: '#f87171', marginBottom: '1rem'}}>{errorMsg}</div>}
            <button type="button" onClick={handlePredict} disabled={loading} className="btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Running...' : 'Run Prediction'}
            </button>
          </div>
        </form>
      </div>

      {prediction && (
        <div className="glass-card" style={{ 
          maxWidth: '600px', margin: '2rem auto', textAlign: 'center', 
          borderColor: prediction.risk_level === 'High' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(52, 211, 153, 0.4)' 
        }}>
          <h3 style={{ 
            color: prediction.risk_level === 'High' ? '#f87171' : '#34d399', margin: '0 0 1rem 0' 
          }}>
            {prediction.risk_level} Risk ({(prediction.churn_probability * 100).toFixed(0)}% Probability)
          </h3>
          <p><strong>Recommendation:</strong> {
            prediction.risk_level === 'High' 
              ? 'Immediate personal outreach, exclusive discount, loyalty program entry.' 
              : 'Standard email engagement, no immediate action required.'
          }</p>
        </div>
      )}
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
