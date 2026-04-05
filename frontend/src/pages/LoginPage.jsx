import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login logic -> redirect to admin
    navigate('/admin');
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>{isLogin ? 'Login to ChurnAI' : 'Create an Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && (
          <input type="text" placeholder="Full Name" style={inputStyle} required />
        )}
        <input type="email" placeholder="Email Address" style={inputStyle} required />
        <input type="password" placeholder="Password" style={inputStyle} required />
        
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
          {isLogin ? 'Sign In' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </span>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--glass-border)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  outline: 'none',
  fontSize: '1rem'
};
