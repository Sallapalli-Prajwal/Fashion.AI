import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from './config';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { trackPageView, analytics } from './utils/analytics';
import './App.css';

// Configure axios defaults
axios.defaults.withCredentials = true;

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${config.API_BASE}/auth/status`, {
        withCredentials: true
      });
      console.log('🔍 Auth status check:', response.data);
      if (response.data.authenticated) {
        setUser(response.data.user);
        console.log('✅ User authenticated:', response.data.user);
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);
  
  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // Re-check auth when URL has auth=success (after OAuth redirect)
  useEffect(() => {
    if (location.search.includes('auth=success')) {
      console.log('🔄 OAuth redirect detected, re-checking auth...');
      setTimeout(() => {
        checkAuth();
      }, 500); // Small delay to ensure session is set
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
      analytics.login(); // Track successful login
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await axios.post(`${config.API_BASE}/auth/logout`);
      analytics.logout(); // Track logout event
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading OutfitVision...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} 
        />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/gallery" 
          element={user ? <Gallery user={user} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/analytics" 
          element={user ? <Analytics user={user} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile user={user} /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

