import React, { useState, useEffect } from 'react';
import { Wallet, Search, Plus, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [categoryName, setCategoryName] = useState('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/transactions/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.items || []);
        setTransactions(items.map((t: any) => ({
          id: t.id,
          merchant: t.merchant,
          category: t.category_name || (t.type === 'Income' ? 'Income' : 'General'),
          amount: t.amount,
          date: t.date,
          type: t.type || 'Expense',
          method: t.payment_method || 'UPI'
        })));
      }
    } catch (e) {
      // Keep empty list fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          merchant,
          amount: parseFloat(amount),
          type,
          payment_method: paymentMethod,
          date: txDate
        })
      });

      if (res.ok) {
        const created = await res.json();
        const newTx = {
          id: created.id || Date.now(),
          merchant: created.merchant,
          category: categoryName,
          amount: created.amount,
          date: created.date || txDate,
          type: created.type || type,
          method: created.payment_method || paymentMethod
        };
        setTransactions(prev => [newTx, ...prev]);
        setIsModalOpen(false);
        setMerchant('');
        setAmount('');
      }
    } catch (err) {
      console.error("Failed to add transaction", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>Transaction Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real PostgreSQL transaction feed with automatic merchant categorization</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-gold">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="fintech-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#686868" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search merchant or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="fintech-input"
            style={{ paddingLeft: '38px', padding: '10px 14px 10px 38px', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Food & Dining', 'Utilities & Bills', 'Investments', 'Travel', 'Income'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={categoryFilter === c ? 'btn-gold' : 'btn-secondary'}
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
              <tr style={{ background: '#1B1B1B', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px 20px' }}>Merchant / Description</th>
                <th style={{ padding: '16px 20px' }}>Category</th>
                <th style={{ padding: '16px 20px' }}>Date</th>
                <th style={{ padding: '16px 20px' }}>Payment Method</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading transactions from PostgreSQL...' : 'No transactions recorded yet. Click "+ Add Transaction" to create one.'}
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-cream)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.type === 'Income' ? 'rgba(201, 169, 106, 0.12)' : 'rgba(176, 0, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {t.type === 'Income' ? <ArrowDownLeft size={18} color="var(--accent-gold)" /> : <ArrowUpRight size={18} color="var(--accent-coral)" />}
                        </div>
                        {t.merchant}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge-gold" style={{ fontSize: '0.75rem' }}>{t.category}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{t.date}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{t.method}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: t.type === 'Income' ? 'var(--accent-gold)' : 'var(--text-cream)' }}>
                      {t.type === 'Income' ? '+' : '−'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 5, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="fintech-card-elevated" style={{ width: '100%', maxWidth: '480px', padding: '28px', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-cream)' }}>Add New Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Merchant / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy, Amazon, Salary"
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="1250"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="fintech-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="fintech-input" style={{ background: '#101010', color: '#FFF' }}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={categoryName} onChange={e => setCategoryName(e.target.value)} className="fintech-input" style={{ background: '#101010', color: '#FFF' }}>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                    <option value="Investments">Investments</option>
                    <option value="Income">Income</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="fintech-input" style={{ background: '#101010', color: '#FFF' }}>
                    <option value="UPI">UPI</option>
                    <option value="CreditCard">Credit Card</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="AutoDebit">Auto Debit</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
