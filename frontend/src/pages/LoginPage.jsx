import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        // Use email as username based on our plan
        const resp = await loginUser({ username: email, password, role: 'admin' });
        localStorage.setItem('token', resp.access_token);
        navigate('/admin');
      } else {
        // Mock registration failure/message for now, keep focus on login
        setErrorMsg('Registration UI not fully hooked up to backend yet.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>{isLogin ? 'Login to ChurnAI' : 'Create an Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && (
          <input type="text" placeholder="Full Name" style={inputStyle} required />
        )}
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
        
        {errorMsg && <div style={{color: '#f87171', fontSize: '0.9rem'}}>{errorMsg}</div>}

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
