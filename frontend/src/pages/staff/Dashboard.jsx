import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function StaffDashboard() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api('/events/dashboard/today').then(setData).catch(console.error);
    api('/events').then(setEvents).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="page-title">Staff Dashboard</h1>
      {data && (
        <div className="grid grid-3 card">
          <div className="stat"><div className="stat-value">{data.todayEvents.length}</div><div className="stat-label">Today&apos;s Events</div></div>
          <div className="stat"><div className="stat-value">{data.guestStats.arrived}/{data.guestStats.total}</div><div className="stat-label">Guests Arrived</div></div>
          <div className="stat"><div className="stat-value">{data.tasksDue?.length || 0}</div><div className="stat-label">Tasks Due</div></div>
        </div>
      )}
      <div className="card">
        <h3>My Events</h3>
        <table>
          <thead><tr><th>Event</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}><td>{e.name}</td><td>{e.date}</td><td>{e.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
