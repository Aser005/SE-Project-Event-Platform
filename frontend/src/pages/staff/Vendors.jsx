import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function StaffVendors() {
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    api('/events').then(async (evts) => {
      setEvents(evts);
      if (evts.length) {
        const v = await api(`/vendors/event/${evts[0]._id}`);
        setVendors(v);
      }
    });
  }, []);

  const markDelivered = async (id) => {
    await api(`/vendors/requests/${id}/delivery`, { method: 'PATCH', body: JSON.stringify({ deliveryStatus: 'delivered' }) });
    if (events.length) api(`/vendors/event/${events[0]._id}`).then(setVendors);
  };

  return (
    <div>
      <h1 className="page-title">Vendor Arrivals</h1>
      <div className="card">
        <table>
          <thead><tr><th>Items</th><th>Delivery Status</th><th>Action</th></tr></thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td>{v.items?.map((i) => i.name).join(', ')}</td>
                <td><span className={`badge badge-${v.deliveryStatus}`}>{v.deliveryStatus}</span></td>
                <td>
                  {v.deliveryStatus !== 'delivered' && (
                    <button type="button" className="btn btn-sm" onClick={() => markDelivered(v._id)}>Mark Arrived</button>
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
