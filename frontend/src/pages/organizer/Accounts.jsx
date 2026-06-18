import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function OrganizerAccounts() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: '', speciality: '', employmentType: '' });
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'staff', speciality: 'Logistics', employmentType: 'full-time',
  });
  const [message, setMessage] = useState('');

  const load = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    api(`/auth/users?${params}`).then(setUsers).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const createUser = async () => {
    try {
      const profile = form.role === 'staff'
        ? { speciality: form.speciality, employmentType: form.employmentType }
        : form.role === 'vendor'
          ? { companyName: form.name, supplies: 'General', location: 'Cairo' }
          : {};
      await api('/auth/users', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          profile,
        }),
      });
      setMessage('Account created successfully');
      setForm({ name: '', email: '', password: '', role: 'staff', speciality: 'Logistics', employmentType: 'full-time' });
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deactivate = async (id) => {
    await api(`/auth/users/${id}/deactivate`, { method: 'PATCH' });
    load();
  };

  return (
    <div>
      <h1 className="page-title">Account Management</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h3>Create Team Member / Guest / Vendor Account</h3>
        <div className="grid grid-2">
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          {form.role === 'staff' && (
            <>
              <div className="form-group">
                <label>Speciality</label>
                <select value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })}>
                  <option>Logistics</option><option>Catering</option><option>Seating</option>
                </select>
              </div>
              <div className="form-group">
                <label>Employment Type</label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                  <option value="full-time">Full-time</option><option value="part-time">Part-time</option>
                </select>
              </div>
            </>
          )}
        </div>
        <button type="button" className="btn" onClick={createUser}>Create Account</button>
      </div>

      <div className="filters card">
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          <option value="staff">Staff</option><option value="guest">Guest</option><option value="vendor">Vendor</option>
        </select>
        <input placeholder="Speciality" value={filters.speciality} onChange={(e) => setFilters({ ...filters, speciality: e.target.value })} />
        <select value={filters.employmentType} onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}>
          <option value="">All employment types</option>
          <option value="full-time">Full-time</option><option value="part-time">Part-time</option>
        </select>
        <button type="button" className="btn btn-secondary" onClick={load}>Filter</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.active ? 'Active' : 'Deactivated'}</td>
                <td>{u.active && <button type="button" className="btn btn-sm btn-danger" onClick={() => deactivate(u._id)}>Deactivate</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
