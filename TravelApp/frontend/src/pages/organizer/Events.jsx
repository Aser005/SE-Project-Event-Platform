import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import FloorPlanEditor from './FloorPlan';

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [showPlan, setShowPlan] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', date: '', time: '', type: 'conference', expectedAttendees: '', status: 'planning', dressCode: '', agenda: ''
  });

  const loadEvents = () => {
    api('/events').then(setEvents).catch(console.error);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openModal = (evt = null) => {
    if (evt) {
      setEditingEvent(evt);
      setFormData({
        name: evt.name || '',
        date: evt.date || '',
        time: evt.time || '',
        type: evt.type || 'conference',
        expectedAttendees: evt.expectedAttendees || '',
        status: evt.status || 'planning',
        dressCode: evt.dressCode || '',
        agenda: evt.agenda || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: '', date: '', time: '', type: 'conference', expectedAttendees: '', status: 'planning', dressCode: '', agenda: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api(`/events/${editingEvent._id}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await api('/events', { method: 'POST', body: JSON.stringify(formData) });
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  if (showPlan) {
    return (
      <div>
        <button type="button" className="btn btn-secondary" onClick={() => setShowPlan(false)}>← Back to Events</button>
        <FloorPlanEditor />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Events</h1>
        <div>
          <button type="button" className="btn" onClick={() => openModal()} style={{ marginRight: '0.5rem' }}>+ Create Event</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowPlan(true)}>Floor Plan Designer</button>
        </div>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Date</th><th>Type</th><th>Attendees</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}>
                <td>{e.name}</td>
                <td>{e.date} {e.time}</td>
                <td>{e.type}</td>
                <td>{e.expectedAttendees}</td>
                <td><span className={`badge badge-${e.status === 'completed' ? 'done' : 'pending'}`}>{e.status}</span></td>
                <td>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(e)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Event Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Event Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="conference">Conference</option>
                    <option value="wedding">Wedding</option>
                    <option value="party">Party</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Expected Attendees</label>
                  <input type="number" required value={formData.expectedAttendees} onChange={e => setFormData({...formData, expectedAttendees: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Dress Code</label>
                <input placeholder="e.g. Smart Casual, Formal, Black Tie" value={formData.dressCode} onChange={e => setFormData({...formData, dressCode: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Agenda / Schedule Overview</label>
                <textarea rows="3" placeholder="e.g. 6PM: Reception, 7PM: Dinner, 9PM: Dancing" value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
