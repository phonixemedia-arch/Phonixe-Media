import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin({ navigateTo }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState(false);

  // Brute-force lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    // Check if the user was redirected here due to auto-logout
    const reason = localStorage.getItem('phonixe_logout_reason');
    if (reason === 'inactivity') {
      setInactivityNotice(true);
      localStorage.removeItem('phonixe_logout_reason');
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      setFailedAttempts(0);
      navigateTo('admin-dashboard');
    } catch (err) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 5) {
        setLockoutRemaining(60);
        setError('Too many failed login attempts. Access is locked for 60 seconds for security.');
      } else {
        const remaining = 5 - nextFailures;
        setError(
          (err.message || 'Invalid Login ID or Password') + 
          (remaining <= 2 ? ` (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout)` : '')
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="ambient-glow glow-top" aria-hidden="true"></div>
      <div className="ambient-glow glow-bottom" aria-hidden="true"></div>

      <div className="admin-login-card glass-card">
        <img 
          src="/assets/logo-horizontal.png" 
          alt="Phonixe Media" 
          className="admin-login-logo" 
          style={{ maxHeight: '48px', width: 'auto', margin: '0 auto 20px', objectFit: 'contain' }} 
        />
        <h2>Phonixe Media Admin</h2>
        <p>Sign in to manage agency content, edit services, and view client leads.</p>

        {inactivityNotice && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#FDE68A',
            padding: '12px 14px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.86rem',
            lineHeight: 1.45,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⏱️</span>
            <div>
              <strong>Session Expired</strong>
              <div style={{ marginTop: '2px', opacity: 0.9 }}>
                You were automatically signed out after 15 minutes of inactivity for account security.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            color: '#FCA5A5', 
            padding: '10px 14px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            fontSize: '0.88rem',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {lockoutRemaining > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.86rem',
            fontWeight: 700
          }}>
            🔒 Security Lockout Active: {lockoutRemaining}s remaining
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div className="form-group">
            <label>Login ID / Username</label>
            <input 
              type="text" 
              required
              autoComplete="username"
              disabled={lockoutRemaining > 0}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrap">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                autoComplete="current-password"
                disabled={lockoutRemaining > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-gold w-full btn-large" 
            style={{ marginTop: '10px' }} 
            disabled={submitting || lockoutRemaining > 0}
          >
            {lockoutRemaining > 0 
              ? `Locked (${lockoutRemaining}s)` 
              : submitting 
                ? 'Authenticating...' 
                : 'Sign In To Dashboard →'}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(255,255,255,0.08)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '12px',
          fontSize: '0.85rem' 
        }}>
          <button 
            type="button"
            style={{ color: 'var(--gold-light)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigateTo('landing')}
          >
            &larr; Back to Live Site
          </button>

          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒</span> 256-Bit SSL Encrypted Admin Portal • Phonixe Media Security
          </span>
        </div>
      </div>
    </div>
  );
}
