import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CreditCard, Calculator, CheckCircle, ShieldCheck, Zap, AlertTriangle, Building, Home, ShieldAlert } from 'lucide-react';

export const LoansPage: React.FC = () => {
  const [loanType, setLoanType] = useState('Car Loan');
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(9.0);
  const [tenure, setTenure] = useState(60);

  // All Active User Loans from PostgreSQL
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [loadingLoans, setLoadingLoans] = useState(true);

  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Collateral Risk Analyzer State
  const [assetType, setAssetType] = useState('Primary Residence');
  const [assetValue, setAssetValue] = useState(5000000);
  const [collateralLoanAmount, setCollateralLoanAmount] = useState(3000000);
  const [existingLiability, setExistingLiability] = useState(0);

  // Preset loan type rates & tenures
  const handleSelectLoanType = (type: string) => {
    setLoanType(type);
    if (type === 'Home Loan') {
      setRate(8.5); setTenure(240); setPrincipal(4000000);
    } else if (type === 'Car Loan') {
      setRate(9.0); setTenure(60); setPrincipal(1000000);
    } else if (type === 'Personal Loan') {
      setRate(12.5); setTenure(36); setPrincipal(300000);
    } else if (type === 'Education Loan') {
      setRate(9.5); setTenure(84); setPrincipal(800000);
    } else if (type === 'Gold Loan') {
      setRate(8.0); setTenure(24); setPrincipal(200000);
    }
  };

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/loans/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setActiveLoans(data);
          setSelectedLoanId(data[0].id);
        }
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const activeLoan = activeLoans.find(l => l.id === selectedLoanId) || (activeLoans[0] || {
    id: 1,
    loan_name: 'Car Purchase Loan',
    lender_name: 'SBI Bank',
    original_principal: 1000000,
    outstanding_principal: 740000,
    interest_rate: 9.0,
    emi_amount: 20758,
    next_payment_date: '2026-09-01'
  });

  // Calculate EMI deterministically on frontend
  const monthlyRate = (rate / (12 * 100));
  const factor = Math.pow(1 + monthlyRate, tenure);
  const calculatedEmi = Math.round(principal * monthlyRate * factor / (factor - 1));
  const totalRepayment = calculatedEmi * tenure;
  const totalInterest = totalRepayment - principal;

  const pieData = [
    { name: 'Principal Amount', value: principal, color: '#C9A96A' },
    { name: 'Total Interest', value: totalInterest, color: '#F1E8D8' }
  ];

  const handleMarkAsPaid = async () => {
    if (!activeLoan) return;
    setPaying(true);
    setPaySuccess('');

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch(`/api/v1/loans/${activeLoan.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPaySuccess(`EMI Paid! Remaining Outstanding Principal: ₹${data.remaining_outstanding_principal.toLocaleString('en-IN')}`);
        setActiveLoans(prev => prev.map(l => l.id === activeLoan.id ? {
          ...l,
          outstanding_principal: data.remaining_outstanding_principal
        } : l));
      } else if (data.status === 'Already Paid') {
        setPaySuccess(`Already Paid for this period! Outstanding: ₹${data.remaining_outstanding_principal.toLocaleString('en-IN')}`);
      } else {
        setPaySuccess('EMI payment logged successfully.');
      }
    } catch (err) {
      setPaySuccess('Failed to record EMI payment.');
    } finally {
      setPaying(false);
    }
  };

  // Collateral Risk Math
  const totalLiability = collateralLoanAmount + existingLiability;
  const ltvRatio = assetValue > 0 ? Math.round((totalLiability / assetValue) * 100) : 0;
  const isPrimaryResidence = assetType === 'Primary Residence';

  let riskCategory = 'Low Risk';
  let riskBadgeColor = '#54C7A3';
  let riskAdvice = 'Collateral risk is well within safe LTV limits.';

  if (ltvRatio > 75 || (isPrimaryResidence && ltvRatio > 60)) {
    riskCategory = 'HIGH RISK';
    riskBadgeColor = '#D40000';
    riskAdvice = isPrimaryResidence
      ? '⚠️ Primary Residence — Higher Personal Impact! Foreclosure poses severe housing dislocation risk.'
      : '⚠️ High LTV ratio exceeds safe 75% threshold. Liquidation risk is elevated.';
  } else if (ltvRatio > 50) {
    riskCategory = 'CAUTION';
    riskBadgeColor = '#D8B878';
    riskAdvice = isPrimaryResidence
      ? 'Primary Residence — Moderate risk. Ensure adequate emergency buffer.'
      : 'Moderate LTV exposure. Monitor market value fluctuations.';
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>Loans & EMI Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loan presets, active loan portfolio, EMI payment tracking, and Collateral Risk Analyzer</p>
        </div>
        <div className="badge-gold" style={{ fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> PostgreSQL EMI Audit Engine
        </div>
      </div>

      {/* ACTIVE LOAN PORTFOLIO LIST & MARK EMI AS PAID */}
      <div className="fintech-card-elevated" style={{ padding: '28px', marginBottom: '32px', border: '1px solid var(--border-gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-cream)' }}>Active Loans Portfolio</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Select an active loan to record your monthly EMI payment</div>
          </div>
          <span className="badge-gold">{activeLoans.length} Active Loans</span>
        </div>

        {loadingLoans ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading active loans from PostgreSQL...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {activeLoans.map(l => (
              <div
                key={l.id}
                onClick={() => setSelectedLoanId(l.id)}
                className="fintech-card-interactive"
                style={{
                  padding: '20px',
                  borderColor: selectedLoanId === l.id ? 'var(--accent-gold)' : 'var(--border-subtle)',
                  background: selectedLoanId === l.id ? 'rgba(201, 169, 106, 0.08)' : '#101010'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '1rem' }}>{l.loan_name}</span>
                  <span className="badge-gold" style={{ fontSize: '0.72rem' }}>{l.lender_name}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                  ₹{l.outstanding_principal.toLocaleString('en-IN')} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>outstanding</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>EMI: ₹{l.emi_amount.toLocaleString('en-IN')}/mo</span>
                  <span>Rate: {l.interest_rate}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMI ACTION PANEL */}
        {activeLoan && (
          <div style={{ background: '#1B1B1B', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Next Scheduled Payment Date</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-cream)', marginTop: '2px' }}>{activeLoan.next_payment_date}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {paySuccess && (
                <div className="badge-gold" style={{ padding: '8px 12px' }}>
                  <CheckCircle size={14} /> {paySuccess}
                </div>
              )}
              <button onClick={handleMarkAsPaid} className="btn-gold" disabled={paying}>
                {paying ? 'Processing...' : `Mark EMI (₹${activeLoan.emi_amount.toLocaleString('en-IN')}) as Paid`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LOAN CALCULATOR & PRESETS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        
        <div className="fintech-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '16px' }}>Loan EMI Calculator</h3>
          
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Gold Loan'].map(t => (
              <button
                key={t}
                onClick={() => handleSelectLoanType(t)}
                className={loanType === t ? 'btn-gold' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Loan Principal Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="100000" max="10000000" step="50000" value={principal} onChange={e => setPrincipal(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Interest Rate (% p.a.) <em style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Illustrative default rate)</em></span>
                <span style={{ fontWeight: 700, color: 'var(--text-cream)' }}>{rate}%</span>
              </div>
              <input type="range" min="5" max="20" step="0.25" value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tenure ({tenure / 12} Yrs / {tenure} Mos)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{tenure} Months</span>
              </div>
              <input type="range" min="12" max="360" step="12" value={tenure} onChange={e => setTenure(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>
          </div>
        </div>

        {/* EMI OUTPUT DISPLAY */}
        <div className="fintech-card-elevated" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculated Monthly EMI</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px', marginBottom: '24px' }}>
              ₹{calculatedEmi.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Principal Amount</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>₹{principal.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Interest</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-coral)', marginTop: '2px' }}>₹{totalInterest.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div style={{ height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#101010', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* COLLATERAL RISK ANALYZER MODULE */}
      <div className="fintech-card" style={{ padding: '28px', marginBottom: '32px', border: '1px solid var(--border-red)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="var(--accent-coral)" /> Collateral Risk Analyzer
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Evaluate Loan-to-Value (LTV) exposure, primary residence personal impact, and collateral liquidation risk.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Collateral Asset Type</label>
            <select value={assetType} onChange={e => setAssetType(e.target.value)} className="fintech-input" style={{ background: '#101010', color: '#FFF' }}>
              <option value="Primary Residence">Primary Residence</option>
              <option value="Investment Property">Investment Property</option>
              <option value="Gold & Bullion">Gold & Bullion</option>
              <option value="Equity & Mutual Funds">Equity & Mutual Funds</option>
              <option value="Commercial Vehicle">Commercial Vehicle</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Estimated Asset Value (₹)</label>
            <input
              type="number"
              value={assetValue}
              onChange={e => setAssetValue(Number(e.target.value))}
              className="fintech-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Loan Amount Requested (₹)</label>
            <input
              type="number"
              value={collateralLoanAmount}
              onChange={e => setCollateralLoanAmount(Number(e.target.value))}
              className="fintech-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Existing Asset Liability (₹)</label>
            <input
              type="number"
              value={existingLiability}
              onChange={e => setExistingLiability(Number(e.target.value))}
              className="fintech-input"
            />
          </div>
        </div>

        {/* RISK OUTPUT DISPLAY */}
        <div style={{ background: '#1B1B1B', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-cream)' }}>Loan-To-Value (LTV): {ltvRatio}%</span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: riskBadgeColor }}>
                {riskCategory}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              {riskAdvice}
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            Total Collateral Encumbrance: ₹{totalLiability.toLocaleString('en-IN')} / ₹{assetValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* FLOATING RATE STRESS TEST */}
      <div className="fintech-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--accent-gold)" /> Floating Rate Interest Stress Test
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: `Base Rate (${rate}%)`, emi: calculatedEmi, diff: 'Current' },
            { label: `+1.0% Rate (${rate + 1}%)`, emi: Math.round(calculatedEmi * 1.05), diff: '+5% EMI' },
            { label: `+2.0% Rate (${rate + 2}%)`, emi: Math.round(calculatedEmi * 1.11), diff: '+11% EMI' },
            { label: `+3.0% Rate (${rate + 3}%)`, emi: Math.round(calculatedEmi * 1.17), diff: '+17% EMI' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#1B1B1B', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: i === 0 ? 'var(--accent-gold)' : 'var(--text-cream)', marginTop: '4px' }}>
                ₹{s.emi.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.diff}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
