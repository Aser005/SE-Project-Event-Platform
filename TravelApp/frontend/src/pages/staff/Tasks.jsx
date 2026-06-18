import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function StaffTasks() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const q = statusFilter ? `?status=${statusFilter}` : '';
    api(`/tasks${q}`).then(setTasks).catch(console.error);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    await api(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div>
      <h1 className="page-title">My Tasks</h1>
      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Task</th><th>Category</th><th>Status</th><th>Due</th><th>Update</th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id}>
                <td>{t.title}</td>
                <td>{t.category}</td>
                <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                <td>{t.dueDate}</td>
                <td>
                  {t.status !== 'done' && (
                    <button type="button" className="btn btn-sm" onClick={() => updateStatus(t._id, 'done')}>Mark Done</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
