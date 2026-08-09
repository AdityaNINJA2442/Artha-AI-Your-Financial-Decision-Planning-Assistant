import React, { useState } from 'react';
import { Sliders, Zap, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const SimulatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'affordability' | 'futureview' | 'shock'>('affordability');

  // Can I Afford This State
  const [purchaseName, setPurchaseName] = useState('iPhone 15 Pro');
  const [price, setPrice] = useState(79999);

  // Shock Test State
  const [shockScenario, setShockScenario] = useState('3_months_no_income');

  // FutureView State
  const [extraMonthlySIP, setExtraMonthlySIP] = useState(10000);

  const futureChartData = [
    { year: '2026', current: 380000, optimized: 500000 },
    { year: '2027', current: 780000, optimized: 1120000 },
    { year: '2028', current: 1240000, optimized: 1890000 },
    { year: '2030', current: 2400000, optimized: 3850000 },
    { year: '2035', current: 6500000, optimized: 12450000 },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Financial Decision Engine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Simulate purchase impact, 10-year net worth trajectory, and emergency shock resilience</p>
        </div>
        <div className="badge-indigo" style={{ fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> PostgreSQL Decision History
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('affordability')}
          className={activeTab === 'affordability' ? 'btn-indigo' : 'btn-secondary'}
        >
          <Zap size={16} /> Can I Afford This?
        </button>
        <button
          onClick={() => setActiveTab('futureview')}
          className={activeTab === 'futureview' ? 'btn-indigo' : 'btn-secondary'}
        >
          <TrendingUp size={16} /> FutureView Digital Twin
        </button>
        <button
          onClick={() => setActiveTab('shock')}
          className={activeTab === 'shock' ? 'btn-indigo' : 'btn-secondary'}
        >
          <ShieldCheck size={16} /> Financial Shock Test
        </button>
      </div>

      {/* TAB 1: CAN I AFFORD THIS? */}
      {activeTab === 'affordability' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          <div className="fintech-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', marginBottom: '20px' }}>Simulate Purchase Impact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Item Name</label>
                <input type="text" className="fintech-input" value={purchaseName} onChange={e => setPurchaseName(e.target.value)} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Price (₹)</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-indigo)' }}>₹{price.toLocaleString('en-IN')}</span>
                </div>
                <input type="range" min="10000" max="500000" step="5000" value={price} onChange={e => setPrice(Number(e.target.value))} style={{ width: '100%', accentColor: '#4169E1' }} />
              </div>
            </div>
          </div>

          <div className="fintech-card-elevated" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>{purchaseName}</div>
              <span className="badge-amber">CAUTION</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liquid Savings</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>₹2,50,000 → <span style={{ color: 'var(--accent-coral)' }}>₹{(250000 - price).toLocaleString('en-IN')}</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Emergency Runway</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>3.2 mos → <span style={{ color: 'var(--accent-amber)' }}>{((80000 - Math.max(0, price - 170000)) / 40000).toFixed(1)} mos</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Car Goal Target Date</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>Dec 2028 → <span style={{ color: 'var(--accent-coral)' }}>Feb 2029 (+2 mos)</span></span>
              </div>
            </div>

            <div className="badge-amber" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.85rem' }}>
              ⚠️ Purchase is possible, but reduces your emergency buffer below 3 months.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUTUREVIEW */}
      {activeTab === 'futureview' && (
        <div className="fintech-card-elevated" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Savings SIP</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                ₹{(30000 + extraMonthlySIP).toLocaleString('en-IN')} / month
              </div>
            </div>
            <div style={{ width: '280px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Add Extra Savings (+₹{extraMonthlySIP.toLocaleString('en-IN')})</div>
              <input type="range" min="0" max="30000" step="2500" value={extraMonthlySIP} onChange={e => setExtraMonthlySIP(Number(e.target.value))} style={{ width: '100%', accentColor: '#D7B56D' }} />
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={futureChartData}>
                <defs>
                  <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D7B56D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D7B56D" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#667085" />
                <YAxis stroke="#667085" tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: '#0E1628', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="optimized" stroke="#D7B56D" strokeWidth={3} fillOpacity={1} fill="url(#futureGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: SHOCK TEST */}
      {activeTab === 'shock' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {[
            { id: '1_month_no_income', title: '1 Month Without Income', runway: '6.2 mos', status: 'Safe', color: 'teal' },
            { id: '3_months_no_income', title: '3 Months Without Income', runway: '3.2 mos', status: 'Caution', color: 'amber' },
            { id: '6_months_no_income', title: '6 Months Without Income', runway: '1.4 mos', status: 'High Risk', color: 'coral' }
          ].map(s => (
            <div key={s.id} className="fintech-card" style={{ padding: '24px' }}>
              <span className={`badge-${s.color}`} style={{ marginBottom: '12px' }}>{s.status}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '12px' }}>{s.title}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Surviving Runway:</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>{s.runway}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
