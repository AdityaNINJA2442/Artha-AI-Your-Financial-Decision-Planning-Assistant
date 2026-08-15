import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, X, Filter, ArrowUpDown, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

const CATEGORY_ID_MAP: Record<number, string> = {
  1: "Food & Dining",
  2: "Groceries",
  3: "Rent & Housing",
  4: "Utilities & Bills",
  5: "Subscriptions",
  6: "Shopping & Lifestyle",
  7: "Travel & Transport",
  8: "Medical & Health",
  9: "Investments & SIP",
  10: "Salary & Income",
  11: "Other Expenses"
};

export const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'merchant-asc'>('date-desc');
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
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
        setRawTransactions(items.map((t: any) => ({
          id: t.id,
          merchant: t.merchant,
          category: t.category_name || CATEGORY_ID_MAP[t.category_id] || (t.type === 'Income' ? 'Salary & Income' : 'Other Expenses'),
          amount: t.amount,
          date: t.date,
          type: t.type || 'Expense',
          method: t.payment_method || 'UPI'
        })));
      }
    } catch (e) {
      // Fallback
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
          category_name: categoryName,
          payment_method: paymentMethod,
          date: txDate
        })
      });

      if (res.ok) {
        const created = await res.json();
        const newTx = {
          id: created.id || Date.now(),
          merchant: created.merchant,
          category: created.category_name || categoryName,
          amount: created.amount,
          date: created.date || txDate,
          type: created.type || type,
          method: created.payment_method || paymentMethod
        };
        setRawTransactions(prev => [newTx, ...prev]);
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

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch(`/api/v1/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRawTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  // PURE DERIVED STATE: Filter and Sort without EVER mutating rawTransactions
  const displayTransactions = useMemo(() => {
    return rawTransactions
      .filter(t => {
        const matchesSearch = !searchTerm ||
          t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesCategory = true;
        if (categoryFilter !== 'All') {
          if (categoryFilter === 'Income') {
            matchesCategory = t.type === 'Income' || t.category === 'Salary & Income';
          } else if (categoryFilter === 'Food & Dining') {
            matchesCategory = t.category === 'Food & Dining' || t.category === 'Groceries';
          } else if (categoryFilter === 'Shopping') {
            matchesCategory = t.category === 'Shopping & Lifestyle' || t.category === 'Subscriptions' || t.category === 'Shopping';
          } else if (categoryFilter === 'Utilities') {
            matchesCategory = t.category === 'Utilities & Bills' || t.category === 'Rent & Housing';
          } else {
            matchesCategory = t.category === categoryFilter;
          }
        }

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'merchant-asc') return a.merchant.localeCompare(b.merchant);
        // Default: date-desc
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [rawTransactions, searchTerm, categoryFilter, sortBy]);

  // Contextual Financial Overspending & Alert Sentinel Analysis
  const expenseList = useMemo(() => rawTransactions.filter(t => t.type === 'Expense'), [rawTransactions]);
  const totalExpenseSum = useMemo(() => expenseList.reduce((acc, t) => acc + t.amount, 0), [expenseList]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenseList.forEach(t => {
      const cat = t.category || 'Other Expenses';
      totals[cat] = (totals[cat] || 0) + t.amount;
    });
    return totals;
  }, [expenseList]);

  const alerts = useMemo(() => {
    const list: { title: string; desc: string; severity: 'high' | 'medium' }[] = [];
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      const share = totalExpenseSum > 0 ? (amt / totalExpenseSum) * 100 : 0;
      if ((cat === 'Food & Dining' || cat === 'Groceries') && share > 25) {
        list.push({
          title: `High ${cat} Overspending`,
          desc: `${cat} expenses total ₹${amt.toLocaleString('en-IN')} (${share.toFixed(1)}% of overall expenses).`,
          severity: 'high'
        });
      } else if ((cat === 'Shopping & Lifestyle' || cat === 'Subscriptions') && share > 20) {
        list.push({
          title: `Shopping & Subscriptions Surge`,
          desc: `Discretionary shopping totals ₹${amt.toLocaleString('en-IN')} (${share.toFixed(1)}% of overall expenses).`,
          severity: 'medium'
        });
      }
    });

    const spikeTx = expenseList.find(t => t.amount >= 15000);
    if (spikeTx) {
      list.push({
        title: `Single Expense Spike: ${spikeTx.merchant}`,
        desc: `Large transaction outflow of ₹${spikeTx.amount.toLocaleString('en-IN')} recorded on ${spikeTx.date}.`,
        severity: 'medium'
      });
    }
    return list;
  }, [categoryTotals, totalExpenseSum, expenseList]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>Transaction Ledger & Overspending Sentinel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real PostgreSQL transaction feed with category filter, sorting, and contextual risk alerts</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-gold">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* CONTEXTUAL OVERSPENDING ALERT BANNER */}
      {alerts.length > 0 ? (
        <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alt, idx) => (
            <div 
              key={idx}
              className={alt.severity === 'high' ? 'fintech-card-elevated' : 'fintech-card'}
              style={{
                padding: '16px 20px',
                borderLeft: alt.severity === 'high' ? '4px solid #F28B8B' : '4px solid #C9A96A',
                background: alt.severity === 'high' ? 'rgba(176, 0, 0, 0.12)' : 'rgba(201, 169, 106, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}
            >
              <AlertTriangle size={20} color={alt.severity === 'high' ? 'var(--accent-coral)' : 'var(--accent-gold)'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '2px' }}>{alt.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{alt.desc}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fintech-card" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--accent-gold)' }}>
          <CheckCircle size={20} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-cream)' }}>Healthy Cash Flow Distribution</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No high category overspending or anomalous expense spikes detected.</div>
          </div>
        </div>
      )}

      {/* FILTER & SORT BAR */}
      <div className="fintech-card" style={{ padding: '18px 22px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* SEARCH INPUT */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#686868" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search merchant or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="fintech-input"
            style={{ paddingLeft: '38px', padding: '10px 14px 10px 38px', fontSize: '0.88rem' }}
          />
        </div>

        {/* CATEGORY FILTER SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--accent-gold)" />
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="fintech-input"
            style={{ minWidth: '160px', padding: '9px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="All">All Categories</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Utilities">Utilities & Housing</option>
            <option value="Shopping">Shopping & Lifestyle</option>
            <option value="Travel & Transport">Travel & Transport</option>
            <option value="Investments & SIP">Investments & SIP</option>
            <option value="Income">Salary & Income</option>
            <option value="Other Expenses">Other Expenses</option>
          </select>
        </div>

        {/* SORT BY SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <ArrowUpDown size={16} color="var(--accent-gold)" />
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as any)}
            className="fintech-input"
            style={{ minWidth: '180px', padding: '9px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="amount-desc">Amount: Highest First</option>
            <option value="amount-asc">Amount: Lowest First</option>
            <option value="merchant-asc">Merchant: A to Z</option>
          </select>
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
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading transactions from PostgreSQL...' : 'No matching transactions found.'}
                  </td>
                </tr>
              ) : (
                displayTransactions.map(t => (
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
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteTransaction(t.id)}
                        title="Delete Transaction"
                        style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '6px', padding: '6px', color: 'var(--accent-coral)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                      >
                        <Trash2 size={15} />
                      </button>
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
                    <option value="Groceries">Groceries</option>
                    <option value="Rent & Housing">Rent & Housing</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Shopping & Lifestyle">Shopping & Lifestyle</option>
                    <option value="Travel & Transport">Travel & Transport</option>
                    <option value="Medical & Health">Medical & Health</option>
                    <option value="Investments & SIP">Investments & SIP</option>
                    <option value="Salary & Income">Salary & Income</option>
                    <option value="Other Expenses">Other Expenses</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="fintech-input" style={{ background: '#101010', color: '#FFF' }}>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="Auto Debit">Auto Debit</option>
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
