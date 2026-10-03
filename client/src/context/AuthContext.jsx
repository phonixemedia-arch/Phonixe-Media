import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// 15 Minutes Idle Timeout for Bank-Grade Admin Security
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_THRESHOLD_SEC = 90; // Show warning modal when 90s remain

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('phonixe_admin_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('phonixe_admin_token'));
  const [secondsRemaining, setSecondsRemaining] = useState(INACTIVITY_TIMEOUT_MS / 1000);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const lastThrottleRef = useRef(0);

  // Extend session / reset activity timer
  const extendSession = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem('phonixe_admin_last_active', String(now));
    setShowInactivityWarning(false);
    setSecondsRemaining(Math.floor(INACTIVITY_TIMEOUT_MS / 1000));
  }, []);

  // Logout with optional reason (e.g. 'inactivity' or 'manual')
  const logout = useCallback((reason = 'manual') => {
    localStorage.removeItem('phonixe_admin_token');
    localStorage.removeItem('phonixe_admin_last_active');
    if (reason === 'inactivity') {
      localStorage.setItem('phonixe_logout_reason', 'inactivity');
    } else {
      localStorage.removeItem('phonixe_logout_reason');
    }
    setToken(null);
    setUser(null);
    setShowInactivityWarning(false);
  }, []);

  // Initial user fetch when token exists
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api.getMe();
        setUser(userData);
        // Initialize last active if not present
        const savedLast = localStorage.getItem('phonixe_admin_last_active');
        if (savedLast) {
          lastActivityRef.current = parseInt(savedLast, 10);
        } else {
          lastActivityRef.current = Date.now();
          localStorage.setItem('phonixe_admin_last_active', String(Date.now()));
        }
      } catch (err) {
        console.warn('Auth token expired or invalid:', err.message);
        logout('expired');
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token, logout]);

  // Activity listeners to detect user presence
  useEffect(() => {
    if (!token) return;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle localStorage writes to once every 4 seconds
      if (now - lastThrottleRef.current > 4000) {
        lastThrottleRef.current = now;
        lastActivityRef.current = now;
        localStorage.setItem('phonixe_admin_last_active', String(now));
        setShowInactivityWarning(false);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(ev => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // Periodic check every 1 second
    const intervalId = setInterval(() => {
      const savedLast = parseInt(localStorage.getItem('phonixe_admin_last_active') || String(lastActivityRef.current), 10);
      const elapsed = Date.now() - savedLast;
      const remainingSec = Math.max(0, Math.floor((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));

      setSecondsRemaining(remainingSec);

      if (remainingSec <= 0) {
        console.warn('Session expired due to 15m inactivity.');
        logout('inactivity');
      } else if (remainingSec <= WARNING_THRESHOLD_SEC) {
        setShowInactivityWarning(true);
      } else {
        setShowInactivityWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleUserActivity));
      clearInterval(intervalId);
    };
  }, [token, logout]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    const now = Date.now();
    localStorage.setItem('phonixe_admin_token', data.token);
    localStorage.setItem('phonixe_admin_last_active', String(now));
    localStorage.removeItem('phonixe_logout_reason');
    lastActivityRef.current = now;
    setToken(data.token);
    setUser(data.user);
    setSecondsRemaining(INACTIVITY_TIMEOUT_MS / 1000);
    return data;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        isAuthenticated: !!token, 
        loading, 
        login, 
        logout,
        extendSession,
        secondsRemaining,
        showInactivityWarning
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
