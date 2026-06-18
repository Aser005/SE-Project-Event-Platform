import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventId: '', amount: '', lineItems: 'Service fee', attachmentNote: '' });

  useEffect(() => {
    api('/invoices').then(setInvoices).catch(console.error);
    api('/events').then(setEvents).catch(console.error);
  }, []);

  const submit = async () => {
    const event = events.find((e) => e._id === form.eventId);
    if (!event) return;
    await api('/invoices', {
      method: 'POST',
      body: JSON.stringify({
        eventId: form.eventId,
        organizerId: event.organizerId,
        amount: Number(form.amount),
        lineItems: [{ item: form.lineItems, amount: Number(form.amount) }],
        attachmentNote: form.attachmentNote,
      }),
    });
    api('/invoices').then(setInvoices);
  };

  return (
    <div>
      <h1 className="page-title">Invoices</h1>
      <div className="card">
        <h3>Submit Invoice</h3>
        <div className="form-group">
          <select value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })}>
            <option value="">Select event</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-group"><input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
        <div className="form-group"><input placeholder="Line item description" value={form.lineItems} onChange={(e) => setForm({ ...form, lineItems: e.target.value })} /></div>
        <div className="form-group"><input placeholder="Supporting document notes" value={form.attachmentNote} onChange={(e) => setForm({ ...form, attachmentNote: e.target.value })} /></div>
        <button type="button" className="btn" onClick={submit}>Submit</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Amount</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}><td>EGP {inv.amount?.toLocaleString()}</td><td>{inv.status}</td><td>{new Date(inv.submittedAt).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
