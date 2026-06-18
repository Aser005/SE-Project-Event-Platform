import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function OrganizerVendors() {
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [newRequest, setNewRequest] = useState({ vendorId: '', eventId: '', items: 'Buffet dinner x150' });

  useEffect(() => {
    api('/vendors').then(setVendors).catch(console.error);
    api('/vendors/requests').then(setRequests).catch(console.error);
    api('/invoices').then(setInvoices).catch(console.error);
    api('/events').then(setEvents).catch(console.error);
  }, []);

  const filtered = vendors.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.profile?.supplies?.toLowerCase().includes(search.toLowerCase())
  );

  const submitRequest = async () => {
    const items = [{ name: newRequest.items, quantity: 1 }];
    await api('/vendors/requests', {
      method: 'POST',
      body: JSON.stringify({
        vendorId: newRequest.vendorId,
        eventId: newRequest.eventId,
        items,
        deliveryDate: new Date().toISOString().slice(0, 10),
        eventLocation: 'Event venue',
      }),
    });
    api('/vendors/requests').then(setRequests);
  };

  const reviewInvoice = async (id, status) => {
    await api(`/invoices/${id}/review`, { method: 'PATCH', body: JSON.stringify({ status }) });
    api('/invoices').then(setInvoices);
  };

  return (
    <div>
      <h1 className="page-title">Vendor Coordination</h1>

      <div className="filters card">
        <input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-2">
        {filtered.map((v) => (
          <div key={v._id} className="card">
            <h3>{v.profile?.companyName || v.name}</h3>
            <p>Supplies: {v.profile?.supplies}</p>
            <p>Location: {v.profile?.location}</p>
            <ul>{v.profile?.pricingList?.map((p) => <li key={p.item}>{p.item}: EGP {p.price}</li>)}</ul>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Create Sourcing Request</h3>
        <div className="form-group">
          <select value={newRequest.vendorId} onChange={(e) => setNewRequest({ ...newRequest, vendorId: e.target.value })}>
            <option value="">Select vendor</option>
            {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <select value={newRequest.eventId} onChange={(e) => setNewRequest({ ...newRequest, eventId: e.target.value })}>
            <option value="">Select event</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <input value={newRequest.items} onChange={(e) => setNewRequest({ ...newRequest, items: e.target.value })} />
        </div>
        <button type="button" className="btn" onClick={submitRequest}>Submit Request</button>
      </div>

      <div className="card">
        <h3>Sourcing Requests</h3>
        <table>
          <thead><tr><th>Items</th><th>Status</th><th>Delivery</th></tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.items?.map((i) => i.name).join(', ')}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                <td>{r.deliveryStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Invoices</h3>
        <table>
          <thead><tr><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>EGP {inv.amount?.toLocaleString()}</td>
                <td>{inv.status}</td>
                <td>
                  {inv.status === 'pending_review' && (
                    <>
                      <button type="button" className="btn btn-sm" onClick={() => reviewInvoice(inv._id, 'approved')}>Approve</button>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => reviewInvoice(inv._id, 'declined')}>Decline</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
