import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function OrganizerBudget() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [budget, setBudget] = useState(null);
  const [expense, setExpense] = useState({ category: '', description: '', amount: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/events').then((evts) => {
      setEvents(evts);
      if (evts.length) setEventId(evts[0]._id);
    });
  }, []);

  useEffect(() => {
    if (eventId) api(`/budgets/${eventId}`).then(setBudget).catch(console.error);
  }, [eventId]);

  const saveBudget = async () => {
    await api(`/budgets/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({
        plannedTotal: budget.plannedTotal,
        breakdown: budget.breakdown,
        actualExpenses: budget.actualExpenses,
      }),
    });
    setMessage('Budget saved successfully');
  };

  const addExpense = async () => {
    await api(`/budgets/${eventId}/expenses`, { method: 'POST', body: JSON.stringify({ ...expense, amount: Number(expense.amount) }) });
    api(`/budgets/${eventId}`).then(setBudget);
    setExpense({ category: '', description: '', amount: '' });
  };

  const actualTotal = (budget?.actualExpenses || []).reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <h1 className="page-title">Budget Management</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="form-group">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      {budget && (
        <>
          <div className="grid grid-3 card">
            <div className="stat"><div className="stat-value">EGP {budget.plannedTotal?.toLocaleString()}</div><div className="stat-label">Planned</div></div>
            <div className="stat"><div className="stat-value">EGP {actualTotal.toLocaleString()}</div><div className="stat-label">Actual</div></div>
            <div className="stat"><div className="stat-value">EGP {(budget.plannedTotal - actualTotal).toLocaleString()}</div><div className="stat-label">Difference</div></div>
          </div>

          <div className="card">
            <h3>Edit Planned Budget</h3>
            <div className="form-group">
              <label>Planned Total (EGP)</label>
              <input type="number" value={budget.plannedTotal || 0} onChange={(e) => setBudget({ ...budget, plannedTotal: Number(e.target.value) })} />
            </div>
            <button type="button" className="btn" onClick={saveBudget}>Save Budget</button>
          </div>

          <div className="card">
            <h3>Budget Breakdown</h3>
            <table>
              <thead><tr><th>Category</th><th>Planned (EGP)</th></tr></thead>
              <tbody>
                {(budget.breakdown || []).map((b) => (
                  <tr key={b.category}><td>{b.category}</td><td>{b.planned?.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Actual Expenses</h3>
            <table>
              <thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
              <tbody>
                {(budget.actualExpenses || []).map((e) => (
                  <tr key={e.id}><td>{e.category}</td><td>{e.description}</td><td>EGP {e.amount?.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Add Expense</h3>
            <div className="form-group"><input placeholder="Category" value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })} /></div>
            <div className="form-group"><input placeholder="Description" value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} /></div>
            <div className="form-group"><input type="number" placeholder="Amount" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} /></div>
            <button type="button" className="btn" onClick={addExpense}>Add Expense</button>
          </div>
        </>
      )}
    </div>
  );
}
