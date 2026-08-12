import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Users, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onAuthSuccess: (user: any) => void;
}

const DEMO_ACCOUNTS = [
  { name: 'Arjun Mehta', email: 'arjun.demo@artha.ai', role: 'Software Engineer (Balanced Profile)' },
  { name: 'Riya Sharma', email: 'riya.demo@artha.ai', role: 'Marketing Exec (Moderate Saver / Food Delivery)' },
  { name: 'Rahul Verma', email: 'rahul.demo@artha.ai', role: 'Sr Engineer (High Income / Investments)' },
  { name: 'Neha Kapoor', email: 'neha.demo@artha.ai', role: 'Business Analyst (Budget Conscious)' },
  { name: 'Vikram Singh', email: 'vikram.demo@artha.ai', role: 'Product Manager (High Expenses)' },
  { name: 'Ananya Das', email: 'ananya.demo@artha.ai', role: 'Jr Dev (Early Career Discretionary)' },
  { name: 'Karan Joshi', email: 'karan.demo@artha.ai', role: 'Consultant (Loan Heavy Portfolio)' },
  { name: 'Priya Nair', email: 'priya.demo@artha.ai', role: 'UI Designer (Goal Focused)' },
  { name: 'Aman Gupta', email: 'aman.demo@artha.ai', role: 'Sales Exec (High Discretionary)' },
  { name: 'Sneha Iyer', email: 'sneha.demo@artha.ai', role: 'Tech Director (Wealth Builder)' }
];

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const navigate = useNavigate();

  const handleSelectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setShowDemoSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = mode === 'login' ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      let data: any = {};
      try {
        data = isJson ? await res.json() : { detail: await res.text() };
      } catch {
        data = { detail: 'Server response invalid.' };
      }

      if (res.ok && data.access_token) {
        localStorage.setItem('artha_token', data.access_token);
        
        // Hydrate user profile from /auth/me
        try {
          const meRes = await fetch('/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            onAuthSuccess({
              id: meData.id,
              email: meData.email,
              name: meData.profile?.name || data.name || meData.email.split('@')[0]
            });
          } else {
            onAuthSuccess({ id: data.user_id, email: data.email, name: data.name });
          }
        } catch {
          onAuthSuccess({ id: data.user_id, email: data.email, name: data.name });
        }

        if (mode === 'register') {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        let errStr = 'Invalid email or password.';
        if (typeof data.detail === 'string') {
          errStr = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          errStr = data.detail.map((d: any) => typeof d === 'string' ? d : d.msg || JSON.stringify(d)).join('; ');
        } else if (data.detail && typeof data.detail === 'object') {
          errStr = data.detail.msg || JSON.stringify(data.detail);
        }
        setError(errStr);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please verify backend server is running on port 8000.');
      } else {
        setError(typeof err === 'string' ? err : err?.message || 'Unable to connect to Artha AI server on port 8000.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
      
      {/* LEFT SIDE — CINEMATIC BRANDING & MOTION ILLISTRATION */}
      <div style={{
        flex: 1.2,
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        background: 'radial-gradient(circle at 10% 20%, rgba(101, 0, 0, 0.45) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(201, 169, 106, 0.08) 0%, transparent 50%)',
        borderRight: '1px solid var(--border-subtle)',
        minHeight: '600px'
      }} className="desktop-branding">

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <img src="/logo.png" alt="Artha AI" style={{ height: '40px', width: 'auto', borderRadius: '10px' }} />
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-cream)' }}>
              Artha <span style={{ color: 'var(--accent-gold)' }}>AI</span>
            </span>
          </div>

          <h1 style={{ fontSize: '3.4rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-cream)', marginBottom: '20px', letterSpacing: '-0.03em' }}>
            Your money.<br />
            <span style={{ background: 'linear-gradient(135deg, #C9A96A 0%, #D8B878 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              In motion.
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6 }}>
            Understand your money. Make smarter decisions. Build your future with dynamic simulation engines & AI coaching.
          </p>
        </div>

        {/* FINANCIAL METRIC CARDS OVERLAY */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <div className="fintech-card" style={{ padding: '16px 20px', flex: 1, background: 'rgba(16, 16, 16, 0.85)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
              <TrendingUp size={14} /> FutureView Projection
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-cream)' }}>₹1.85 Cr <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>+14.2%</span></div>
          </div>

          <div className="fintech-card" style={{ padding: '16px 20px', flex: 1, background: 'rgba(16, 16, 16, 0.85)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#F28B8B', fontWeight: 600, marginBottom: '6px' }}>
              <ShieldCheck size={14} /> Financial Health
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-cream)' }}>84 / 100 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optimal</span></div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={15} color="var(--accent-gold)" /> 256-Bit Encrypted PostgreSQL Security Architecture
        </div>
      </div>

      {/* RIGHT SIDE — LUXURY LOGIN / REGISTER CARD */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative'
      }}>
        
        {/* QUICK DEMO USER SELECTOR TOGGLE */}
        {mode === 'login' && (
          <div style={{ marginBottom: '16px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '10px 16px', border: '1px solid var(--border-gold)' }}
            >
              <Users size={16} color="var(--accent-gold)" /> Quick Select 10 Demo Accounts
            </button>
          </div>
        )}

        {/* DEMO USER SELECTOR DRAWER */}
        {showDemoSelector && mode === 'login' && (
          <div className="fintech-card" style={{ width: '100%', maxWidth: '420px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '4px' }}>Click demo user to pre-fill credentials:</div>
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDemoUser(acc.email)}
                style={{
                  background: '#151515',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-cream)' }}>{acc.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}>{acc.email} • <span style={{ color: 'var(--text-muted)' }}>{acc.role}</span></div>
              </button>
            ))}
          </div>
        )}

        <div className="fintech-card-elevated" style={{ width: '100%', maxWidth: '420px', padding: '36px', border: '1px solid var(--border-gold)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-cream)' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px' }}>
              {mode === 'login' ? 'Sign in to access your financial OS' : 'Start your financial intelligence journey'}
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(176, 0, 0, 0.2)', border: '1px solid var(--border-red)', borderRadius: '8px', color: '#F28B8B', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#686868" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Mehta"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="fintech-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#686868" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="fintech-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#686868" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="fintech-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px' }}>
              {loading ? 'Signing in...' : mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <>Don't have an account? <Link to="/register" style={{ color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'none' }}>Register free</Link></>
            ) : (
              <>Already have an account? <Link to="/login" style={{ color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
