import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle, User, Briefcase, DollarSign, Target, HeartHandshake } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Aditya Prakash',
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

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
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
            <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'var(--primary-indigo)', transition: 'width 0.3s ease' }} />
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
                <input type="text" className="fintech-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Age</label>
                  <input type="number" className="fintech-input" value={formData.age} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} />
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
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Monthly In-Hand Net Income (₹)</label>
                <input type="number" className="fintech-input" value={formData.monthlyIncome} onChange={e => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Monthly Fixed Essential Expenses (Rent, Bills, Food) (₹)</label>
                <input type="number" className="fintech-input" value={formData.monthlyFixedExpenses} onChange={e => setFormData({ ...formData, monthlyFixedExpenses: Number(e.target.value) })} />
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Liquid Savings (₹)</label>
                  <input type="number" className="fintech-input" value={formData.currentSavings} onChange={e => setFormData({ ...formData, currentSavings: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Emergency Fund Pool (₹)</label>
                  <input type="number" className="fintech-input" value={formData.emergencyFund} onChange={e => setFormData({ ...formData, emergencyFund: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Active Loans Count</label>
                  <input type="number" className="fintech-input" value={formData.existingLoansCount} onChange={e => setFormData({ ...formData, existingLoansCount: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Total Existing EMI (₹/mo)</label>
                  <input type="number" className="fintech-input" value={formData.existingTotalEmi} onChange={e => setFormData({ ...formData, existingTotalEmi: Number(e.target.value) })} />
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
                <input type="text" className="fintech-input" value={formData.goalName} onChange={e => setFormData({ ...formData, goalName: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Amount (₹)</label>
                  <input type="number" className="fintech-input" value={formData.goalTargetAmount} onChange={e => setFormData({ ...formData, goalTargetAmount: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Monthly SIP Contribution (₹)</label>
                  <input type="number" className="fintech-input" value={formData.goalMonthlyContribution} onChange={e => setFormData({ ...formData, goalMonthlyContribution: Number(e.target.value) })} />
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

          <button onClick={handleNext} className="btn-indigo">
            {step === 4 ? 'Complete Setup & Launch' : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
