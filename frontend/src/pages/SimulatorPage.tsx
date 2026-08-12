import React, { useState, useEffect, useMemo } from 'react';
import { Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const SimulatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'affordability' | 'futureview' | 'shock'>('affordability');

  // Controlled Local Form State - Can I Afford This?
  const [purchaseName, setPurchaseName] = useState('iPhone 15 Pro');
  const [price, setPrice] = useState(79999);
  const [userSavings, setUserSavings] = useState(250000);
  const [fixedExp, setFixedExp] = useState(40000);

  // FutureView State
  const [extraMonthlySIP, setExtraMonthlySIP] = useState(10000);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('artha_token') || '';
        const res = await fetch('/api/v1/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const prof = await res.json();
          if (prof) {
            setUserSavings(prof.current_savings || 250000);
            setFixedExp(prof.monthly_fixed_expenses || 40000);
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchProfile();
  }, []);

  // Compute FutureView projection curve dynamically from extraMonthlySIP
  const futureChartData = useMemo(() => {
    const baseMonthlySavings = 30000;
    const totalSIP = baseMonthlySavings + extraMonthlySIP;
    const r = 0.10; // 10% assumed annual growth

    let yr2026Current = userSavings + baseMonthlySavings * 12;
    let yr2026Opt = userSavings + totalSIP * 12;

    let yr2027Current = yr2026Current * (1 + r) + baseMonthlySavings * 12;
    let yr2027Opt = yr2026Opt * (1 + r) + totalSIP * 12;

    let yr2028Current = yr2027Current * (1 + r) + baseMonthlySavings * 12;
    let yr2028Opt = yr2027Opt * (1 + r) + totalSIP * 12;

    let yr2030Current = yr2028Current * Math.pow(1 + r, 2) + baseMonthlySavings * 24;
    let yr2030Opt = yr2028Opt * Math.pow(1 + r, 2) + totalSIP * 24;

    let yr2035Current = yr2030Current * Math.pow(1 + r, 5) + baseMonthlySavings * 60;
    let yr2035Opt = yr2030Opt * Math.pow(1 + r, 5) + totalSIP * 60;

    return [
      { year: '2026', current: Math.round(yr2026Current), optimized: Math.round(yr2026Opt) },
      { year: '2027', current: Math.round(yr2027Current), optimized: Math.round(yr2027Opt) },
      { year: '2028', current: Math.round(yr2028Current), optimized: Math.round(yr2028Opt) },
      { year: '2030', current: Math.round(yr2030Current), optimized: Math.round(yr2030Opt) },
      { year: '2035', current: Math.round(yr2035Current), optimized: Math.round(yr2035Opt) },
    ];
  }, [extraMonthlySIP, userSavings]);

  const remainingSavings = Math.max(0, userSavings - price);
  const runwayMonths = fixedExp > 0 ? (remainingSavings / fixedExp).toFixed(1) : '6.0';
  const isRisky = price > userSavings * 0.5;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>Financial Decision Engine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Simulate purchase impact, 10-year net worth trajectory, and emergency shock resilience</p>
        </div>
        <div className="badge-gold" style={{ fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> PostgreSQL Decision History
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('affordability')}
          className={activeTab === 'affordability' ? 'btn-gold' : 'btn-secondary'}
        >
          <Zap size={16} /> Can I Afford This?
        </button>
        <button
          onClick={() => setActiveTab('futureview')}
          className={activeTab === 'futureview' ? 'btn-gold' : 'btn-secondary'}
        >
          <TrendingUp size={16} /> FutureView Digital Twin
        </button>
        <button
          onClick={() => setActiveTab('shock')}
          className={activeTab === 'shock' ? 'btn-gold' : 'btn-secondary'}
        >
          <ShieldCheck size={16} /> Financial Shock Test
        </button>
      </div>

      {/* TAB 1: CAN I AFFORD THIS? */}
      {activeTab === 'affordability' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          <div className="fintech-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '20px' }}>Simulate Purchase Impact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Item Name</label>
                <input
                  type="text"
                  className="fintech-input"
                  value={purchaseName}
                  onChange={e => setPurchaseName(e.target.value)}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Price (₹)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{price.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#C9A96A' }}
                />
              </div>
            </div>
          </div>

          <div className="fintech-card-elevated" style={{ padding: '28px', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-cream)' }}>{purchaseName}</div>
              <span className={isRisky ? "badge-coral" : "badge-gold"}>
                {isRisky ? "HIGH RISK" : "COMFORTABLE"}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liquid Savings</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>₹{userSavings.toLocaleString('en-IN')} → <span style={{ color: isRisky ? 'var(--accent-coral)' : 'var(--accent-gold)' }}>₹{remainingSavings.toLocaleString('en-IN')}</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Emergency Runway</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>{(userSavings / fixedExp).toFixed(1)} mos → <span style={{ color: 'var(--accent-amber)' }}>{runwayMonths} mos</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary Goal Target Date</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>Dec 2028 → <span style={{ color: isRisky ? 'var(--accent-coral)' : '#FFF' }}>{isRisky ? 'Feb 2029 (+2 mos)' : 'Dec 2028 (On Track)'}</span></span>
              </div>
            </div>

            <div className={isRisky ? "badge-coral" : "badge-gold"} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.85rem' }}>
              {isRisky ? "⚠️ Purchase exceeds 50% of liquid savings. High risk." : "✅ Purchase is well within your safe liquid savings ratio."}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUTUREVIEW */}
      {activeTab === 'futureview' && (
        <div className="fintech-card-elevated" style={{ padding: '28px', border: '1px solid var(--border-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Savings SIP</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                ₹{(30000 + extraMonthlySIP).toLocaleString('en-IN')} / month
              </div>
            </div>
            <div style={{ width: '300px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Add Extra Savings (+₹{extraMonthlySIP.toLocaleString('en-IN')}/mo)</div>
              <input
                type="range"
                min="0"
                max="30000"
                step="2500"
                value={extraMonthlySIP}
                onChange={e => setExtraMonthlySIP(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#C9A96A' }}
              />
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={futureChartData}>
                <defs>
                  <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C9A96A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#686868" />
                <YAxis stroke="#686868" tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: '#101010', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="optimized" stroke="#C9A96A" strokeWidth={3} fillOpacity={1} fill="url(#futureGrad)" name="Optimized Net Worth" />
                <Area type="monotone" dataKey="current" stroke="#F1E8D8" strokeWidth={2} fillOpacity={0} name="Baseline Net Worth" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: SHOCK TEST */}
      {activeTab === 'shock' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {[
            { id: '1_month_no_income', title: '1 Month Without Income', runway: `${(userSavings / fixedExp).toFixed(1)} mos`, status: 'Safe', color: 'gold' },
            { id: '3_months_no_income', title: '3 Months Without Income', runway: `${(userSavings / (fixedExp * 1.1)).toFixed(1)} mos`, status: 'Caution', color: 'amber' },
            { id: '6_months_no_income', title: '6 Months Without Income', runway: `${(userSavings / (fixedExp * 1.3)).toFixed(1)} mos`, status: 'High Risk', color: 'coral' }
          ].map(s => (
            <div key={s.id} className="fintech-card" style={{ padding: '24px' }}>
              <span className={`badge-${s.color}`} style={{ marginBottom: '12px' }}>{s.status}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '12px' }}>{s.title}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Surviving Runway:</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>{s.runway}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
