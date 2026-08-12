import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px', background: 'var(--bg-surface-secondary)', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Artha AI Logo" style={{ height: '28px', width: 'auto', borderRadius: '6px' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-cream)' }}>
            ARTHA AI <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>— Personal Financial Operating System</span>
          </div>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          ARTHA AI • Built by <strong style={{ color: 'var(--accent-gold)' }}>Hackjack</strong>
        </div>
      </div>
    </footer>
  );
};
