import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api('/events/dashboard/today').then(setData).catch(console.error);
    api('/events').then(setEvents).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="page-title">Organizer Dashboard</h1>
      {data && (
        <div className="grid grid-3 card">
          <div className="stat">
            <div className="stat-value">{data.todayEvents.length}</div>
            <div className="stat-label">Today&apos;s Events</div>
          </div>
          <div className="stat">
            <div className="stat-value">{data.guestStats.arrived}/{data.guestStats.total}</div>
            <div className="stat-label">Guests Arrived</div>
          </div>
          <div className="stat">
            <div className="stat-value">{data.feedbackStats.positive}/{data.feedbackStats.negative}</div>
            <div className="stat-label">Positive / Negative Feedback</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Tasks Due Today</h3>
        {data?.tasksDue?.length ? (
          <table>
            <thead><tr><th>Task</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {data.tasksDue.map((t) => (
                <tr key={t._id}><td>{t.title}</td><td><span className={`badge badge-${t.status}`}>{t.status}</span></td><td>{t.dueDate}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p>No tasks due today.</p>}
      </div>

      <div className="card">
        <h3>Upcoming Events</h3>
        <table>
          <thead><tr><th>Name</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}>
                <td>{e.name}</td>
                <td>{e.date}</td>
                <td><span className={`badge badge-${e.status === 'completed' ? 'done' : 'pending'}`}>{e.status}</span></td>
                <td><Link to={`/organizer/events?id=${e._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
