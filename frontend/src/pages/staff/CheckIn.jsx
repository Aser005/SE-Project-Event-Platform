import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function GuestCheckIn() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [guests, setGuests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [checkInCode, setCheckInCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/events').then((evts) => {
      setEvents(evts);
      if (evts.length) setEventId(evts[0]._id);
    });
  }, []);

  const load = () => {
    if (!eventId) return;
    const params = new URLSearchParams({ eventId });
    if (statusFilter) params.set('checkInStatus', statusFilter);
    api(`/guests?${params}`).then(setGuests).catch(console.error);
  };

  useEffect(() => { load(); }, [eventId, statusFilter]);

  const checkIn = async (id) => {
    await api(`/guests/${id}/checkin`, { method: 'PATCH' });
    load();
  };

  const checkInByCode = async () => {
    try {
      const res = await api('/guests/check-in-by-code', { method: 'PATCH', body: JSON.stringify({ code: checkInCode }) });
      setMessage(`Checked in: ${res.guest.name}`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Guest Check-In</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h3>Scan / Enter QR Code</h3>
        <div className="form-group"><input placeholder="Guest check-in code" value={checkInCode} onChange={(e) => setCheckInCode(e.target.value)} /></div>
        <button type="button" className="btn" onClick={checkInByCode}>Check In by Code</button>
      </div>

      <div className="filters card">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="not_arrived">Not Arrived</option>
          <option value="arrived">Arrived</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Code</th><th>RSVP</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g._id}>
                <td>{g.name}</td>
                <td>{g.email}</td>
                <td>{g.checkInCode}</td>
                <td>{g.rsvpStatus}</td>
                <td><span className={`badge badge-${g.checkInStatus}`}>{g.checkInStatus?.replace('_', ' ')}</span></td>
                <td>
                  {g.checkInStatus !== 'arrived' && (
                    <button type="button" className="btn btn-sm" onClick={() => checkIn(g._id)}>Check In</button>
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
