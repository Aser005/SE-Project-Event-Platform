import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VenueConfirmed() {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', venueId: '' });
  const [venues, setVenues] = useState([]);

  const load = () => {
    const params = new URLSearchParams({ status: 'approved', ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
    api(`/bookings?${params}`).then(setBookings).catch(console.error);
  };

  useEffect(() => {
    api('/venues/mine').then(setVenues).catch(console.error);
    load();
  }, []);

  const upcoming = bookings.filter((b) => b.date >= new Date().toISOString().slice(0, 10));

  return (
    <div>
      <h1 className="page-title">Confirmed Bookings</h1>
      {upcoming.length > 0 && (
        <div className="alert alert-success">Reminder: {upcoming.length} upcoming confirmed booking(s)</div>
      )}
      <div className="filters card">
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        <select value={filters.venueId} onChange={(e) => setFilters({ ...filters, venueId: e.target.value })}>
          <option value="">All venues</option>
          {venues.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
        </select>
        <button type="button" className="btn" onClick={load}>Filter</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Organizer</th><th>Event</th><th>Date</th><th>Attendees</th><th>Contact</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.organizerName}</td>
                <td>{b.eventType}</td>
                <td>{b.date}</td>
                <td>{b.expectedAttendees}</td>
                <td>{b.organizerContact ? `${b.organizerContact.email} · ${b.organizerContact.phone || 'N/A'}` : b.organizerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
