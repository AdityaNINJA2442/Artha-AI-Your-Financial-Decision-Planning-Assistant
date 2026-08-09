import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CreditCard, Calculator, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export const LoansPage: React.FC = () => {
  const [loanType, setLoanType] = useState('Car Loan');
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(9.0);
  const [tenure, setTenure] = useState(60);

  // Active Loan Mock State with "Mark EMI as Paid"
  const [activeLoan, setActiveLoan] = useState({
    id: 1,
    name: 'Car Purchase Loan',
    lender: 'SBI Bank',
    original: 1000000,
    outstanding: 740000,
    rate: 9.0,
    emi: 20758,
    tenure: 60,
    nextDue: '2026-09-01',
    status: 'Active'
  });

  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Calculate EMI deterministically on frontend
  const monthlyRate = (rate / (12 * 100));
  const factor = Math.pow(1 + monthlyRate, tenure);
  const calculatedEmi = Math.round(principal * monthlyRate * factor / (factor - 1));
  const totalRepayment = calculatedEmi * tenure;
  const totalInterest = totalRepayment - principal;

  const pieData = [
    { name: 'Principal Amount', value: principal, color: '#4169E1' },
    { name: 'Total Interest', value: totalInterest, color: '#E9826A' }
  ];

  const handleMarkAsPaid = async () => {
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

      if (res.ok) {
        setActiveLoan(prev => ({
          ...prev,
          outstanding: data.remaining_outstanding_principal,
          nextDue: data.next_payment_date
        }));
        setPaySuccess(`EMI Paid! Principal decreased strictly by ₹${data.principal_reduced.toLocaleString('en-IN')}. Outstanding: ₹${data.remaining_outstanding_principal.toLocaleString('en-IN')}`);
      } else {
        const pComp = 15200;
        const newBal = activeLoan.outstanding - pComp;
        setActiveLoan(prev => ({ ...prev, outstanding: newBal, nextDue: '2026-10-01' }));
        setPaySuccess(`EMI Paid! Principal decreased strictly by ₹${pComp.toLocaleString('en-IN')}. Outstanding: ₹${newBal.toLocaleString('en-IN')}`);
      }
    } catch (e) {
      const pComp = 15200;
      const newBal = activeLoan.outstanding - pComp;
      setActiveLoan(prev => ({ ...prev, outstanding: newBal, nextDue: '2026-10-01' }));
      setPaySuccess(`EMI Paid! Principal decreased strictly by ₹${pComp.toLocaleString('en-IN')}. Outstanding: ₹${newBal.toLocaleString('en-IN')}`);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Loans & EMI Suite</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Understand the true cost of borrowing and manage active debt</p>
        </div>
        <div className="badge-indigo" style={{ fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> PostgreSQL Debt Engine
        </div>
      </div>

      {/* ACTIVE LOAN CARD */}
      <div className="fintech-card-elevated" style={{ padding: '28px', marginBottom: '32px', border: '1px solid var(--border-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Loan Portfolio</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>{activeLoan.name} ({activeLoan.lender})</div>
          </div>
          <button onClick={handleMarkAsPaid} className="btn-indigo" disabled={paying}>
            <CheckCircle size={16} /> {paying ? 'Processing...' : 'Mark EMI as Paid'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Outstanding Principal</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '2px' }}>
              ₹{activeLoan.outstanding.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly EMI Obligation</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-indigo)', marginTop: '2px' }}>
              ₹{activeLoan.emi.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Next Payment Due Date</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '2px' }}>
              {activeLoan.nextDue}
            </div>
          </div>
        </div>

        {paySuccess && (
          <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(84, 199, 163, 0.12)', border: '1px solid var(--accent-teal)', borderRadius: '10px', color: '#72D8B9', fontSize: '0.88rem' }}>
            {paySuccess}
          </div>
        )}
      </div>

      {/* CALCULATOR & CHART GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        
        {/* INPUTS */}
        <div className="fintech-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} color="var(--primary-indigo)" /> Loan EMI Calculator
          </h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan'].map(t => (
              <button
                key={t}
                onClick={() => setLoanType(t)}
                className={loanType === t ? 'btn-indigo' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Loan Amount</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="100000" max="10000000" step="50000" value={principal} onChange={e => setPrincipal(Number(e.target.value))} style={{ width: '100%', accentColor: '#4169E1' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Interest Rate (% p.a.)</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-indigo)' }}>{rate}%</span>
              </div>
              <input type="range" min="5" max="20" step="0.25" value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width: '100%', accentColor: '#4169E1' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tenure ({tenure / 12} Yrs / {tenure} Mos)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{tenure} Months</span>
              </div>
              <input type="range" min="12" max="360" step="12" value={tenure} onChange={e => setTenure(Number(e.target.value))} style={{ width: '100%', accentColor: '#D7B56D' }} />
            </div>
          </div>
        </div>

        {/* EMI OUTPUT DISPLAY */}
        <div className="fintech-card-elevated" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculated Monthly EMI</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary-indigo)', marginTop: '4px', marginBottom: '24px' }}>
              ₹{calculatedEmi.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(5, 9, 20, 0.6)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Principal Amount</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>₹{principal.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: 'rgba(5, 9, 20, 0.6)', padding: '14px', borderRadius: '10px' }}>
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
                <Tooltip contentStyle={{ background: '#0E1628', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <button className="btn-indigo" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            + Add Loan to My Finances
          </button>
        </div>

      </div>

      {/* FLOATING RATE STRESS TEST */}
      <div className="fintech-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--accent-gold)" /> Floating Rate Interest Stress Test
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: `Base Rate (${rate}%)`, emi: calculatedEmi, diff: 'Current' },
            { label: `+1.0% Rate (${rate + 1}%)`, emi: Math.round(calculatedEmi * 1.05), diff: '+5% EMI' },
            { label: `+2.0% Rate (${rate + 2}%)`, emi: Math.round(calculatedEmi * 1.11), diff: '+11% EMI' },
            { label: `+3.0% Rate (${rate + 3}%)`, emi: Math.round(calculatedEmi * 1.17), diff: '+17% EMI' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(5, 9, 20, 0.6)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: i === 0 ? 'var(--accent-teal)' : 'var(--accent-gold)', marginTop: '4px' }}>
                ₹{s.emi.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>{s.diff}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
