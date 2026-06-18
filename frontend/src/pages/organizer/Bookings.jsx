import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api('/bookings').then(setBookings).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="page-title">My Booking Requests</h1>
      <div className="card">
        <table>
          <thead>
            <tr><th>Event Type</th><th>Date</th><th>Attendees</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.eventType}</td>
                <td>{b.date}</td>
                <td>{b.expectedAttendees}</td>
                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
