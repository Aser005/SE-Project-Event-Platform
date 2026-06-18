import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function VendorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});

  const save = async () => {
    await api('/auth/me', { method: 'PUT', body: JSON.stringify({ profile }) });
    alert('Profile updated!');
  };

  return (
    <div>
      <h1 className="page-title">Vendor Profile</h1>
      <div className="card">
        <div className="form-group"><label>Company Name</label><input value={profile.companyName || ''} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} /></div>
        <div className="form-group"><label>Supplies Offered</label><input value={profile.supplies || ''} onChange={(e) => setProfile({ ...profile, supplies: e.target.value })} /></div>
        <div className="form-group"><label>Location</label><input value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></div>
        <div className="form-group"><label>Contact</label><input value={profile.contact || ''} onChange={(e) => setProfile({ ...profile, contact: e.target.value })} /></div>
        <button type="button" className="btn" onClick={save}>Save Profile</button>
      </div>
    </div>
  );
}
