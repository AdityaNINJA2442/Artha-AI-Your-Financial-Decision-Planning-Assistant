import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, ArrowRight, CreditCard, Sparkles, Zap, Info } from 'lucide-react';

const InfoTooltip: React.FC<{ title: string; text: string; example: string }> = ({ title, text, example }) => {
  const [show, setShow] = useState(false);
  return (
    <span 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '6px', cursor: 'pointer' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <Info size={14} color="var(--accent-gold)" />
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 14px',
          background: '#1A1A1A',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--text-cream)',
          width: '270px',
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '4px' }}>{title}</div>
          <div style={{ color: 'var(--text-main)', marginBottom: '6px', lineHeight: 1.4 }}>{text}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
            {example}
          </div>
        </div>
      )}
    </span>
  );
};

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
  const [totalOutstandingPrincipal, setTotalOutstandingPrincipal] = useState(0);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);

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
          setUserTransactions(txList);
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
            const totalEmi = loanData.reduce((acc: number, l: any) => acc + (l.emi_amount || 0), 0);
            const totalOutstanding = loanData.reduce((acc: number, l: any) => acc + (l.outstanding_principal || 0), 0);
            setTotalEmiAmount(totalEmi);
            setTotalOutstandingPrincipal(totalOutstanding);
          }
        }
      } catch (e) {
        // Safe error handling
      }
    };

    fetchDashboardData();
  }, []);

  const incomeFromTxs = userTransactions
    .filter((t: any) => t.type === 'Income')
    .reduce((acc: number, t: any) => acc + t.amount, 0);

  const totalIncome = incomeFromTxs > 0 ? incomeFromTxs : profile.monthlyIncome;
  const netSurplus = totalIncome - expensesTotal;
  const totalAssets = (profile.currentSavings || 0) + (profile.emergencyFund || 0);
  const netWorth = totalAssets - totalOutstandingPrincipal;
  const needsAmount = Math.round(expensesTotal * 0.72);
  const wantsAmount = Math.round(expensesTotal * 0.28);
  const futureAmount = Math.max(0, netSurplus);

  const aiInsight = React.useMemo(() => {
    const expenseTxs = userTransactions.filter(t => t.type === 'Expense');
    if (expenseTxs.length === 0) {
      return {
        title: "Welcome to Artha AI Financial Sentinel",
        desc: "No expense transactions recorded yet. Add transactions or complete onboarding to trigger real-time AI cash flow insights."
      };
    }

    const catTotals: Record<string, number> = {};
    expenseTxs.forEach(t => {
      const cat = t.category_name || t.category || "Other Expenses";
      catTotals[cat] = (catTotals[cat] || 0) + t.amount;
    });

    let topCat = "Food & Dining";
    let topAmt = 0;
    Object.entries(catTotals).forEach(([cat, amt]) => {
      if (amt > topAmt) {
        topAmt = amt;
        topCat = cat;
      }
    });

    const topPct = expensesTotal > 0 ? Math.round((topAmt / expensesTotal) * 100) : 0;

    return {
      title: `Top Outflow Category: ${topCat} (${topPct}% of expenses)`,
      desc: `You spent ₹${topAmt.toLocaleString('en-IN')} on ${topCat} across your logged transactions. Managing discretionary spending in ${topCat} offers the highest optimization potential.`
    };
  }, [userTransactions, expensesTotal]);

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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Financial Fitness</span>
              <InfoTooltip 
                title="Financial Fitness (0-100)"
                text="Your score measures overall financial health. It evaluates savings ratio, emergency fund runway, debt burden, spending discipline, and cash-flow surplus from your PostgreSQL financial records."
                example="A higher score indicates stronger financial resilience."
              />
            </div>
            <ShieldCheck size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
            {profile.overallScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Authoritative calculation engine derived from PostgreSQL
          </div>
        </div>

        {/* CARD 2: MONTHLY NET SURPLUS */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {netSurplus >= 0 ? 'Monthly Net Surplus' : 'Monthly Cash Deficit'}
              </span>
              <InfoTooltip 
                title="Monthly Cash Flow"
                text="Monthly Net Surplus represents how much money is left after all monthly expenses are deducted from your total income."
                example="Net Surplus = Total Monthly Income − Total Monthly Expenses"
              />
            </div>
            <TrendingUp size={18} color={netSurplus >= 0 ? "var(--accent-gold)" : "var(--accent-coral)"} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: netSurplus >= 0 ? 'var(--accent-gold)' : 'var(--accent-coral)', marginBottom: '6px' }}>
            {netSurplus < 0 ? `−₹${Math.abs(netSurplus).toLocaleString('en-IN')}` : `₹${netSurplus.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Income (₹{totalIncome.toLocaleString('en-IN')}) − Expenses (₹{expensesTotal.toLocaleString('en-IN')})
          </div>
        </div>

        {/* CARD 3: NET WORTH */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Net Worth</span>
              <InfoTooltip 
                title="Net Worth Breakdown"
                text="Net Worth is the value of what you own minus what you owe (Assets − Liabilities). Your salary is monthly income and does not automatically equal net worth."
                example={`Net Worth = Liquid Assets (₹${totalAssets.toLocaleString('en-IN')}) − Liabilities (₹${totalOutstandingPrincipal.toLocaleString('en-IN')})`}
              />
            </div>
            <CreditCard size={18} color="var(--text-cream)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
            ₹{netWorth.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Liquid Assets (₹{totalAssets.toLocaleString('en-IN')}) − Liabilities (₹{totalOutstandingPrincipal.toLocaleString('en-IN')})
          </div>
        </div>

      </div>

      {/* MIDDLE ROW: CASH FLOW BREAKDOWN & ARTHA AI INSIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CASH FLOW BREAKDOWN CARD */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-cream)' }}>Monthly Expense Distribution</h3>
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
              "{aiInsight.title}"
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
              {aiInsight.desc}
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
