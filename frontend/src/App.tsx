import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPages';

// Code Splitting & Lazy-Loaded Route Components for Optimized Production Performance
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(module => ({ default: module.TransactionsPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then(module => ({ default: module.GoalsPage })));
const LoansPage = lazy(() => import('./pages/LoansPage').then(module => ({ default: module.LoansPage })));
const DecisionsPage = lazy(() => import('./pages/DecisionsPage').then(module => ({ default: module.DecisionsPage })));
const SimulatorPage = lazy(() => import('./pages/SimulatorPage').then(module => ({ default: module.SimulatorPage })));
const CoachPage = lazy(() => import('./pages/CoachPage').then(module => ({ default: module.CoachPage })));

export function App() {
  const [user, setUser] = useState<any>({
    name: 'Aditya Prakash',
    email: 'aditya@artha.ai'
  });

  const handleLogout = () => {
    localStorage.removeItem('artha_token');
    setUser(null);
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ flex: 1 }}>
          <Suspense fallback={
            <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--primary-indigo)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Artha Financial System...</div>
            </div>
          }>
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
          </Suspense>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
