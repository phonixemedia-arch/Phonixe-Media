import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin({ navigateTo }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('phonixe@2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigateTo('admin-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid Login ID or Password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="ambient-glow glow-top" aria-hidden="true"></div>
      <div className="ambient-glow glow-bottom" aria-hidden="true"></div>

      <div className="admin-login-card glass-card">
        <img src="/assets/logo-horizontal.png" alt="Phonixe Media" className="admin-login-logo" style={{ maxHeight: '48px', width: 'auto', margin: '0 auto 20px', objectFit: 'contain' }} />
        <h2>Phonixe Media Admin</h2>
        <p>Sign in to manage agency content, edit services, and view client leads.</p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div className="form-group">
            <label>Login ID / Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-gold w-full btn-large" style={{ marginTop: '10px' }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In To Dashboard →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span>Default: <code>admin</code> / <code>phonixe@2026</code></span>
          <button 
            style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}
            onClick={() => navigateTo('landing')}
          >
            &larr; Back to Site
          </button>
        </div>
      </div>
    </div>
  );
}
