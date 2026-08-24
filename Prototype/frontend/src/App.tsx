import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { StartupDashboard } from './pages/StartupDashboard';
import { ExpertDashboard } from './pages/ExpertDashboard';
import { CreateChallenge } from './pages/CreateChallenge';
import { ChallengeDetails } from './pages/ChallengeDetails';
import { ApplicationDetails } from './pages/ApplicationDetails';
import { AIDiscovery } from './pages/AIDiscovery';
import { StartupProfileDetail } from './pages/StartupProfileDetail';
import { PilotDashboard } from './pages/PilotDashboard';
import { TemplateLibrary } from './pages/TemplateLibrary';
import { AuditLogPage } from './pages/AuditLogPage';
import { SystemAnalytics } from './pages/SystemAnalytics';
import { Role, User, Notification } from './types';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (token) {
      // Decode user from localStorage info or fetch from session (mocking decoding JWT for prototype ease)
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        setCurrentUser(JSON.parse(cachedUser));
      }
    }
  }, [token]);

  useEffect(() => {
    if (token && currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
      return () => clearInterval(interval);
    }
  }, [token, currentUser]);

  const fetchNotifications = () => {
    fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(err => console.error(err));
  };

  const handleLoginSuccess = (newToken: string, user: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
  };

  const handleRoleSwitch = (newRole: Role) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: newRole };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to render the dashboard matching the user role
  const renderDashboard = () => {
    if (!currentUser) return <Navigate to="/login" />;
    switch (currentUser.role) {
      case 'GOVERNMENT':
      case 'ADMIN':
        return <GovernmentDashboard />;
      case 'STARTUP':
        return <StartupDashboard />;
      case 'EXPERT':
        return <ExpertDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <div className="bg-slate-50 min-h-screen">
        <Navbar
          user={currentUser}
          onRoleSwitch={handleRoleSwitch}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route
              path="/login"
              element={token ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
            />

            <Route
              path="/dashboard"
              element={token ? renderDashboard() : <Navigate to="/login" />}
            />

            <Route
              path="/challenges/create"
              element={
                token && (currentUser?.role === 'GOVERNMENT' || currentUser?.role === 'ADMIN') ? (
                  <CreateChallenge />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/challenges/:id"
              element={<ChallengeDetails userRole={currentUser?.role || null} />}
            />

            <Route
              path="/applications/:id"
              element={token ? <ApplicationDetails userRole={currentUser?.role || null} /> : <Navigate to="/login" />}
            />

            <Route
              path="/discovery/:challengeId"
              element={
                token && (currentUser?.role === 'GOVERNMENT' || currentUser?.role === 'ADMIN') ? (
                  <AIDiscovery />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/startups/:id"
              element={<StartupProfileDetail />}
            />

            <Route
              path="/pilots/:id"
              element={<PilotDashboard userRole={currentUser?.role || null} />}
            />

            <Route
              path="/templates"
              element={<TemplateLibrary />}
            />

            <Route
              path="/audit-logs"
              element={
                token && (currentUser?.role === 'GOVERNMENT' || currentUser?.role === 'ADMIN') ? (
                  <AuditLogPage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/analytics"
              element={
                token && (currentUser?.role === 'GOVERNMENT' || currentUser?.role === 'ADMIN') ? (
                  <SystemAnalytics />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
