import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Auth Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';

// Protected Pages
import Dashboard from './pages/Dashboard.jsx';
import Predict from './pages/Predict.jsx';

// Placeholder pages (to be built)
import DatasetManagement from './pages/DatasetManagement.jsx';
import RetentionStrategies from './pages/RetentionStrategies.jsx';
import ModelManagement from './pages/ModelManagement.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Predict />} />
        </Route>

        <Route
          path="/datasets"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DatasetManagement />} />
        </Route>

        <Route
          path="/strategies"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RetentionStrategies />} />
        </Route>

        <Route
          path="/model"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ModelManagement />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
