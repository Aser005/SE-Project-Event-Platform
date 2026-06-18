import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VenueBookings() {
  const [bookings, setBookings] = useState([]);
  const [counterForms, setCounterForms] = useState({});

  useEffect(() => {
    api('/bookings?status=pending').then(setBookings).catch(console.error);
  }, []);

  const respond = async (id, status) => {
    const extra = counterForms[id] || {};
    await api(`/bookings/${id}/respond`, { method: 'PATCH', body: JSON.stringify({ status, ...extra }) });
    api('/bookings?status=pending').then(setBookings);
  };

  return (
    <div>
      <h1 className="page-title">Booking Requests</h1>
      <div className="card">
        <table>
          <thead><tr><th>Organizer</th><th>Event Type</th><th>Date</th><th>Attendees</th><th>Requirements</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.organizerName}</td>
                <td>{b.eventType}</td>
                <td>{b.date}</td>
                <td>{b.expectedAttendees}</td>
                <td>{b.specialRequirements || '—'}</td>
                <td>
                  <div className="form-group"><input placeholder="Counter message" value={counterForms[b._id]?.counterMessage || ''} onChange={(e) => setCounterForms({ ...counterForms, [b._id]: { ...counterForms[b._id], counterMessage: e.target.value } })} /></div>
                  <div className="form-group"><input type="number" placeholder="Adjusted pricing" value={counterForms[b._id]?.adjustedPricing || ''} onChange={(e) => setCounterForms({ ...counterForms, [b._id]: { ...counterForms[b._id], adjustedPricing: Number(e.target.value) } })} /></div>
                  <button type="button" className="btn btn-sm" onClick={() => respond(b._id, 'approved')}>Approve</button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => respond(b._id, 'declined')}>Decline</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
