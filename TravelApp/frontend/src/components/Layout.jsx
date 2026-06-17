import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  organizer: [
    { to: '/organizer', label: 'Dashboard' },
    { to: '/organizer/events', label: 'Events' },
    { to: '/organizer/venues', label: 'Venue Search' },
    { to: '/organizer/bookings', label: 'Bookings' },
    { to: '/organizer/tasks', label: 'Tasks & Staff' },
    { to: '/organizer/guests', label: 'Guests' },
    { to: '/organizer/vendors', label: 'Vendors' },
    { to: '/organizer/budget', label: 'Budget' },
    { to: '/organizer/floor-plan', label: 'Floor Plan' },
    { to: '/organizer/day-of', label: 'Day-Of Ops' },
    { to: '/organizer/reports', label: 'Reports' },
    { to: '/organizer/accounts', label: 'Accounts' },
    { to: '/organizer/profile', label: 'Profile' },
  ],
  staff: [
    { to: '/staff', label: 'Dashboard' },
    { to: '/staff/tasks', label: 'My Tasks' },
    { to: '/staff/floor-plan', label: 'Floor Plan' },
    { to: '/staff/check-in', label: 'Guest Check-In' },
    { to: '/staff/vendors', label: 'Vendor Arrivals' },
  ],
  vendor: [
    { to: '/vendor', label: 'Dashboard' },
    { to: '/vendor/requests', label: 'Sourcing Requests' },
    { to: '/vendor/deliveries', label: 'Deliveries' },
    { to: '/vendor/invoices', label: 'Invoices' },
    { to: '/vendor/profile', label: 'Profile' },
  ],
  guest: [
    { to: '/guest', label: 'My Invitations' },
    { to: '/guest/messages', label: 'Day-Of Messages' },
    { to: '/guest/check-in', label: 'Check-In Pass' },
    { to: '/guest/feedback', label: 'Feedback' },
  ],
  venue_owner: [
    { to: '/venue', label: 'Dashboard' },
    { to: '/venue/listings', label: 'My Listings' },
    { to: '/venue/bookings', label: 'Booking Requests' },
    { to: '/venue/confirmed', label: 'Confirmed Bookings' },
    { to: '/venue/profile', label: 'Profile' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Event Platform</h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>
          {user?.name} ({user?.role?.replace('_', ' ')})
        </p>
        <nav>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to.split('/').length <= 2}>
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="link" onClick={logout} style={{ marginTop: '1rem' }}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
