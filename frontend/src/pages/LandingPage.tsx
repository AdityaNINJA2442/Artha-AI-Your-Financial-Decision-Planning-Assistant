import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const LandingPage: React.FC = () => {
  // Interactive Loans Calculator Preview State
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureYears, setTenureYears] = useState(5);

  // EMI Math
  const tenureMonths = tenureYears * 12;
  const monthlyRate = interestRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
  const totalRepayment = emi * tenureMonths;
  const totalInterest = totalRepayment - loanAmount;

  // Interactive FutureView Savings Slider State
  const [extraSavings, setExtraSavings] = useState(10000);
  const baseMonthlySavings = 30000;
  const totalMonthlySavings = baseMonthlySavings + extraSavings;

  const futureChartData = useMemo(() => {
    const r = 0.10;
    const baseOpt = 500000 + extraSavings * 10;
    return [
      { year: '2026', current: 380000, optimized: baseOpt },
      { year: '2027', current: 780000, optimized: Math.round(baseOpt * 2.2) },
      { year: '2028', current: 1240000, optimized: Math.round(baseOpt * 3.8) },
      { year: '2030', current: 2400000, optimized: Math.round(baseOpt * 7.5) },
      { year: '2035', current: 6500000, optimized: Math.round(baseOpt * 24.5) },
    ];
  }, [extraSavings]);

  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', padding: '80px 24px 100px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Deep Crimson Ambient Glow */}
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(101, 0, 0, 0.35) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(70px)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column: Headlines */}
          <div>
            <div className="badge-gold" style={{ marginBottom: '20px' }}>
              <Sparkles size={14} /> AI-Powered Financial Operating System
            </div>
            
            <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', color: 'var(--text-cream)' }}>
              Your money.<br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96A 0%, #D8B878 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                In motion.
              </span>
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '36px', maxWidth: '500px' }}>
              Artha turns everyday financial decisions into a clear path towards your goals. Track, simulate, and plan with AI.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/register" className="btn-gold" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Start Your Journey <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Explore Artha
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Interactive Dashboard Hero Mockup */}
          <div className="fintech-card-elevated animate-float" style={{ padding: '28px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Month Overview</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '2px' }}>₹1,00,000</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', marginTop: '2px' }}>↑ 8% vs last month</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="badge-gold">
                  <ShieldCheck size={14} /> Score: 82/100
                </div>
              </div>
            </div>

            {/* Money Flow Mini Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#1B1B1B', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Needs (52%)</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-cream)', marginTop: '4px' }}>₹52,400</div>
              </div>
              <div style={{ background: '#1B1B1B', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wants (20%)</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-cream)', marginTop: '4px' }}>₹19,600</div>
              </div>
              <div style={{ background: '#1B1B1B', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Future (28%)</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '4px' }}>₹28,000</div>
              </div>
            </div>

            {/* SVG Flow Preview Lines */}
            <div style={{ height: '80px', position: 'relative', overflow: 'hidden', background: '#0A0A0A', borderRadius: '10px', padding: '12px' }}>
              <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="none">
                <path d="M 10 30 C 80 30, 120 10, 290 10" fill="none" stroke="#F1E8D8" strokeWidth="3" opacity="0.8" />
                <path d="M 10 30 C 80 30, 120 30, 290 30" fill="none" stroke="#C9A96A" strokeWidth="3" opacity="0.9" />
                <path d="M 10 30 C 80 30, 120 50, 290 50" fill="none" stroke="#B00000" strokeWidth="3" opacity="0.8" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SIGNATURE MONEY FLOW SECTION */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>1. Watch Your Money Move</div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-cream)' }}>Where it goes. What it means.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '8px' }}>Automatic transaction categorization splitting your salary into 50/30/20 flow buckets</p>
          </div>

          <div className="fintech-card" style={{ padding: '36px', position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div style={{ background: '#1B1B1B', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Income Received</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>₹1,00,000</div>
                <div className="badge-gold" style={{ marginTop: '12px' }}>Salary Credit</div>
              </div>

              {/* Flow Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(241, 232, 216, 0.05)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-cream)' }}>Needs (52%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-cream)' }}>₹52,400</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rent, EMI, Utilities, Groceries</div>
                </div>

                <div style={{ background: 'rgba(201, 169, 106, 0.08)', border: '1px solid var(--border-gold)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Wants (20%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹19,600</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dining out, Shopping, Entertainment</div>
                </div>

                <div style={{ background: 'rgba(176, 0, 0, 0.1)', border: '1px solid var(--border-red)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-cream)' }}>Future (28%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹28,000</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SIPs, Investments, Goal Funds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAN I AFFORD THIS DEMONSTRATION */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>2. Can I Afford This?</div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-cream)', marginBottom: '16px' }}>
              Before you buy,<br />know what it changes.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Instant purchase impact analysis showing exact liquid savings drop, emergency runway adjustment, and goal delay before you spend.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={18} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Calculates emergency fund impact in months</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={18} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Evaluates delay on active car/home financial goals</span>
              </div>
            </div>
          </div>

          <div className="fintech-card-elevated" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📱</div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>iPhone 15 Pro</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '2px' }}>₹79,999</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liquid Savings</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>₹2,50,000 → <span style={{ color: 'var(--accent-coral)' }}>₹1,70,001</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Emergency Runway</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>3.2 mos → <span style={{ color: 'var(--accent-amber)' }}>2.1 mos</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Car Goal Target Date</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>Dec 2028 → <span style={{ color: 'var(--accent-coral)' }}>Feb 2029 (+2 mos)</span></span>
              </div>
            </div>

            <div className="badge-coral" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}>
              ⚠️ CAUTION: Purchase is possible, but reduces your emergency buffer below 3 months.
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOANS & EMI CALCULATOR PREVIEW */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>3. Loans & EMI Calculator</div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-cream)' }}>Understand the true cost of borrowing.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
            
            {/* Interactive Inputs */}
            <div className="fintech-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Loan Amount</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input type="range" min="100000" max="5000000" step="50000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Interest Rate (% p.a.)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-cream)' }}>{interestRate}%</span>
                  </div>
                  <input type="range" min="7.0" max="18.0" step="0.25" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tenure (Years)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-cream)' }}>{tenureYears} Years</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
                </div>
              </div>
            </div>

            {/* Calculated EMI Display */}
            <div className="fintech-card-elevated" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Estimated EMI</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
                  ₹{emi.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                  <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Principal Amount</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>₹{loanAmount.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Interest</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-coral)', marginTop: '2px' }}>₹{totalInterest.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <Link to="/loans" className="btn-gold" style={{ marginTop: '24px', justifyContent: 'center' }}>
                Open Full Loan Suite & Stress Test <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FUTUREVIEW DIGITAL TWIN */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>4. FutureView Digital Twin</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-cream)' }}>Your future isn't fixed.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '8px' }}>See how minor adjustments today transform your 10-year financial trajectory</p>
        </div>

        <div className="fintech-card-elevated" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Savings SIP</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                ₹{totalMonthlySavings.toLocaleString('en-IN')} / month
              </div>
            </div>
            <div style={{ width: '280px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Add Extra Savings (+₹{extraSavings.toLocaleString('en-IN')})</div>
              <input type="range" min="0" max="30000" step="2500" value={extraSavings} onChange={e => setExtraSavings(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={futureChartData}>
                <defs>
                  <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C9A96A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#686868" />
                <YAxis stroke="#686868" tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: '#101010', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="optimized" stroke="#C9A96A" strokeWidth={3} fillOpacity={1} fill="url(#optGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
            *Illustrative projection assuming 10% annual compounded returns — not guaranteed returns.
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 24px', background: 'var(--bg-surface-secondary)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-cream)' }}>ARTHA AI</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Understand Your Money. Build Your Future.</div>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ARTHA AI • Built by <strong style={{ color: 'var(--accent-gold)' }}>Hackjack</strong>
          </div>
        </div>
      </footer>

    </div>
  );
};
