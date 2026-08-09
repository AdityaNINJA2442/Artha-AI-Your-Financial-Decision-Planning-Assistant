import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, Target, MessageSquare, Sliders, ShieldCheck, LogOut, User, CreditCard } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <img src="/logo.png" alt="Artha AI Logo" style={{ height: '36px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }} />
        <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#FFF', letterSpacing: '-0.02em' }}>
          Artha <span style={{ background: 'linear-gradient(135deg, #4169E1 0%, #D7B56D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </span>
      </Link>

      {/* Nav Links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/dashboard" style={{
            color: isActive('/dashboard') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/dashboard') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <TrendingUp size={16} /> Dashboard
          </Link>
          <Link to="/transactions" style={{
            color: isActive('/transactions') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/transactions') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Wallet size={16} /> Transactions
          </Link>
          <Link to="/loans" style={{
            color: isActive('/loans') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/loans') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CreditCard size={16} /> Loans & EMI
          </Link>
          <Link to="/goals" style={{
            color: isActive('/goals') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/goals') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Target size={16} /> Goals
          </Link>
          <Link to="/decisions" style={{
            color: isActive('/decisions') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/decisions') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={16} /> Decisions
          </Link>
          <Link to="/simulator" style={{
            color: isActive('/simulator') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/simulator') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sliders size={16} /> What-If
          </Link>
          <Link to="/coach" style={{
            color: isActive('/coach') ? 'var(--primary-emerald)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: isActive('/coach') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <MessageSquare size={16} /> AI Coach
          </Link>
        </div>
      )}

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)'
            }}>
              <User size={14} color="var(--primary-emerald)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user.name}
              </span>
            </div>
            <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem' }}>
              Start Free Trial
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
