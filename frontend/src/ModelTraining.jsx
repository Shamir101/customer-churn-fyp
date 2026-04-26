import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ModelTraining() {
  const [datasets, setDatasets] = useState([]);
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState(null);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/datasets/');
      setDatasets(res.data.filter(d => d.status === 'Preprocessed'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleTrain = async (datasetId) => {
    setTraining(true);
    setResults(null);
    try {
      const res = await axios.post('http://localhost:5000/api/models/train', {
        dataset_id: datasetId
      });
      setResults({
        message: res.data.message,
        accuracy: res.data.accuracy,
        model_id: res.data.model_id
      });
      alert('Models generated (LightGBM / XGBoost) trained successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to train model');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2>Model Training Factory</h2>
      <p>Configure Hyperparameters, select ML algorithm structures (LightGBM/XGBoost), and build intelligence models.</p>

      <div className="dataset-grid mt-4">
        {datasets.length === 0 ? (
          <p>No preprocessed datasets available. Please preprocess first.</p>
        ) : (
          datasets.map(d => (
            <div key={d.id} className="dataset-card training-card">
              <h4>Dataset: {d.filename}</h4>
              <p>Type: Classification</p>
              <button 
                onClick={() => handleTrain(d.id)} 
                className="primary-btn" 
                disabled={training}
              >
                {training ? 'Training...' : 'Initiate Full ML Pipeline'}
              </button>
            </div>
          ))
        )}
      </div>

      {results && (
        <div className="glass-panel mt-4 success-panel">
          <h3>Training Results</h3>
          <p><strong>Status:</strong> {results.message}</p>
          <p><strong>Model Validation Accuracy:</strong> {(results.accuracy * 100).toFixed(1)}%</p>
          <p className="mt-4">Model Pipeline `lgbm_model.pkl` generated effectively!</p>
        </div>
      )}
    </div>
  );
}

export default ModelTraining;
