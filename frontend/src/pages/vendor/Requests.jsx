import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    api('/vendors/requests').then(setRequests).catch(console.error);
  }, []);

  const respond = async (id, status) => {
    await api(`/vendors/requests/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message: messages[id] || '' }),
    });
    api('/vendors/requests').then(setRequests);
  };

  return (
    <div>
      <h1 className="page-title">Sourcing Requests</h1>
      <div className="card">
        <table>
          <thead><tr><th>Items</th><th>Delivery Date</th><th>Location</th><th>Status</th><th>Clarification</th><th>Actions</th></tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.items?.map((i) => `${i.name} x${i.quantity}`).join(', ')}</td>
                <td>{r.deliveryDate}</td>
                <td>{r.eventLocation}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                <td>
                  <input placeholder="Message to organizer" value={messages[r._id] || ''} onChange={(e) => setMessages({ ...messages, [r._id]: e.target.value })} />
                  {r.vendorMessage && <p style={{ fontSize: '0.8rem' }}>Sent: {r.vendorMessage}</p>}
                </td>
                <td>
                  {r.status === 'pending' && (
                    <>
                      <button type="button" className="btn btn-sm" onClick={() => respond(r._id, 'accepted')}>Accept</button>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => respond(r._id, 'declined')}>Decline</button>
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
