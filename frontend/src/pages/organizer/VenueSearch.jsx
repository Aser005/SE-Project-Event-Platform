import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VenueSearch() {
  const [venues, setVenues] = useState([]);
  const [filters, setFilters] = useState({ city: '', minCapacity: '', minDimensions: '', amenity: '', date: '', search: '' });
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState({ eventType: '', expectedAttendees: '', specialRequirements: '' });
  const [message, setMessage] = useState('');

  const load = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    api(`/venues?${params}`).then(setVenues).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const submitBooking = async (venueId) => {
    try {
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({ venueId, date: filters.date || new Date().toISOString().slice(0, 10), ...booking }),
      });
      setMessage('Booking request submitted!');
      setSelected(null);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Venue Search & Booking</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="filters card">
        <input placeholder="City (e.g. Cairo)" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <input placeholder="Min capacity" type="number" value={filters.minCapacity} onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })} />
        <input placeholder="Min m²" type="number" value={filters.minDimensions} onChange={(e) => setFilters({ ...filters, minDimensions: e.target.value })} />
        <input placeholder="Amenity" value={filters.amenity} onChange={(e) => setFilters({ ...filters, amenity: e.target.value })} />
        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <button type="button" className="btn" onClick={load}>Search</button>
      </div>

      <div className="grid grid-2">
        {venues.map((v) => (
          <div key={v._id} className="card">
            <h3>{v.name}</h3>
            <p>{v.location.city}, {v.location.area} · Capacity: {v.capacity} · {v.dimensions}m²</p>
            <p>{v.description}</p>
            <p><strong>From EGP {v.pricing?.daily?.toLocaleString()}/day</strong></p>
            <p>Amenities: {v.amenities?.join(', ')}</p>
            <button type="button" className="btn btn-sm" onClick={() => setSelected(v._id)}>Apply to Book</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card">
          <h3>Submit Booking Request</h3>
          <div className="form-group">
            <label>Event Type</label>
            <input value={booking.eventType} onChange={(e) => setBooking({ ...booking, eventType: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Expected Attendees</label>
            <input type="number" value={booking.expectedAttendees} onChange={(e) => setBooking({ ...booking, expectedAttendees: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Special Requirements</label>
            <textarea value={booking.specialRequirements} onChange={(e) => setBooking({ ...booking, specialRequirements: e.target.value })} />
          </div>
          <button type="button" className="btn" onClick={() => submitBooking(selected)}>Submit</button>
          <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
