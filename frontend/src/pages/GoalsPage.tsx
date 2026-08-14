import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // Form Fields - Create Goal
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSavings, setInitialSavings] = useState('0');
  const [targetDate, setTargetDate] = useState('2028-12-31');
  const [priority, setPriority] = useState('High');
  const [monthlyContribution, setMonthlyContribution] = useState('10000');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields - Add Money
  const [addAmount, setAddAmount] = useState('');
  const [addNote, setAddNote] = useState('');

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/goals/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setGoals(data.map((g: any) => ({
            id: g.id,
            name: g.goal_name,
            target: g.target_amount,
            current: g.current_amount,
            monthly: g.monthly_contribution,
            targetDate: g.target_date,
            priority: g.priority || 'Medium',
            status: g.status || 'In Progress'
          })));
        }
      }
    } catch (e) {
      // Keep empty list fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch('/api/v1/goals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          goal_name: goalName,
          target_amount: parseFloat(targetAmount),
          current_amount: parseFloat(initialSavings || '0'),
          target_date: targetDate,
          priority,
          monthly_contribution: parseFloat(monthlyContribution || '0')
        })
      });

      if (res.ok) {
        const created = await res.json();
        const newGoal = {
          id: created.id || Date.now(),
          name: created.goal_name,
          target: created.target_amount,
          current: created.current_amount,
          monthly: created.monthly_contribution,
          targetDate: created.target_date,
          priority: created.priority,
          status: created.status || 'In Progress'
        };
        setGoals(prev => [newGoal, ...prev]);
        setIsCreateOpen(false);
        setGoalName('');
        setTargetAmount('');
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to create goal", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !addAmount) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem('artha_token') || '';
      const res = await fetch(`/api/v1/goals/${selectedGoal.id}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(addAmount),
          note: addNote
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedGoal = data.goal;
        setGoals(prev => prev.map(g => g.id === selectedGoal.id ? {
          ...g,
          current: updatedGoal.current_amount,
          status: updatedGoal.status
        } : g));

        setIsAddMoneyOpen(false);
        setAddAmount('');
        setAddNote('');
        setSelectedGoal(null);
      }
    } catch (err) {
      console.error("Failed to add contribution", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', background: 'var(--bg-dark)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-cream)' }}>Financial Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track target dates, monthly SIP contributions, and persistent goal progress</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn-gold">
          <Plus size={16} /> Create Goal
        </button>
      </div>

      {/* GOALS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {goals.length === 0 ? (
          <div className="fintech-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            {loading ? 'Loading goals from PostgreSQL...' : 'No active financial goals yet. Click "Create Goal" to set your first target!'}
          </div>
        ) : (
          goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const isHighPriority = g.priority === 'High';

            return (
              <div key={g.id} className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className={isHighPriority ? "badge-coral" : "badge-gold"}>{g.priority} Priority</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target: {g.targetDate}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '16px' }}>{g.name}</h3>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Saved: ₹{g.current.toLocaleString('en-IN')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-gold)', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#1B1B1B', padding: '12px', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Amount</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>₹{g.target.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly SIP</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>₹{g.monthly.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {g.status}</span>
                  <button onClick={() => { setSelectedGoal(g); setIsAddMoneyOpen(true); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    + Add Money
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px'
        }}>
          <div className="fintech-card-elevated" style={{ width: '100%', maxWidth: '480px', padding: '28px', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-cream)' }}>Create Financial Goal</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Purchase, Europe Trip, House Downpayment"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="fintech-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialSavings}
                    onChange={e => setInitialSavings(e.target.value)}
                    className="fintech-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="fintech-input" style={{ background: '#101010', color: '#FFF' }}>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Monthly SIP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15000"
                    value={monthlyContribution}
                    onChange={e => setMonthlyContribution(e.target.value)}
                    className="fintech-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MONEY MODAL */}
      {isAddMoneyOpen && selectedGoal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px'
        }}>
          <div className="fintech-card-elevated" style={{ width: '100%', maxWidth: '440px', padding: '28px', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-cream)' }}>Add Money to Goal</h3>
              <button onClick={() => setIsAddMoneyOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#1B1B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{selectedGoal.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: ₹{selectedGoal.target.toLocaleString('en-IN')} | Currently Saved: ₹{selectedGoal.current.toLocaleString('en-IN')}</div>
            </div>

            <form onSubmit={handleAddMoney} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Contribution Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="5000"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Note / Memo (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. August bonus deposit"
                  value={addNote}
                  onChange={e => setAddNote(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddMoneyOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Saving...' : 'Add Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
