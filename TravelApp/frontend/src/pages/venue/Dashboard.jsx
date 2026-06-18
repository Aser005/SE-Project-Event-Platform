import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VenueDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api('/venues/analytics/summary').then(setAnalytics).catch(console.error);
  }, []);

  const exportReport = () => {
    if (!analytics) return;
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'venue-performance-report.json';
    a.click();
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Venue Owner Dashboard</h1>
      <button type="button" className="btn btn-secondary" onClick={exportReport} style={{ marginBottom: '1rem' }}>Export Report</button>
      <div className="grid grid-3 card">
        <div className="stat"><div className="stat-value">{analytics.perListing.length}</div><div className="stat-label">Active Listings</div></div>
        <div className="stat"><div className="stat-value">{analytics.confirmedBookings}</div><div className="stat-label">Confirmed Bookings</div></div>
        <div className="stat"><div className="stat-value">EGP {analytics.totalRevenue.toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
      </div>
      <div className="card">
        <h3>Performance Per Listing</h3>
        <table>
          <thead><tr><th>Venue</th><th>Requests</th><th>Approved</th><th>Booking Rate</th><th>Revenue</th></tr></thead>
          <tbody>
            {analytics.perListing.map((v) => (
              <tr key={v.venueId}>
                <td>{v.venueName}</td>
                <td>{v.totalRequests}</td>
                <td>{v.approvedBookings}</td>
                <td>{v.bookingRate.toFixed(0)}%</td>
                <td>EGP {v.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
