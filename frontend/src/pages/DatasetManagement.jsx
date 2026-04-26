import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Database, X, Check, AlertCircle, Loader, Download, Trash2 } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function DatasetManagement() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Fetch datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/datasets');
      setDatasets(response.data.datasets || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = async (file) => {
    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel', 'application/json', 'application/x-parquet'];
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

    await uploadFile(file);
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

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedFile(response.data);
      toast.success(`${file.name} uploaded successfully!`);
      
      // Refresh datasets list
      await fetchDatasets();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to upload file';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await api.delete(`/datasets/${datasetId}`);
      toast.success('Dataset deleted successfully');
      await fetchDatasets();
    } catch (error) {
      toast.error('Failed to delete dataset');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto py-12 px-4"
    >
      <div className="mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-center mb-3">Dataset Management</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-center">
          Upload and manage your customer datasets for churn prediction. Supports CSV, Excel, JSON, and Parquet files.
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-12 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 bg-[#162032]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.json,.parquet"
          disabled={uploading}
        />

        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ y: dragOver ? -5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Upload className="h-12 w-12 text-blue-500" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              {uploading ? 'Uploading...' : 'Drop your file here'}
            </h3>
            <p className="text-gray-400 mb-4">
              {uploading
                ? 'Please wait while we process your file...'
                : 'or click to select CSV, Excel, JSON, or Parquet files'}
            </p>
            <p className="text-gray-500 text-sm">Maximum file size: 50MB</p>
          </div>

          {uploading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="h-6 w-6 text-blue-500" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Recently Uploaded File Preview */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">{uploadedFile.filename}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Rows</p>
                    <p className="text-blue-400 font-semibold">{uploadedFile.rows.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Columns</p>
                    <p className="text-blue-400 font-semibold">{uploadedFile.columns}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-green-400 font-semibold">{uploadedFile.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="text-gray-300 font-semibold">
                      {new Date(uploadedFile.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {uploadedFile.column_names && uploadedFile.column_names.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-2">COLUMNS</p>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFile.column_names.map((col) => (
                        <span
                          key={col}
                          className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Datasets List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Datasets ({datasets.length})</h2>

        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center"
          >
            <Loader className="h-8 w-8 text-blue-500" />
          </motion.div>
        ) : datasets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-[#162032] rounded-2xl border border-gray-800"
          >
            <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No datasets yet. Upload your first dataset above!</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {datasets.map((dataset) => (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#162032] border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{dataset.filename}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span>Uploaded: {new Date(dataset.upload_date).toLocaleDateString()}</span>
                      <span className={`font-medium ${
                        dataset.status === 'Uploaded'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}>
                        {dataset.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        toast.loading('Downloading...');
                        // Download functionality can be added here
                        toast.dismiss();
                        toast.success('Download ready!');
                      }}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                      title="Download dataset"
                    >
                      <Download className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteDataset(dataset.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      title="Delete dataset"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
