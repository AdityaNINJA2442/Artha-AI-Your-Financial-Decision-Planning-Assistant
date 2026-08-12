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
      background: 'rgba(5, 5, 5, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: -4, background: 'radial-gradient(circle, rgba(176,0,0,0.35) 0%, transparent 70%)', filter: 'blur(6px)' }} />
          <img src="/logo.png" alt="Artha AI Logo" style={{ height: '36px', width: 'auto', borderRadius: '8px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-cream)', letterSpacing: '-0.02em' }}>
          Artha <span style={{ background: 'linear-gradient(135deg, #C9A96A 0%, #D8B878 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </span>
      </Link>

      {/* Nav Links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
            { path: '/transactions', label: 'Transactions', icon: Wallet },
            { path: '/loans', label: 'Loans & EMI', icon: CreditCard },
            { path: '/goals', label: 'Goals', icon: Target },
            { path: '/decisions', label: 'Decisions', icon: ShieldCheck },
            { path: '/simulator', label: 'What-If', icon: Sliders },
            { path: '/coach', label: 'AI Coach', icon: MessageSquare },
          ].map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                color: active ? '#C9A96A' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                padding: '8px 12px',
                borderRadius: '6px',
                background: active ? 'rgba(201, 169, 106, 0.08)' : 'transparent',
                borderBottom: active ? '2px solid #B00000' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}>
                <IconComponent size={15} color={active ? '#C9A96A' : 'var(--text-secondary)'} /> {item.label}
              </Link>
            );
          })}
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
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)'
            }}>
              <User size={14} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-cream)' }}>
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
            <Link to="/register" className="btn-gold" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem' }}>
              Start Free Trial
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
