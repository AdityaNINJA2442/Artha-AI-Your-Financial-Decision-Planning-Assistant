import React, { useState } from 'react';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const [goals] = useState([
    {
      id: 1,
      name: 'Car Purchase Fund',
      target: 1000000,
      current: 240000,
      monthly: 15000,
      targetDate: '2028-12-31',
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 2,
      name: 'Emergency Fund Rebuild',
      target: 240000,
      current: 80000,
      monthly: 10000,
      targetDate: '2027-06-30',
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 3,
      name: 'Europe Family Vacation',
      target: 350000,
      current: 120000,
      monthly: 8000,
      targetDate: '2027-10-31',
      priority: 'Medium',
      status: 'In Progress'
    }
  ]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Financial Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track target dates, monthly SIP contributions, and purchase delay impacts</p>
        </div>
        <button className="btn-indigo">
          <Plus size={16} /> Create Goal
        </button>
      </div>

      {/* GOALS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {goals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));

          return (
            <div key={g.id} className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-gold">{g.priority} Priority</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target: {g.targetDate}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>{g.name}</h3>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Saved: ₹{g.current.toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-gold)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(5, 9, 20, 0.6)', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Amount</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>₹{g.target.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly SIP</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>₹{g.monthly.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {g.status}</span>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>+ Add Money</button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
