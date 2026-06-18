import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function GuestMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api('/messages').then(setMessages).catch(console.error);
  }, []);

  const markSeen = async (id) => {
    await api(`/messages/${id}/seen`, { method: 'PATCH' });
    api('/messages').then(setMessages);
  };

  return (
    <div>
      <h1 className="page-title">Day-Of Messages</h1>
      {messages.map((m) => (
        <div key={m._id} className="card">
          <h3>{m.subject}</h3>
          <p>{m.body}</p>
          <p>Status: {m.seen ? 'Seen' : 'Not seen yet'}</p>
          {!m.seen && <button type="button" className="btn btn-sm" onClick={() => markSeen(m._id)}>Mark as Seen</button>}
        </div>
      ))}
    </div>
  );
}
