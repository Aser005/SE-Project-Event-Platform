import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function OrganizerTasks() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [events, setEvents] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', eventId: '', category: 'Logistics', dueDate: '' });

  const load = () => {
    const q = statusFilter ? `?status=${statusFilter}` : '';
    api(`/tasks${q}`).then(setTasks).catch(console.error);
  };

  const [staffFilters, setStaffFilters] = useState({ speciality: '', employmentType: '' });

  const loadStaff = () => {
    const params = new URLSearchParams({ role: 'staff', ...Object.fromEntries(Object.entries(staffFilters).filter(([, v]) => v)) });
    api(`/auth/users?${params}`).then(setStaff).catch(console.error);
  };

  useEffect(() => {
    load();
    loadStaff();
    api('/events').then(setEvents).catch(console.error);
  }, [statusFilter]);

  const assignTask = async (taskId, assignedTo) => {
    await api(`/tasks/${taskId}/assign`, { method: 'PATCH', body: JSON.stringify({ assignedTo }) });
    load();
  };

  const createTask = async () => {
    await api('/tasks', { method: 'POST', body: JSON.stringify(newTask) });
    setNewTask({ title: '', eventId: '', category: 'Logistics', dueDate: '' });
    load();
  };

  return (
    <div>
      <h1 className="page-title">Tasks & Staff</h1>

      <div className="card">
        <h3>Staff Members</h3>
        <div className="filters" style={{ marginBottom: '0.75rem' }}>
          <input placeholder="Speciality" value={staffFilters.speciality} onChange={(e) => setStaffFilters({ ...staffFilters, speciality: e.target.value })} />
          <select value={staffFilters.employmentType} onChange={(e) => setStaffFilters({ ...staffFilters, employmentType: e.target.value })}>
            <option value="">All types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
          </select>
          <button type="button" className="btn btn-sm btn-secondary" onClick={loadStaff}>Filter Staff</button>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Speciality</th><th>Type</th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.profile?.speciality}</td>
                <td>{s.profile?.employmentType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="card">
        <h3>Tasks</h3>
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Due</th><th>Assign</th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id}>
                <td>{t.title}</td>
                <td>{t.category}</td>
                <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                <td>{t.dueDate}</td>
                <td>
                  {!t.assignedTo && (
                    <select onChange={(e) => e.target.value && assignTask(t._id, e.target.value)} defaultValue="">
                      <option value="">Assign to...</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Create Task</h3>
        <div className="form-group">
          <label>Title</label>
          <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Event</label>
          <select value={newTask.eventId} onChange={(e) => setNewTask({ ...newTask, eventId: e.target.value })}>
            <option value="">Select event</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
        </div>
        <button type="button" className="btn" onClick={createTask}>Create Task</button>
      </div>
    </div>
  );
}
