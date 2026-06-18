import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  organizer: '/organizer',
  staff: '/staff',
  vendor: '/vendor',
  guest: '/guest',
  venue_owner: '/venue',
};

export default function Login() {
  const [email, setEmail] = useState('organizer@demo.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Event Management Platform</h1>
        <p>Sign in to manage events, venues, vendors, and guests.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Sign In</button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
          Demo accounts: organizer@demo.com, staff@demo.com, vendor@demo.com, guest@demo.com, venue@demo.com
          <br />Password: password123
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <Link to="/register">Create a new account</Link>
        </p>
      </div>
    </div>
  );
}
