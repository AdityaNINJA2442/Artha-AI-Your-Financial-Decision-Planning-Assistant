import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { GoalsPage } from './pages/GoalsPage';
import { LoansPage } from './pages/LoansPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { CoachPage } from './pages/CoachPage';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateUser = async () => {
      const token = localStorage.getItem('artha_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id,
            email: data.email,
            name: data.profile?.name || data.email.split('@')[0]
          });
        } else {
          localStorage.removeItem('artha_token');
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('artha_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--accent-gold)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Hydrating Artha Session...</div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ flex: 1 }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage mode="login" onAuthSuccess={setUser} />} />
              <Route path="/register" element={<AuthPage mode="register" onAuthSuccess={setUser} />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/decisions" element={<DecisionsPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/coach" element={<CoachPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
