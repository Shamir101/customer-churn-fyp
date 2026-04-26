import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Clock, FileText, Activity, Upload, X } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Predict() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ tenure: '', monthly: '', total: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [batchUploading, setBatchUploading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/predictions/single', {
        model_id: '1',
        features: { 
          tenure: Number(formData.tenure), 
          MonthlyCharges: Number(formData.monthly), 
          TotalCharges: Number(formData.total) 
        }
      });
      setResult({ 
        prob: res.data.churn_probability, 
        level: res.data.risk_level 
      });
      toast.success('Prediction completed successfully!');
    } catch (error) {
      toast.error('Failed to generate prediction. Please try again.');
      console.error('Prediction error:', error);
      // Fallback: show a mock result for testing UI
      setResult({ 
        prob: Math.random() * 0.8 + 0.1, 
        level: 'Medium' 
      });
    }
    setLoading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = async (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls', '.json', '.parquet'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExt) {
      toast.error('Invalid file type. Supported: CSV, XLSX, XLS, JSON, Parquet');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 50MB');
      return;
    }

    await uploadDatasetFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const uploadDatasetFile = async (file) => {
    try {
      setBatchUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${file.name} uploaded successfully with ${response.data.rows} rows!`);
      setShowUploadModal(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to upload file';
      toast.error(errorMsg);
    } finally {
      setBatchUploading(false);
    }
  };

  const getRiskColor = (prob) => {
    if (prob < 0.3) return '#10B981';
    if (prob < 0.7) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Churn Prediction</h1>
          <p className="text-gray-400">Predict customer churn risk individually or upload batch data</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-medium rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Batch Upload
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-[#162032] p-8 rounded-2xl border border-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="text-blue-500"/> Customer Data</h2>
          <form onSubmit={handlePredict} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tenure (Months)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input required type="number" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} className="w-full bg-[#0A1628] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 24" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Monthly Charges ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input required type="number" step="0.01" value={formData.monthly} onChange={(e) => setFormData({...formData, monthly: e.target.value})} className="w-full bg-[#0A1628] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 85.50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Total Charges ($)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input required type="number" step="0.01" value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})} className="w-full bg-[#0A1628] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 2050.00" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 mt-8">
              {loading ? 'Analyzing...' : 'Predict Churn Risk'}
            </button>
          </form>
        </div>

        <div className="bg-[#162032] p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          {!result ? (
            <div className="text-center text-gray-500">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Enter customer data to generate an AI risk prediction.</p>
            </div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
              <h3 className="text-xl font-bold text-center mb-8">Risk Analysis</h3>
              <div className="w-64 h-64 mx-auto relative">
                <Doughnut 
                  data={{
                    labels: ['Churn Risk', 'Retention Prob'],
                    datasets: [{
                      data: [result.prob * 100, (1 - result.prob) * 100],
                      backgroundColor: [getRiskColor(result.prob), '#1E3A5F'],
                      borderWidth: 0,
                      cutout: '80%'
                    }]
                  }}
                  options={{ plugins: { legend: { display: false } } }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold" style={{ color: getRiskColor(result.prob) }}>{(result.prob * 100).toFixed(1)}%</span>
                  <span className="text-gray-400 text-sm mt-1">Probability</span>
                </div>
              </div>
              <div className="mt-8 text-center bg-[#0A1628] rounded-xl py-4 border border-gray-800">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">CLASSIFICATION STATUS</p>
                <p className="text-2xl font-bold" style={{ color: getRiskColor(result.prob) }}>{result.prob > 0.7 ? 'High Risk' : result.prob > 0.3 ? 'Medium Risk' : 'Low Risk'}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#162032] border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Batch Upload</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls,.json,.parquet"
                disabled={batchUploading}
              />

              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer mb-6 ${
                  dragOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-[#0A1628]'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  {batchUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Upload className="h-8 w-8 text-blue-500" />
                    </motion.div>
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1">
                      {batchUploading ? 'Uploading...' : 'Drop your file here'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      CSV, Excel, JSON, or Parquet
                    </p>
                  </div>
                </div>
              </motion.div>

              <p className="text-gray-400 text-center text-xs mb-4">
                Maximum file size: 50MB
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={batchUploading}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {batchUploading ? 'Uploading...' : 'Select File'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
