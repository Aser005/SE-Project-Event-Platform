import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VenueListings() {
  const [venues, setVenues] = useState([]);
  const [editing, setEditing] = useState(null);
  const [unavailableDate, setUnavailableDate] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', location: { city: 'Cairo', area: '', address: '' },
    capacity: 100, dimensions: 200, amenities: ['WiFi'], pricing: { daily: 25000 }, photos: [],
  });

  const load = () => api('/venues/mine').then(setVenues).catch(console.error);

  useEffect(() => { load(); }, []);

  const create = async () => {
    await api('/venues', { method: 'POST', body: JSON.stringify(form) });
    load();
    setForm({ name: '', description: '', location: { city: 'Cairo', area: '', address: '' }, capacity: 100, dimensions: 200, amenities: ['WiFi'], pricing: { daily: 25000 }, photos: [] });
  };

  const saveEdit = async () => {
    await api(`/venues/${editing._id}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null);
    load();
  };

  const deactivate = async (id) => {
    await api(`/venues/${id}/deactivate`, { method: 'PATCH' });
    load();
  };

  const markUnavailable = async (venueId, dates) => {
    await api(`/venues/${venueId}/availability`, { method: 'PATCH', body: JSON.stringify({ unavailableDates: dates }) });
    load();
  };

  return (
    <div>
      <h1 className="page-title">My Venue Listings</h1>
      <div className="grid grid-2">
        {venues.map((v) => (
          <div key={v._id} className="card">
            <h3>{v.name}</h3>
            <p>{v.location.city} · {v.capacity} guests · {v.dimensions}m²</p>
            <p>{v.description}</p>
            <p>EGP {v.pricing?.daily?.toLocaleString()}/day</p>
            <p>Unavailable dates: {(v.unavailableDates || []).join(', ') || 'None'}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm" onClick={() => setEditing({ ...v })}>Edit</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => deactivate(v._id)}>Deactivate</button>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <input type="date" value={unavailableDate} onChange={(e) => setUnavailableDate(e.target.value)} />
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => markUnavailable(v._id, [...(v.unavailableDates || []), unavailableDate])}>Mark Unavailable</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="card">
          <h3>Edit Listing</h3>
          <div className="form-group"><label>Name</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div className="form-group"><label>Description</label><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div className="form-group"><label>Daily Price</label><input type="number" value={editing.pricing?.daily || 0} onChange={(e) => setEditing({ ...editing, pricing: { ...editing.pricing, daily: Number(e.target.value) } })} /></div>
          <div className="form-group"><label>Photo URLs (comma separated)</label><input value={(editing.photos || []).join(', ')} onChange={(e) => setEditing({ ...editing, photos: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
          <button type="button" className="btn" onClick={saveEdit}>Save</button>
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
        </div>
      )}

      <div className="card">
        <h3>Create New Listing</h3>
        <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group"><label>City</label><input value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} /></div>
        <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
        <div className="form-group"><label>Dimensions (m²)</label><input type="number" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: Number(e.target.value) })} /></div>
        <button type="button" className="btn" onClick={create}>Create Listing</button>
      </div>
    </div>
  );
}
