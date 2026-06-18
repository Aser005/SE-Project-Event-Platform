import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VendorDeliveries() {
  const [requests, setRequests] = useState([]);
  const [delayNotes, setDelayNotes] = useState({});

  useEffect(() => {
    api('/vendors/requests').then(setRequests).catch(console.error);
  }, []);

  const updateDelivery = async (id, deliveryStatus) => {
    await api(`/vendors/requests/${id}/delivery`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryStatus, delayNote: delayNotes[id] || '' }),
    });
    api('/vendors/requests').then(setRequests);
  };

  const accepted = requests.filter((r) => r.status === 'accepted');

  return (
    <div>
      <h1 className="page-title">Deliveries</h1>
      <div className="card">
        <table>
          <thead><tr><th>Items</th><th>Delivery Date</th><th>Status</th><th>Delay Note</th><th>Update</th></tr></thead>
          <tbody>
            {accepted.map((r) => (
              <tr key={r._id}>
                <td>{r.items?.map((i) => i.name).join(', ')}</td>
                <td>{r.deliveryDate}</td>
                <td>{r.deliveryStatus}</td>
                <td><input placeholder="Notify organizer of delay" value={delayNotes[r._id] || ''} onChange={(e) => setDelayNotes({ ...delayNotes, [r._id]: e.target.value })} /></td>
                <td>
                  <select value={r.deliveryStatus} onChange={(e) => updateDelivery(r._id, e.target.value)}>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
