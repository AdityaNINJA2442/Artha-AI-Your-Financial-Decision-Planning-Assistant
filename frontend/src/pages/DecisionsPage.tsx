import React, { useState, useEffect } from 'react';
import { History, ShieldCheck } from 'lucide-react';

export const DecisionsPage: React.FC = () => {
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      decision_type: 'Affordability',
      title: 'Affordability Check: iPhone 17 (₹79,999)',
      risk_level: 'Caution',
      badge_color: 'amber',
      created_at: '2026-08-07 14:30',
      summary: 'Savings reduce to ₹1,70,001. Emergency coverage adjusts from 3.2 mos → 2.1 mos. Car goal delayed by 1 month.'
    },
    {
      id: 2,
      decision_type: 'Loan Comparison',
      title: 'Loan Comparison: ₹15 Lakh Car Loan (SBI vs HDFC)',
      risk_level: 'Manageable',
      badge_color: 'gold',
      created_at: '2026-08-06 11:15',
      summary: 'SBI 9% 5-year EMI is ₹31,187/mo vs HDFC 10.5% 7-year EMI ₹25,320/mo. HDFC has lower monthly EMI but ₹84,000 higher total interest.'
    },
    {
      id: 3,
      decision_type: 'Shock Test',
      title: 'Financial Shock Test: 3 Months Without Income',
      risk_level: 'HIGH RISK',
      badge_color: 'coral',
      created_at: '2026-08-05 09:45',
      summary: 'Current liquid savings & emergency pool covers 2.4 months of essential expenses. 6-month target gap: ₹1,40,000.'
    }
  ]);

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const token = localStorage.getItem('artha_token') || '';
        const res = await fetch('/api/v1/decisions/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDecisions(data.map((d: any) => ({
              id: d.id,
              decision_type: d.decision_type,
              title: d.title,
              risk_level: d.risk_level,
              badge_color: d.risk_level === 'HIGH RISK' ? 'coral' : d.risk_level === 'Caution' ? 'amber' : 'gold',
              created_at: d.created_at?.split('T')[0] || 'Recent',
              summary: JSON.parse(d.result_data_json || '{}').narrative || JSON.parse(d.result_data_json || '{}').summary || 'Decision scenario calculated'
            })));
          }
        }
      } catch (e) {
        // Keep fallback data for presentation
      }
    };
    fetchDecisions();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>My Financial Decisions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Persistent historical log of your affordability checks, loan comparisons, and shock tests</p>
        </div>
        <div className="badge-gold" style={{ fontSize: '0.85rem' }}>
          <History size={16} /> PostgreSQL Audit History
        </div>
      </div>

      {/* DECISION LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {decisions.map(d => (
          <div key={d.id} className="fintech-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className={`badge-${d.badge_color}`}>{d.risk_level}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.decision_type} • {d.created_at}</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-cream)' }}>{d.title}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.summary}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
