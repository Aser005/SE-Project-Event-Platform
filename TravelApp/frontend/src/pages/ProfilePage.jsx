import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function ProfilePage({ title = 'My Profile' }) {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    profile: user?.profile || {},
  });
  const [message, setMessage] = useState('');

  const save = async () => {
    try {
      const updated = await api('/auth/me', { method: 'PUT', body: JSON.stringify(form) });
      setUser({ ...updated, id: updated.id || updated._id });
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const setProfileField = (key, value) => {
    setForm({ ...form, profile: { ...form.profile, [key]: value } });
  };

  return (
    <div>
      <h1 className="page-title">{title}</h1>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Email</label><input value={user?.email || ''} disabled /></div>
        {user?.role === 'venue_owner' && (
          <>
            <div className="form-group"><label>Company</label><input value={form.profile.companyName || ''} onChange={(e) => setProfileField('companyName', e.target.value)} /></div>
            <div className="form-group"><label>Phone</label><input value={form.profile.phone || ''} onChange={(e) => setProfileField('phone', e.target.value)} /></div>
          </>
        )}
        {user?.role === 'organizer' && (
          <>
            <div className="form-group"><label>Company</label><input value={form.profile.company || ''} onChange={(e) => setProfileField('company', e.target.value)} /></div>
            <div className="form-group"><label>Phone</label><input value={form.profile.phone || ''} onChange={(e) => setProfileField('phone', e.target.value)} /></div>
          </>
        )}
        <button type="button" className="btn" onClick={save}>Save Profile</button>
      </div>
    </div>
  );
}
