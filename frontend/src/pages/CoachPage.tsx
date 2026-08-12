import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, ArrowRight } from 'lucide-react';

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
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 1,
      sender: 'coach',
      text: "Good day! I am your AI Financial Coach. I analyze your PostgreSQL financial records (income, expenses, loans, and goals) and execute real deterministic tools to answer your decision questions. Ask me anything below!",
      badge: 'AI Financial Advisor',
      tools: ['UserProfile', 'TransactionLedger', 'FinancialFitnessMath'],
      actions: [
        { label: 'Run What-If Simulator', route: '/simulator' },
        { label: 'Open Loan Planner', route: '/loans' }
      ]
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

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
        body: JSON.stringify({
          message: userText,
          conversation_id: conversationId
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.conversation_id) setConversationId(data.conversation_id);
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
          text: "I was unable to retrieve your financial calculation. Please check your backend connection.",
          badge: 'System Notice',
          tools: [],
          actions: [{ label: 'View Dashboard', route: '/dashboard' }]
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'coach',
        text: "Network or server connection error.",
        badge: 'Connection Error',
        tools: [],
        actions: [{ label: 'View Dashboard', route: '/dashboard' }]
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>Artha AI Coach</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Multi-stage intent pipeline executing real deterministic backend tools</p>
        </div>
        <div className="badge-gold" style={{ fontSize: '0.85rem' }}>
          <Sparkles size={16} /> Gemini 1.5 + Real Tool Engine
        </div>
      </div>

      {/* SUGGESTION CHIPS */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            "Can I afford a ₹70,000 laptop?",
            "Can I afford a ₹15 lakh car loan?",
            "Why did my food spending increase?",
            "What if I lose my job for 3 months?"
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              💡 {chip}
            </button>
          ))}
        </div>
      )}

      {/* MESSAGES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              className={m.sender === 'user' ? 'btn-gold' : 'fintech-card-elevated'}
              style={{
                maxWidth: '750px',
                padding: '24px',
                borderRadius: '16px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #C9A96A 0%, #B39152 100%)' : '#151515',
                color: m.sender === 'user' ? '#050505' : '#FFF',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-gold)'
              }}
            >
              {m.badge && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-gold" style={{ fontSize: '0.75rem' }}>{m.badge}</span>
                  {m.tools && m.tools.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tools: {m.tools.join(', ')}</span>
                  )}
                </div>
              )}

              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</p>

              {m.insights && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {m.insights.map((ins, i) => (
                    <div key={i} style={{ background: '#101010', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
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
      <form onSubmit={(e) => { e.preventDefault(); handleSend(inputMessage); }} className="fintech-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ask anything about your money (e.g. 'Can I afford a ₹15 lakh car loan?')..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          className="fintech-input"
          style={{ border: 'none', background: 'transparent' }}
        />
        <button type="submit" className="btn-gold" disabled={loading}>
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
