import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';

import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerEvents from './pages/organizer/Events';
import VenueSearch from './pages/organizer/VenueSearch';
import OrganizerBookings from './pages/organizer/Bookings';
import OrganizerTasks from './pages/organizer/Tasks';
import OrganizerGuests from './pages/organizer/Guests';
import OrganizerVendors from './pages/organizer/Vendors';
import OrganizerBudget from './pages/organizer/Budget';
import DayOfOps from './pages/organizer/DayOfOps';
import OrganizerReports from './pages/organizer/Reports';
import OrganizerAccounts from './pages/organizer/Accounts';
import FloorPlanEditor from './pages/organizer/FloorPlan';

import StaffDashboard from './pages/staff/Dashboard';
import StaffTasks from './pages/staff/Tasks';
import StaffFloorPlan from './pages/staff/FloorPlan';
import GuestCheckIn from './pages/staff/CheckIn';
import StaffVendors from './pages/staff/Vendors';

import VendorDashboard from './pages/vendor/Dashboard';
import VendorRequests from './pages/vendor/Requests';
import VendorDeliveries from './pages/vendor/Deliveries';
import VendorInvoices from './pages/vendor/Invoices';
import VendorProfile from './pages/vendor/Profile';

import GuestInvitations from './pages/guest/Invitations';
import GuestMessages from './pages/guest/Messages';
import GuestFeedback from './pages/guest/Feedback';
import GuestCheckInPass from './pages/guest/CheckInPass';

import VenueDashboard from './pages/venue/Dashboard';
import VenueListings from './pages/venue/Listings';
import VenueBookings from './pages/venue/Bookings';
import VenueConfirmed from './pages/venue/Confirmed';

const ROLE_HOME = {
  organizer: '/organizer',
  staff: '/staff',
  vendor: '/vendor',
  guest: '/guest',
  venue_owner: '/venue',
};

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={ROLE_HOME[user.role]} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={ROLE_HOME[user.role]} /> : <Register />} />

        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/organizer" element={<PrivateRoute roles={['organizer']}><OrganizerDashboard /></PrivateRoute>} />
          <Route path="/organizer/events" element={<PrivateRoute roles={['organizer']}><OrganizerEvents /></PrivateRoute>} />
          <Route path="/organizer/venues" element={<PrivateRoute roles={['organizer']}><VenueSearch /></PrivateRoute>} />
          <Route path="/organizer/bookings" element={<PrivateRoute roles={['organizer']}><OrganizerBookings /></PrivateRoute>} />
          <Route path="/organizer/tasks" element={<PrivateRoute roles={['organizer']}><OrganizerTasks /></PrivateRoute>} />
          <Route path="/organizer/guests" element={<PrivateRoute roles={['organizer']}><OrganizerGuests /></PrivateRoute>} />
          <Route path="/organizer/vendors" element={<PrivateRoute roles={['organizer']}><OrganizerVendors /></PrivateRoute>} />
          <Route path="/organizer/budget" element={<PrivateRoute roles={['organizer']}><OrganizerBudget /></PrivateRoute>} />
          <Route path="/organizer/day-of" element={<PrivateRoute roles={['organizer']}><DayOfOps /></PrivateRoute>} />
          <Route path="/organizer/reports" element={<PrivateRoute roles={['organizer']}><OrganizerReports /></PrivateRoute>} />
          <Route path="/organizer/accounts" element={<PrivateRoute roles={['organizer']}><OrganizerAccounts /></PrivateRoute>} />
          <Route path="/organizer/profile" element={<PrivateRoute roles={['organizer']}><ProfilePage title="Organizer Profile" /></PrivateRoute>} />
          <Route path="/organizer/floor-plan" element={<PrivateRoute roles={['organizer']}><FloorPlanEditor /></PrivateRoute>} />

          <Route path="/staff" element={<PrivateRoute roles={['staff']}><StaffDashboard /></PrivateRoute>} />
          <Route path="/staff/tasks" element={<PrivateRoute roles={['staff']}><StaffTasks /></PrivateRoute>} />
          <Route path="/staff/floor-plan" element={<PrivateRoute roles={['staff']}><StaffFloorPlan /></PrivateRoute>} />
          <Route path="/staff/check-in" element={<PrivateRoute roles={['staff']}><GuestCheckIn /></PrivateRoute>} />
          <Route path="/staff/vendors" element={<PrivateRoute roles={['staff']}><StaffVendors /></PrivateRoute>} />

          <Route path="/vendor" element={<PrivateRoute roles={['vendor']}><VendorDashboard /></PrivateRoute>} />
          <Route path="/vendor/requests" element={<PrivateRoute roles={['vendor']}><VendorRequests /></PrivateRoute>} />
          <Route path="/vendor/deliveries" element={<PrivateRoute roles={['vendor']}><VendorDeliveries /></PrivateRoute>} />
          <Route path="/vendor/invoices" element={<PrivateRoute roles={['vendor']}><VendorInvoices /></PrivateRoute>} />
          <Route path="/vendor/profile" element={<PrivateRoute roles={['vendor']}><VendorProfile /></PrivateRoute>} />

          <Route path="/guest" element={<PrivateRoute roles={['guest']}><GuestInvitations /></PrivateRoute>} />
          <Route path="/guest/messages" element={<PrivateRoute roles={['guest']}><GuestMessages /></PrivateRoute>} />
          <Route path="/guest/check-in" element={<PrivateRoute roles={['guest']}><GuestCheckInPass /></PrivateRoute>} />
          <Route path="/guest/feedback" element={<PrivateRoute roles={['guest']}><GuestFeedback /></PrivateRoute>} />

          <Route path="/venue" element={<PrivateRoute roles={['venue_owner']}><VenueDashboard /></PrivateRoute>} />
          <Route path="/venue/listings" element={<PrivateRoute roles={['venue_owner']}><VenueListings /></PrivateRoute>} />
          <Route path="/venue/bookings" element={<PrivateRoute roles={['venue_owner']}><VenueBookings /></PrivateRoute>} />
          <Route path="/venue/confirmed" element={<PrivateRoute roles={['venue_owner']}><VenueConfirmed /></PrivateRoute>} />
          <Route path="/venue/profile" element={<PrivateRoute roles={['venue_owner']}><ProfilePage title="Venue Owner Profile" /></PrivateRoute>} />
        </Route>

        <Route path="/" element={<Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
