import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CreditCard, Calculator, CheckCircle, ShieldCheck, Zap, AlertTriangle, Building, Home, ShieldAlert, Plus, Trash2, RotateCcw, Bookmark, X, Check } from 'lucide-react';

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

  // Add New Loan Modal State
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [newLoanName, setNewLoanName] = useState('Car Loan');
  const [newLoanType, setNewLoanType] = useState('Car Loan');
  const [newPrincipal, setNewPrincipal] = useState('1000000');
  const [newRate, setNewRate] = useState('9.0');
  const [newTenure, setNewTenure] = useState('60');
  const [newLender, setNewLender] = useState('HDFC Bank');
  const [submittingLoan, setSubmittingLoan] = useState(false);

  // Saved EMI Analyses State (P6)
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

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
    } else if (type === 'Other') {
      setRate(10.0); setTenure(48); setPrincipal(500000);
    }
  };

  const fetchLoansAndAnalyses = async () => {
    try {
      const token = localStorage.getItem('artha_token') || '';
      if (!token) return;

      const res = await fetch('/api/v1/loans/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setActiveLoans(data);
          if (data.length > 0 && !selectedLoanId) {
            setSelectedLoanId(data[0].id);
          }
        }
      }

      const decRes = await fetch('/api/v1/decisions/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (decRes.ok) {
        const items = await decRes.json();
        if (Array.isArray(items)) {
          setSavedAnalyses(items.filter((d: any) => d.decision_type === 'EMI Analysis'));
        }
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    fetchLoansAndAnalyses();
  }, []);

  const handleMarkAsPaid = async () => {
    const targetLoanId = selectedLoanId || (activeLoans[0] ? activeLoans[0].id : null);
    if (!targetLoanId) return;
    setPaying(true);
    setPaySuccess('');

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch(`/api/v1/loans/${targetLoanId}/mark-paid`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'Already Paid') {
          setPaySuccess('EMI for today is already recorded as paid');
        } else {
          setPaySuccess('EMI Paid & Transaction Recorded');
        }
        setTimeout(() => setPaySuccess(''), 3500);
        fetchLoansAndAnalyses();
      }
    } catch (err) {
      console.error("Failed to mark EMI as paid", err);
    } finally {
      setPaying(false);
    }
  };

  const handleCreateLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanName || !newPrincipal) return;
    setSubmittingLoan(true);

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/loans/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          loan_name: newLoanName,
          loan_type: newLoanType,
          original_principal: parseFloat(newPrincipal),
          interest_rate: parseFloat(newRate),
          tenure_months: parseInt(newTenure),
          lender_name: newLender || 'Bank'
        })
      });

      if (res.ok) {
        setIsAddLoanOpen(false);
        fetchLoansAndAnalyses();
      }
    } catch (err) {
      console.error("Failed to create loan", err);
    } finally {
      setSubmittingLoan(false);
    }
  };

  const handleSaveEmiAnalysis = async () => {
    setSavingAnalysis(true);
    setAnalysisSuccess(false);

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/decisions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          decision_type: 'EMI Analysis',
          title: `${loanType} Analysis`,
          input_data: { loanType, principal, rate, tenure },
          result_data: { emi: calculatedEmi, totalInterest },
          risk_level: 'Manageable'
        })
      });

      if (res.ok) {
        setAnalysisSuccess(true);
        setTimeout(() => setAnalysisSuccess(false), 3000);
        fetchLoansAndAnalyses();
      }
    } catch (err) {
      console.error("Failed to save EMI analysis", err);
    } finally {
      setSavingAnalysis(false);
    }
  };

  const handleDeleteAnalysis = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this saved EMI analysis?")) return;

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch(`/api/v1/decisions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedAnalyses(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete EMI analysis", err);
    }
  };

  const handleLoadAnalysis = (item: any) => {
    if (item.input_data_json) {
      try {
        const parsed = JSON.parse(item.input_data_json);
        if (parsed.principal) setPrincipal(parsed.principal);
        if (parsed.rate) setRate(parsed.rate);
        if (parsed.tenure) setTenure(parsed.tenure);
        if (parsed.loanType) setLoanType(parsed.loanType);
      } catch (e) {}
    }
  };

  const handleConvertAnalysisToLoan = (item: any) => {
    let p = principal;
    let r = rate;
    let t = tenure;
    let lt = loanType;

    if (item.input_data_json) {
      try {
        const parsed = JSON.parse(item.input_data_json);
        if (parsed.principal) p = parsed.principal;
        if (parsed.rate) r = parsed.rate;
        if (parsed.tenure) t = parsed.tenure;
        if (parsed.loanType) lt = parsed.loanType;
      } catch (e) {}
    }

    setNewLoanName(item.title || lt);
    setNewLoanType(lt);
    setNewPrincipal(String(p));
    setNewRate(String(r));
    setNewTenure(String(t));
    setIsAddLoanOpen(true);
  };

  // Math Calculations for EMI
  const monthlyRate = rate / (12 * 100);
  const calculatedEmi = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );

  const totalPayment = calculatedEmi * tenure;
  const totalInterest = Math.max(0, totalPayment - principal);

  const pieData = [
    { name: 'Principal Amount', value: principal, color: '#C9A96A' },
    { name: 'Total Interest', value: totalInterest, color: '#E57373' }
  ];

  const activeLoan = activeLoans.find(l => l.id === selectedLoanId) || activeLoans[0];

  // Collateral Math
  const totalDebtAgainstAsset = collateralLoanAmount + existingLiability;
  const ltvRatio = assetValue > 0 ? (totalDebtAgainstAsset / assetValue) * 100 : 0;
  const isHighRisk = ltvRatio > 75;
  const isPrimaryResidence = assetType === 'Primary Residence';

  let riskBadge = 'Safe (LTV <= 50%)';
  let riskBadgeColor = 'badge-gold';
  let riskAdvice = 'Healthy loan-to-value safety margin.';

  if (ltvRatio > 75) {
    riskBadge = 'High Risk (LTV > 75%)';
    riskBadgeColor = 'badge-coral';
    riskAdvice = isPrimaryResidence
      ? 'CRITICAL RISK: Primary residence collateral LTV exceeds 75%. Foreclosure shock exposure is severe.'
      : 'High LTV exposure. Subject to margin call risks.';
  } else if (ltvRatio > 50) {
    riskBadge = 'Moderate Caution (LTV 50-75%)';
    riskBadgeColor = 'badge-gold';
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setIsAddLoanOpen(true)} className="btn-gold">
            <Plus size={16} /> Add New Loan
          </button>
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

      {/* EMI CALCULATOR SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        
        {/* EMI CONTROLS */}
        <div className="fintech-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '20px' }}>EMI Simulator & Presets</h3>

          {/* LOAN PRESET BUTTONS */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Gold Loan', 'Other'].map(type => (
              <button
                key={type}
                onClick={() => handleSelectLoanType(type)}
                className={loanType === type ? 'btn-gold' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Loan Principal Amount (₹)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="100000" max="10000000" step="50000" value={principal} onChange={e => setPrincipal(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Interest Rate (% p.a.)</span>
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

        {/* EMI OUTPUT DISPLAY & SAVE ANALYSIS BUTTON */}
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

            <div style={{ height: '160px', marginTop: '12px', marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#151515', 
                      border: '1px solid rgba(201,169,106,0.3)', 
                      borderRadius: '8px', 
                      color: '#F1E8D8',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                    }} 
                    itemStyle={{ color: '#C9A96A' }} 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button onClick={handleSaveEmiAnalysis} className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={savingAnalysis}>
            {analysisSuccess ? <><Check size={16} /> Analysis Saved</> : <><Bookmark size={16} /> Save Analysis</>}
          </button>
        </div>
      </div>

      {/* SAVED EMI ANALYSES SECTION (P6) */}
      {savedAnalyses.length > 0 && (
        <div className="fintech-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Bookmark size={20} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)' }}>Saved EMI Analyses</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {savedAnalyses.map(item => {
              let p = 0, r = 0, t = 0, emi = 0;
              try {
                const parsedIn = JSON.parse(item.input_data_json || '{}');
                const parsedOut = JSON.parse(item.result_data_json || '{}');
                p = parsedIn.principal || 0;
                r = parsedIn.rate || 0;
                t = parsedIn.tenure || 0;
                emi = parsedOut.emi || 0;
              } catch(e) {}

              return (
                <div key={item.id} style={{ background: '#1B1B1B', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '1rem' }}>{item.title}</span>
                      <span className="badge-gold" style={{ fontSize: '0.72rem' }}>EMI: ₹{emi.toLocaleString('en-IN')}/mo</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Principal: ₹{p.toLocaleString('en-IN')} @ {r}% p.a.
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Tenure: {t} months ({t / 12} yrs) | Saved on {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleLoadAnalysis(item)} className="btn-secondary" style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'center' }}>
                      <RotateCcw size={13} /> View
                    </button>
                    <button onClick={() => handleConvertAnalysisToLoan(item)} className="btn-gold" style={{ flex: 1.2, padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'center' }}>
                      <Plus size={13} /> Add as Loan
                    </button>
                    <button onClick={() => handleDeleteAnalysis(item.id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#F28B8B', borderColor: 'var(--border-red)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COLLATERAL RISK ANALYZER */}
      <div className="fintech-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ShieldAlert size={20} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-cream)' }}>Collateral Risk Analyzer</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Pledged Asset Type</label>
              <select className="fintech-input" value={assetType} onChange={e => setAssetType(e.target.value)}>
                <option value="Primary Residence">Primary Residence</option>
                <option value="Commercial Property">Commercial Property</option>
                <option value="Gold / Precious Metals">Gold / Precious Metals</option>
                <option value="Mutual Funds / Equity">Mutual Funds / Equity</option>
              </select>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Asset Value (₹)</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>₹{assetValue.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="1000000" max="20000000" step="500000" value={assetValue} onChange={e => setAssetValue(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Collateral Loan Amount (₹)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{collateralLoanAmount.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="500000" max="15000000" step="250000" value={collateralLoanAmount} onChange={e => setCollateralLoanAmount(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A96A' }} />
            </div>
          </div>

          <div style={{ background: '#1B1B1B', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loan-to-Value (LTV) Ratio</div>
                <span className={riskBadgeColor}>{riskBadge}</span>
              </div>

              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isHighRisk ? 'var(--accent-coral)' : 'var(--accent-gold)', marginBottom: '12px' }}>
                {ltvRatio.toFixed(1)}%
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {riskAdvice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW LOAN MODAL */}
      {isAddLoanOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsAddLoanOpen(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-cream)' }}>Add New Loan</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Enter loan terms to add to your active PostgreSQL portfolio</p>
              </div>
              <button 
                onClick={() => setIsAddLoanOpen(false)} 
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLoanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-cream)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Loan Name</label>
                <input type="text" className="fintech-input" value={newLoanName} onChange={e => setNewLoanName(e.target.value)} required placeholder="e.g. Car Loan / HDFC Home Loan" />
              </div>

              <div className="modal-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-cream)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Loan Type</label>
                  <select className="fintech-input" value={newLoanType} onChange={e => setNewLoanType(e.target.value)}>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Gold Loan">Gold Loan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-cream)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Lender Name</label>
                  <input type="text" className="fintech-input" value={newLender} onChange={e => setNewLender(e.target.value)} placeholder="e.g. SBI Bank / HDFC Bank" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-cream)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Principal Amount (₹)</label>
                <input type="number" min="1000" className="fintech-input" value={newPrincipal} onChange={e => setNewPrincipal(e.target.value)} required placeholder="e.g. 1000000" />
              </div>

              <div className="modal-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-cream)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Interest Rate (% p.a.)</label>
                  <input type="number" step="0.1" min="1" className="fintech-input" value={newRate} onChange={e => setNewRate(e.target.value)} required placeholder="e.g. 9.0" />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-cream)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Tenure (Months)</label>
                  <input type="number" min="1" className="fintech-input" value={newTenure} onChange={e => setNewTenure(e.target.value)} required placeholder="e.g. 60" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsAddLoanOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-gold" disabled={submittingLoan}>
                  {submittingLoan ? 'Adding Loan...' : 'Add Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
