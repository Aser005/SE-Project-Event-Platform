import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function GuestFeedback() {
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState({
    eventId: '',
    guestRecordId: '',
    overallRating: 5,
    foodRating: 5,
    venueRating: 5,
    organizationRating: 5,
    comments: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/guests').then((records) => {
      setGuests(records);
      if (records.length) {
        setForm((f) => ({ ...f, eventId: records[0].eventId, guestRecordId: records[0]._id }));
      }
    }).catch(console.error);
  }, []);

  const submit = async () => {
    try {
      const res = await api('/feedback', { method: 'POST', body: JSON.stringify(form) });
      setMessage(res.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Post-Event Feedback</h1>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <div className="form-group">
          <label>Event</label>
          <select
            value={form.guestRecordId}
            onChange={(e) => {
              const guest = guests.find((g) => g._id === e.target.value);
              setForm({ ...form, guestRecordId: e.target.value, eventId: guest?.eventId || '' });
            }}
          >
            {guests.map((g) => <option key={g._id} value={g._id}>Event {g.eventId}</option>)}
          </select>
        </div>
        {['overallRating', 'foodRating', 'venueRating', 'organizationRating'].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.replace('Rating', ' Rating').replace(/([A-Z])/g, ' $1')}</label>
            <select value={form[field]} onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
        <div className="form-group"><label>Comments</label><textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></div>
        <button type="button" className="btn" onClick={submit}>Submit Feedback</button>
      </div>
    </div>
  );
}
