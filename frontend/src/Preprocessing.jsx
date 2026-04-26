import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Preprocessing() {
  const [datasets, setDatasets] = useState([]);
  const [processing, setProcessing] = useState(false);

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

  const handlePreprocess = async (id) => {
    setProcessing(true);
    try {
      await axios.post(`http://localhost:5000/api/datasets/${id}/preprocess`);
      alert('Data cleaning, missing value imputation, and correlation filtering completed successfully!');
      fetchDatasets();
    } catch (e) {
      console.error(e);
      alert('Preprocessing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2>Data Preprocessing Pipeline</h2>
      <p>Clean raw telecom datasets, encode categorical variables (One-Hot, Label Encoding), and scale numerical columns.</p>
      
      <div className="dataset-grid mt-4">
        {datasets.filter(d => d.status === 'Uploaded').map(d => (
          <div key={d.id} className="dataset-card">
            <h4>{d.filename}</h4>
            <p>Status: <span className="warning-text">Needs Preprocessing</span></p>
            <button 
              onClick={() => handlePreprocess(d.id)} 
              className="primary-btn" 
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Run Pipeline'}
            </button>
          </div>
        ))}
        {datasets.filter(d => d.status === 'Uploaded').length === 0 && (
          <p>No new uploaded datasets available for preprocessing.</p>
        )}
      </div>

      <h3 className="mt-4">Preprocessed Datasets Ready for Training</h3>
      <div className="dataset-grid mt-4">
        {datasets.filter(d => d.status === 'Preprocessed').map(d => (
          <div key={d.id} className="dataset-card success">
            <h4>{d.filename}</h4>
            <p>Cleaned and Ready to go!</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Preprocessing;
