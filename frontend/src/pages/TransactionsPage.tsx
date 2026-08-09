import React, { useState } from 'react';
import { Wallet, Search, Filter, Plus, ArrowUpRight, ArrowDownLeft, Sparkles, Calendar, Tag } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [transactions] = useState([
    { id: 1, merchant: 'Swiggy Gourmet', category: 'Food & Dining', amount: 840, date: '2026-08-07', type: 'Expense', method: 'UPI' },
    { id: 2, merchant: 'TechCorp Salary', category: 'Income', amount: 100000, date: '2026-08-01', type: 'Income', method: 'NetBanking' },
    { id: 3, merchant: 'SBI Car Loan EMI', category: 'Utilities & Bills', amount: 20758, date: '2026-08-01', type: 'Expense', method: 'AutoDebit' },
    { id: 4, merchant: 'Zomato Gold', category: 'Food & Dining', amount: 1450, date: '2026-08-04', type: 'Expense', method: 'CreditCard' },
    { id: 5, merchant: 'Nippon India SIP', category: 'Investments', amount: 15000, date: '2026-08-02', type: 'Expense', method: 'AutoDebit' },
    { id: 6, merchant: 'Uber Ride', category: 'Travel', amount: 460, date: '2026-08-06', type: 'Expense', method: 'UPI' },
  ]);

  const filtered = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Transaction Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real PostgreSQL transaction feed with automatic merchant categorization</p>
        </div>
        <button className="btn-indigo">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="fintech-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#667085" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search merchant or note..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="fintech-input"
            style={{ paddingLeft: '38px', padding: '10px 14px 10px 38px', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Food & Dining', 'Utilities & Bills', 'Investments', 'Travel'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={categoryFilter === c ? 'btn-indigo' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="fintech-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(5, 9, 20, 0.8)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px 20px' }}>Merchant / Description</th>
                <th style={{ padding: '16px 20px' }}>Category</th>
                <th style={{ padding: '16px 20px' }}>Date</th>
                <th style={{ padding: '16px 20px' }}>Payment Method</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#FFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.type === 'Income' ? 'rgba(84, 199, 163, 0.12)' : 'rgba(233, 130, 106, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t.type === 'Income' ? <ArrowDownLeft size={18} color="var(--accent-teal)" /> : <ArrowUpRight size={18} color="var(--accent-coral)" />}
                      </div>
                      {t.merchant}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className="badge-indigo" style={{ fontSize: '0.75rem' }}>{t.category}</span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{t.date}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{t.method}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: t.type === 'Income' ? 'var(--accent-teal)' : '#FFF' }}>
                    {t.type === 'Income' ? '+' : '−'}₹{t.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
