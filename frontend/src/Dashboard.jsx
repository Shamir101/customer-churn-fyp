import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [churnProb, setChurnProb] = useState(null);
  const [riskLevel, setRiskLevel] = useState('');

  const handlePredict = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/predictions/single', {
        model_id: '1',
        features: { tenure: 12, MonthlyCharges: 50.0, TotalCharges: 600.0 }
      });
      setChurnProb(res.data.churn_probability);
      setRiskLevel(res.data.risk_level);
    } catch (e) {
      console.error(e);
      alert('Prediction failed. Is the Flask server running?');
    }
  };

  return (
    <div className="dashboard glass-panel">
      <h1>Dashboard Center</h1>
      <button className="primary-btn" onClick={handlePredict}>Predict Single Customer Churn</button>
      
      {churnProb !== null && (
        <div className="results-panel glass-panel mt-4">
          <h3>Prediction Results</h3>
          <p><strong>Probability:</strong> {(churnProb * 100).toFixed(1)}%</p>
          <p><strong>Risk Level:</strong> {riskLevel}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
