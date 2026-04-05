import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <header className="glass-header">
          <h1><Link to="/" style={{color:'inherit',textDecoration:'none'}}>ChurnAI Predictor</Link></h1>
          <nav>
            <Link to="/admin">Admin</Link>
            <Link to="/user">Agent Portal</Link>
            <Link to="/login" className="btn-primary">Login</Link>
          </nav>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={
              <div className="hero">
                <h2>AI-Powered Customer Retention</h2>
                <p>Upload data, train models, and get intelligent retention strategies.</p>
                <div className="card-grid">
                  <div className="glass-card">
                    <h3>Dataset Processing</h3>
                    <p>Clean and normalize your data instantly.</p>
                  </div>
                  <div className="glass-card">
                    <h3>Automated ML</h3>
                    <p>Train LightGBM and XGBoost seamlessly.</p>
                  </div>
                  <div className="glass-card">
                    <h3>Retention Strategies</h3>
                    <p>Rule-based insights for at-risk customers.</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
