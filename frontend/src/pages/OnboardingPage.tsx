import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';

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
          width: '260px',
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

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: 28,
    occupation: 'Salaried IT Professional',
    monthlyIncome: 100000,
    monthlyFixedExpenses: 40000,
    currentSavings: 250000,
    emergencyFund: 80000,
    existingLoansCount: 1,
    existingTotalEmi: 20758,
    goalName: 'Car Purchase Fund',
    goalTargetAmount: 1000000,
    goalTargetDate: '2028-12-31',
    goalMonthlyContribution: 15000
  });

  const navigate = useNavigate();

  const handleNumberInput = (field: keyof typeof formData, rawVal: string) => {
    if (rawVal === '') {
      setFormData(prev => ({ ...prev, [field]: '' as any }));
    } else {
      const parsed = Number(rawVal);
      setFormData(prev => ({ ...prev, [field]: isNaN(parsed) ? '' as any : parsed }));
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        const token = localStorage.getItem('artha_token') || '';
        if (token) {
          await fetch('/api/v1/users/onboarding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: formData.name || 'User',
              age: Math.max(18, formData.age),
              occupation: formData.occupation,
              monthly_income: Math.max(0, formData.monthlyIncome),
              annual_income: Math.max(0, formData.monthlyIncome * 12),
              monthly_fixed_expenses: Math.max(0, formData.monthlyFixedExpenses),
              current_savings: Math.max(0, formData.currentSavings),
              emergency_fund: Math.max(0, formData.emergencyFund),
              existing_loans_count: Math.max(0, formData.existingLoansCount),
              existing_total_emi: Math.max(0, formData.existingTotalEmi),
              goal_name: formData.goalName || 'Financial Goal',
              goal_amount: Math.max(0, formData.goalTargetAmount),
              goal_target_date: formData.goalTargetDate,
              goal_monthly_contribution: Math.max(0, formData.goalMonthlyContribution)
            })
          });
        }
      } catch (err) {
        console.error("Failed to post onboarding data", err);
      } finally {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-dark)' }}>
      <div className="fintech-card-elevated" style={{ width: '100%', maxWidth: '600px', padding: '36px' }}>
        
        {/* Progress Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Step {step} of 4</span>
            <span>{step === 1 ? 'Personal Profile' : step === 2 ? 'Income & Expenses' : step === 3 ? 'Savings & Debt' : 'Primary Financial Goal'}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'var(--accent-gold)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Step 1: Personal Profile */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>Tell us about yourself</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Artha uses this to personalize your financial health score and benchmark guidance.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input type="text" className="fintech-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Age</label>
                  <input 
                    type="number" 
                    min="18" 
                    className="fintech-input" 
                    value={formData.age} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, age: val === '' ? '' as any : Number(val) });
                    }}
                    onBlur={() => {
                      const num = Number(formData.age);
                      if (!formData.age || isNaN(num) || num < 18) {
                        setFormData({ ...formData, age: 18 });
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Occupation Type</label>
                  <select className="fintech-input" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })}>
                    <option value="Salaried IT Professional">Salaried Corporate</option>
                    <option value="Business Owner / Founder">Business Owner / Founder</option>
                    <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                    <option value="Government / PSU">Government / PSU</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Income & Expenses */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>Income & Essential Expenses</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>We compute your monthly surplus and cash flow resilience from these figures.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  Monthly In-Hand Net Income (₹/month)
                  <InfoTooltip title="Monthly In-Hand Net Income" text="Your total take-home salary or net income received every month after taxes." example="Example: ₹80,000 per month → enter 80000" />
                </label>
                <input 
                  type="number" 
                  min="0" 
                  className="fintech-input" 
                  value={formData.monthlyIncome} 
                  onChange={e => handleNumberInput('monthlyIncome', e.target.value)} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  Monthly Fixed Essential Expenses (₹/month)
                  <InfoTooltip title="Monthly Essential Expenses" text="Essential living expenses like rent, utilities, groceries, and insurance." example="Example: ₹35,000 per month → enter 35000" />
                </label>
                <input 
                  type="number" 
                  min="0" 
                  className="fintech-input" 
                  value={formData.monthlyFixedExpenses} 
                  onChange={e => handleNumberInput('monthlyFixedExpenses', e.target.value)} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Savings & Existing Debt */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>Savings & Active Debt</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Used for Financial Shock testing and emergency runway survival math.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    Liquid Savings (₹)
                    <InfoTooltip title="Liquid Savings" text="Money you can access quickly, such as bank savings or cash. Do not include house or car." example="Example: ₹40,000 available in savings → enter 40000" />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    className="fintech-input" 
                    value={formData.currentSavings} 
                    onChange={e => handleNumberInput('currentSavings', e.target.value)} 
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    Emergency Fund Pool (₹)
                    <InfoTooltip title="Emergency Fund Pool" text="Money specifically kept aside for unexpected situations like medical or job loss." example="Example: ₹1,00,000 reserved for emergencies → enter 100000" />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    className="fintech-input" 
                    value={formData.emergencyFund} 
                    onChange={e => handleNumberInput('emergencyFund', e.target.value)} 
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    Active Loans Count
                    <InfoTooltip title="Active Loans Count" text="Number of loans you are currently repaying (e.g. Car + Personal Loan)." example="Example: Car Loan + Personal Loan → enter 2" />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    className="fintech-input" 
                    value={formData.existingLoansCount} 
                    onChange={e => handleNumberInput('existingLoansCount', e.target.value)} 
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    Total Existing EMI (₹/mo)
                    <InfoTooltip title="Total Existing EMI" text="Total amount you pay every month toward all active loans combined." example="Example: Car EMI ₹12,000 + Personal EMI ₹5,000 → enter 17000" />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    className="fintech-input" 
                    value={formData.existingTotalEmi} 
                    onChange={e => handleNumberInput('existingTotalEmi', e.target.value)} 
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Primary Goal */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>Your Primary Financial Goal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Artha monitors purchase impacts against this specific target deadline.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Goal Name</label>
                <input type="text" className="fintech-input" value={formData.goalName} onChange={e => setFormData({ ...formData, goalName: e.target.value })} placeholder="e.g. House Downpayment" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    Target Amount (₹)
                    <InfoTooltip title="Target Amount" text="Total cost or money required to complete this financial goal." example="Example: ₹5,00,000 target → enter 500000" />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    className="fintech-input" 
                    value={formData.goalTargetAmount} 
                    onChange={e => handleNumberInput('goalTargetAmount', e.target.value)} 
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    Monthly SIP Contribution (₹)
                    <InfoTooltip title="Monthly SIP Contribution" text="Amount you can set aside every month toward achieving this goal." example="Example: ₹10,000 per month → enter 10000" />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    className="fintech-input" 
                    value={formData.goalMonthlyContribution} 
                    onChange={e => handleNumberInput('goalMonthlyContribution', e.target.value)} 
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              Back
            </button>
          ) : <div />}

          <button onClick={handleNext} className="btn-gold">
            {step === 4 ? 'Complete Setup & Launch' : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
