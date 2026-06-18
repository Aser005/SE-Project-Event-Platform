import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function GuestInvitations() {
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState({});
  const [rsvpForms, setRsvpForms] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/guests').then(async (records) => {
      setGuests(records);
      const forms = {};
      records.forEach((g) => {
        forms[g._id] = { dietaryPreferences: g.dietaryPreferences || '', specialRequirements: g.specialRequirements || '' };
      });
      setRsvpForms(forms);
      const evts = {};
      for (const g of records) {
        if (!evts[g.eventId]) {
          try { evts[g.eventId] = await api(`/events/${g.eventId}`); } catch { /* ignore */ }
        }
      }
      setEvents(evts);
    }).catch(console.error);
  }, []);

  const rsvp = async (id, rsvpStatus) => {
    try {
      const form = rsvpForms[id] || {};
      await api(`/guests/${id}/rsvp`, {
        method: 'PATCH',
        body: JSON.stringify({ rsvpStatus, ...form }),
      });
      setMessage('RSVP submitted! You will receive a confirmation message.');
      api('/guests').then(setGuests);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">My Invitations</h1>
      {message && <div className="alert alert-success">{message}</div>}
      {guests.map((g) => {
        const event = events[g.eventId];
        return (
          <div key={g._id} className="card">
            <h3>{event?.name || 'Event'}</h3>
            {event && (
              <>
                <p>Date: {event.date} at {event.time}</p>
                <p>Dress code: {event.dressCode}</p>
                <p>Agenda: {event.agenda}</p>
              </>
            )}
            <p>Current RSVP: <span className={`badge badge-${g.rsvpStatus}`}>{g.rsvpStatus}</span></p>
            <div className="form-group">
              <label>Dietary Preferences</label>
              <input
                value={rsvpForms[g._id]?.dietaryPreferences || ''}
                onChange={(e) => setRsvpForms({ ...rsvpForms, [g._id]: { ...rsvpForms[g._id], dietaryPreferences: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label>Special Requirements</label>
              <input
                value={rsvpForms[g._id]?.specialRequirements || ''}
                onChange={(e) => setRsvpForms({ ...rsvpForms, [g._id]: { ...rsvpForms[g._id], specialRequirements: e.target.value } })}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button type="button" className="btn btn-sm" onClick={() => rsvp(g._id, 'attending')}>Attending</button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => rsvp(g._id, 'not_attending')}>Not Attending</button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => rsvp(g._id, 'maybe')}>Maybe</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
