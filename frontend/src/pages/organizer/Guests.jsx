import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { QRCodeSVG } from 'qrcode.react';

export default function OrganizerGuests() {
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ eventId: '', rsvpStatus: '', search: '', dietaryPreference: '' });
  const [newGuest, setNewGuest] = useState({ name: '', email: '', eventId: '', dietaryPreferences: '' });
  const [message, setMessage] = useState('');
  const [ticketModal, setTicketModal] = useState(null);

  const load = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    api(`/guests?${params}`).then(setGuests).catch(console.error);
  };

  useEffect(() => {
    api('/events').then((evts) => {
      setEvents(evts);
      if (evts.length) setNewGuest((g) => ({ ...g, eventId: evts[0]._id }));
    });
    load();
  }, []);

  const sendInvite = async (id) => {
    await api(`/guests/${id}/invite`, { method: 'POST' });
    load();
  };

  const inviteAll = async () => {
    if (!filters.eventId) return setMessage('Select an event first to send bulk invites');
    await api('/guests/invite-all', { method: 'POST', body: JSON.stringify({ eventId: filters.eventId }) });
    setMessage('Bulk invitations sent');
    load();
  };

  const addGuest = async () => {
    await api('/guests', { method: 'POST', body: JSON.stringify(newGuest) });
    setNewGuest({ name: '', email: '', eventId: events[0]?._id || '', dietaryPreferences: '' });
    setMessage('Guest added');
    load();
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Ticket_${ticketModal.name.replace(/\s+/g, '_')}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div>
      <h1 className="page-title">Guest Management</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h3>Add Guest</h3>
        <div className="grid grid-2">
          <div className="form-group"><label>Name</label><input value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} /></div>
          <div className="form-group"><label>Email</label><input value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} /></div>
          <div className="form-group">
            <label>Event</label>
            <select value={newGuest.eventId} onChange={(e) => setNewGuest({ ...newGuest, eventId: e.target.value })}>
              {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Dietary Preferences</label><input value={newGuest.dietaryPreferences} onChange={(e) => setNewGuest({ ...newGuest, dietaryPreferences: e.target.value })} /></div>
        </div>
        <button type="button" className="btn" onClick={addGuest}>Add Guest</button>
      </div>

      <div className="filters card">
        <select value={filters.eventId} onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}>
          <option value="">All events</option>
          {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select value={filters.rsvpStatus} onChange={(e) => setFilters({ ...filters, rsvpStatus: e.target.value })}>
          <option value="">All RSVP</option>
          <option value="attending">Attending</option>
          <option value="not_attending">Not Attending</option>
          <option value="maybe">Maybe</option>
          <option value="pending">Pending</option>
        </select>
        <input placeholder="Dietary preference" value={filters.dietaryPreference} onChange={(e) => setFilters({ ...filters, dietaryPreference: e.target.value })} />
        <input placeholder="Search name/email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <button type="button" className="btn" onClick={load}>Filter</button>
        <button type="button" className="btn btn-secondary" onClick={inviteAll}>Send All Invites</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>RSVP</th><th>Ticket Code</th><th>Check-In</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g._id}>
                <td>{g.name}</td>
                <td>{g.email}</td>
                <td><span className={`badge badge-${g.rsvpStatus}`}>{g.rsvpStatus}</span></td>
                <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>{g.checkInCode || '—'}</code></td>
                <td><span className={`badge badge-${g.checkInStatus}`}>{g.checkInStatus?.replace('_', ' ')}</span></td>
                <td>
                  {!g.invitationSent && (
                    <button type="button" className="btn btn-sm" onClick={() => sendInvite(g._id)}>Send Invite</button>
                  )}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setTicketModal(g)} style={{ marginLeft: '0.5rem' }}>View Ticket</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket Modal */}
      {ticketModal && (
        <div className="modal-backdrop" onClick={() => setTicketModal(null)}>
          <div className="modal card ticket-card" onClick={e => e.stopPropagation()}>
            <div className="ticket-header">
              <h3>{events.find(e => e._id === ticketModal.eventId)?.name || 'Event Ticket'}</h3>
              <span className={`badge badge-${ticketModal.rsvpStatus}`}>{ticketModal.rsvpStatus}</span>
            </div>
            <div className="ticket-body">
              <div className="ticket-info">
                <p className="guest-name">{ticketModal.name}</p>
                <p className="guest-email">{ticketModal.email}</p>
                {ticketModal.dietaryPreferences && <p className="guest-diet">Dietary: {ticketModal.dietaryPreferences}</p>}
                <p className="ticket-code">Code: <strong>{ticketModal.checkInCode}</strong></p>
              </div>
              <div className="ticket-qr">
                <QRCodeSVG value={ticketModal.checkInCode} size={150} level="M" includeMargin={true} />
              </div>
            </div>
            <div className="ticket-footer">
              <button className="btn btn-secondary" onClick={handlePrint}>Print Ticket</button>
              <button className="btn" onClick={() => setTicketModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
