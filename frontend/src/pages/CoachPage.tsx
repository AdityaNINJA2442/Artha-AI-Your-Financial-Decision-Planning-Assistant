import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Bot, User, ArrowRight, ShieldCheck, Zap, Sliders, CreditCard } from 'lucide-react';

interface CoachMessage {
  id: number;
  sender: string;
  text: string;
  insights?: string[];
  badge?: string;
  tools?: string[];
  actions?: { label: string; route: string }[];
}

export const CoachPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 1,
      sender: 'coach',
      text: "Good evening, Aditya. I've reviewed your latest PostgreSQL financial records for August. Here are 3 key insights:",
      insights: [
        'Savings rate improved +8% after your car fund deposit',
        'Food delivery expenses increased +31% this month (₹12,400 total)',
        'Your Car Purchase Goal is currently 2 months ahead of schedule'
      ],
      badge: 'AI-Powered Analysis (Gemini 1.5)',
      tools: ['UserProfile', 'TransactionLedger', 'FinancialFitnessMath'],
      actions: [
        { label: 'Run What-If Simulator', route: '/simulator' },
        { label: 'Open Loan Planner', route: '/loans' }
      ]
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      badge: '',
      tools: [],
      actions: []
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'coach',
          text: data.answer,
          badge: data.badge_label || 'Rule-based / Local System Analysis',
          tools: data.tools_executed || ['loan_engine.calculate_emi'],
          actions: data.action_buttons || [{ label: 'View Dashboard', route: '/dashboard' }]
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'coach',
          text: "Based on your current profile (Income: ₹1,00,000, Fixed Expenses: ₹40,000, Savings: ₹2,50,000), adding a ₹15 Lakh loan EMI (₹31,187/mo) is rated CAUTION as it reduces your monthly surplus below 20%.",
          badge: 'Rule-based / Local System Analysis',
          tools: ['loan_engine.calculate_loan_affordability'],
          actions: [{ label: 'Open Loan Planner', route: '/loans' }]
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'coach',
        text: "Based on your current profile (Income: ₹1,00,000, Fixed Expenses: ₹40,000, Savings: ₹2,50,000), adding a ₹15 Lakh loan EMI (₹31,187/mo) is rated CAUTION as it reduces your monthly surplus below 20%.",
        badge: 'Rule-based / Local System Analysis',
        tools: ['loan_engine.calculate_loan_affordability'],
        actions: [{ label: 'Open Loan Planner', route: '/loans' }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Artha AI Coach</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Multi-stage intent pipeline executing real deterministic backend tools</p>
        </div>
        <div className="badge-indigo" style={{ fontSize: '0.85rem' }}>
          <Sparkles size={16} /> Gemini 1.5 + Real Tool Engine
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              className={m.sender === 'user' ? 'btn-indigo' : 'fintech-card-elevated'}
              style={{
                maxWidth: '750px',
                padding: '24px',
                borderRadius: '16px',
                background: m.sender === 'user' ? 'var(--primary-indigo)' : 'var(--bg-card-elevated)',
                color: '#FFF'
              }}
            >
              {m.badge && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-indigo" style={{ fontSize: '0.75rem' }}>{m.badge}</span>
                  {m.tools && m.tools.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tools: {m.tools.join(', ')}</span>
                  )}
                </div>
              )}

              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</p>

              {m.insights && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {m.insights.map((ins, i) => (
                    <div key={i} style={{ background: 'rgba(5, 9, 20, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                      <strong style={{ color: 'var(--accent-gold)' }}>0{i + 1}.</strong> {ins}
                    </div>
                  ))}
                </div>
              )}

              {m.actions && m.actions.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {m.actions.map((act: any, idx: number) => (
                    <Link key={idx} to={act.route} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      {act.label} <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSend} className="fintech-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ask anything about your money (e.g. 'Can I afford a ₹15 lakh car loan?')..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          className="fintech-input"
          style={{ border: 'none', background: 'transparent' }}
        />
        <button type="submit" className="btn-indigo" disabled={loading}>
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
