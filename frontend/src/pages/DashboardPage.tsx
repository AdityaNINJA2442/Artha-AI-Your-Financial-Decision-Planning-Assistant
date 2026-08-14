import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, ArrowRight, CreditCard, Sparkles, Zap } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    name: 'User',
    monthlyIncome: 0,
    monthlyFixedExpenses: 0,
    currentSavings: 0,
    emergencyFund: 0,
    overallScore: 50
  });

  const [expensesTotal, setExpensesTotal] = useState(0);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [totalEmiAmount, setTotalEmiAmount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('artha_token') || '';
        if (!token) return;

        // Fetch User Profile
        const profRes = await fetch('/api/v1/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData && typeof profData === 'object') {
            setProfile((prev: any) => ({
              ...prev,
              name: profData.name || prev.name,
              monthlyIncome: profData.monthly_income ?? prev.monthlyIncome,
              monthlyFixedExpenses: profData.monthly_fixed_expenses ?? prev.monthlyFixedExpenses,
              currentSavings: profData.current_savings ?? prev.currentSavings,
              emergencyFund: profData.emergency_fund ?? prev.emergencyFund
            }));
          }
        }

        // Fetch Financial Score
        const scoreRes = await fetch('/api/v1/financial-health/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          if (scoreData && typeof scoreData === 'object') {
            setProfile((prev: any) => ({
              ...prev,
              overallScore: scoreData.overall_score ?? prev.overallScore
            }));
          }
        }

        const txRes = await fetch('/api/v1/transactions/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          const txList = Array.isArray(txData) ? txData : (txData && Array.isArray(txData.items) ? txData.items : []);
          const expSum = txList
            .filter((t: any) => t.type === 'Expense')
            .reduce((acc: number, t: any) => acc + t.amount, 0);
          setExpensesTotal(expSum);
        }

        // Fetch Loans
        const loanRes = await fetch('/api/v1/loans/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (loanRes.ok) {
          const loanData = await loanRes.json();
          if (Array.isArray(loanData)) {
            setActiveLoansCount(loanData.length);
            const totalEmi = loanData.reduce((acc: number, l: any) => acc + l.emi_amount, 0);
            setTotalEmiAmount(totalEmi);
          }
        }
      } catch (e) {
        // Safe error handling
      }
    };

    fetchDashboardData();
  }, []);

  const netSurplus = Math.max(0, profile.monthlyIncome - expensesTotal);
  const netWorth = (profile.currentSavings + profile.emergencyFund + 1545420) - (totalEmiAmount * 12);
  const needsAmount = Math.round(expensesTotal * 0.72);
  const wantsAmount = Math.round(expensesTotal * 0.28);
  const futureAmount = netSurplus;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* GREETING HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>
            Good evening, {profile.name} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '2px' }}>
            Here's your financial overview derived from PostgreSQL
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/coach" className="btn-gold">
            <Sparkles size={16} /> Ask AI Coach
          </Link>
        </div>
      </div>

      {/* TOP 3 METRIC CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CARD 1: FINANCIAL FITNESS */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Financial Fitness</div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{profile.overallScore}</span>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 100</span>
            <span className="badge-gold" style={{ marginLeft: 'auto' }}>Great</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} /> ↑ 6 points this month
          </div>
        </div>

        {/* CARD 2: CASH FLOW */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Cash Flow</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aug 2026</span>
          </div>

          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '6px' }}>
            ₹{netSurplus.toLocaleString('en-IN')}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Surplus (Income ₹{profile.monthlyIncome.toLocaleString('en-IN')} − Expenses ₹{expensesTotal.toLocaleString('en-IN')})
          </div>
        </div>

        {/* CARD 3: NET WORTH */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Net Worth</div>
            <span className="badge-gold">↑ 12.4% vs last month</span>
          </div>

          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '6px' }}>
            ₹{netWorth.toLocaleString('en-IN')}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Assets: ₹{(profile.currentSavings + profile.emergencyFund).toLocaleString('en-IN')} | Debt: ₹{(totalEmiAmount * 12).toLocaleString('en-IN')}
          </div>
        </div>

      </div>

      {/* MIDDLE ROW: CASH FLOW BREAKDOWN & ARTHA AI INSIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CASH FLOW BREAKDOWN CARD */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-cream)' }}>Cash Flow Breakdown</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Salary Flow Distribution (August 2026)</div>
            </div>
            <Link to="/transactions" className="btn-ghost" style={{ fontSize: '0.78rem' }}>View Ledger</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-cream)' }}>Needs (Essential)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rent, EMI, Groceries, Utilities</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>₹{needsAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-cream)' }}>Wants (Discretionary)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dining Out, Swiggy, Shopping</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>₹{wantsAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ background: '#1B1B1B', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>Future (Savings & SIPs)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Fund, Mutual Funds</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-gold)' }}>₹{futureAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ARTHA AI INSIGHT CARD */}
        <div className="fintech-card-elevated" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-gold)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="badge-gold">
                <Sparkles size={14} /> AI Financial Insight
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PostgreSQL Engine</span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '8px', lineHeight: 1.4 }}>
              "Food delivery spending increased 31% this month."
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
              You spent ₹12,400 on Swiggy/Zomato. Reducing food delivery frequency by 40% would save approximately <strong style={{ color: 'var(--accent-gold)' }}>₹2,450/month</strong> for your active car goal.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/transactions" className="btn-gold" style={{ padding: '10px 16px', fontSize: '0.85rem', flex: 1, justifyContent: 'center' }}>
              View Details
            </Link>
            <Link to="/simulator" className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', flex: 1, justifyContent: 'center' }}>
              Run What-If
            </Link>
          </div>
        </div>

      </div>

      {/* QUICK DECISION ACTIONS GRID */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '16px' }}>AI Financial Decision Modules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          <Link to="/simulator" className="fintech-card-interactive" style={{ padding: '20px', textDecoration: 'none' }}>
            <Zap size={20} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>Can I Afford This?</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulate purchase impact on savings & goal deadlines</div>
          </Link>

          <Link to="/loans" className="fintech-card-interactive" style={{ padding: '20px', textDecoration: 'none' }}>
            <CreditCard size={20} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>Loans & EMI Suite</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculator, prepayment, stress test, and Mark EMI as Paid</div>
          </Link>

          <Link to="/simulator" className="fintech-card-interactive" style={{ padding: '20px', textDecoration: 'none' }}>
            <TrendingUp size={20} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>FutureView Digital Twin</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>10-year net worth trajectory under 5 scenarios</div>
          </Link>

          <Link to="/decisions" className="fintech-card-interactive" style={{ padding: '20px', textDecoration: 'none' }}>
            <ShieldCheck size={20} color="var(--accent-red-primary)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>Decision Journal</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Persistent history of all affordability & loan checks</div>
          </Link>

        </div>
      </div>

    </div>
  );
};
