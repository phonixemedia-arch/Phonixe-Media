import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  
  // Detect route from window location
  const getInitialRoute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes('/admin/dashboard') || hash === '#/admin/dashboard' || hash === '#/admin') {
      return 'admin-dashboard';
    }
    if (path.includes('/admin') || hash === '#/admin/login') {
      return 'admin-login';
    }
    return 'landing';
  };

  const [route, setRoute] = useState(getInitialRoute);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getInitialRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigateTo = (newRoute) => {
    setRoute(newRoute);
    if (newRoute === 'admin-dashboard') {
      window.location.hash = '#/admin/dashboard';
    } else if (newRoute === 'admin-login') {
      window.location.hash = '#/admin/login';
    } else {
      window.location.hash = '';
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0C0D11', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E5A93C' }}>
        Loading Phonixe Media...
      </div>
    );
  }

  if (route === 'admin-dashboard') {
    if (!isAuthenticated) {
      return <AdminLogin navigateTo={navigateTo} />;
    }
    return <AdminDashboard navigateTo={navigateTo} />;
  }

  if (route === 'admin-login') {
    if (isAuthenticated) {
      return <AdminDashboard navigateTo={navigateTo} />;
    }
    return <AdminLogin navigateTo={navigateTo} />;
  }

  return <LandingPage navigateTo={navigateTo} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
