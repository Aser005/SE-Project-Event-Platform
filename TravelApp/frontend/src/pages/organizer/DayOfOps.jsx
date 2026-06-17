import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

export default function DayOfOps() {
  const [dashboard, setDashboard] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [guests, setGuests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgForm, setMsgForm] = useState({ subject: '', body: '' });
  const [manualCode, setManualCode] = useState('');
  const [scanMessage, setScanMessage] = useState({ text: '', type: '' });
  const scannerRef = useRef(null);

  useEffect(() => {
    api('/events').then((evts) => {
      setEvents(evts);
      if (evts.length > 0) {
        const today = evts.find((e) => e.date === new Date().toISOString().slice(0, 10));
        setEventId(today ? today._id : evts[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (eventId) {
      loadGuestsAndMessages();
    }
  }, [eventId]);

  const loadGuestsAndMessages = () => {
    if (!eventId) return;
    api(`/guests?eventId=${eventId}`).then(setGuests).catch(console.error);
    api(`/messages?eventId=${eventId}`).then(setMessages).catch(console.error);
    api('/events/dashboard/today').then(setDashboard).catch(console.error);
  };

  useEffect(() => {
    // Initialize Scanner only if we have an event
    if (!eventId) return;

    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [eventId]);

  const onScanSuccess = async (decodedText) => {
    if (scannerRef.current) {
      scannerRef.current.pause(); // Pause to prevent multiple scans of same code
    }
    await handleCheckIn(decodedText);
    setTimeout(() => {
      if (scannerRef.current) scannerRef.current.resume();
    }, 2000);
  };

  const onScanFailure = (error) => {
    // Ignore frequent scan failures
  };

  const handleCheckIn = async (code) => {
    try {
      setScanMessage({ text: 'Processing...', type: 'info' });
      const res = await api('/guests/check-in-by-code', {
        method: 'PATCH',
        body: JSON.stringify({ code })
      });
      setScanMessage({ text: `Success: ${res.guest.name} checked in!`, type: 'success' });
      setManualCode('');
      loadGuestsAndMessages(); // Refresh dashboard stats
    } catch (e) {
      setScanMessage({ text: e.message || 'Invalid ticket code', type: 'error' });
    }
  };

  const handleFileUpload = async (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    const html5QrCode = new Html5Qrcode("file-reader");
    try {
      setScanMessage({ text: 'Scanning image...', type: 'info' });
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleCheckIn(decodedText);
    } catch (err) {
      setScanMessage({ text: 'No QR code found in the uploaded image. Please try again or enter the code manually.', type: 'error' });
    }
    e.target.value = ''; // Reset input
  };

  const sendMessages = async () => {
    const guestIds = guests.map((g) => g._id);
    await api('/messages', {
      method: 'POST',
      body: JSON.stringify({ eventId, guestIds, ...msgForm, type: 'day_of' }),
    });
    api(`/messages?eventId=${eventId}`).then(setMessages);
  };

  const sendFollowUp = async () => {
    await api('/messages/follow-up', { method: 'POST', body: JSON.stringify({ eventId }) });
    api(`/messages?eventId=${eventId}`).then(setMessages);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Day-Of Operations</h1>
        </div>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '250px' }}>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {dashboard && (
        <div className="grid grid-3 card">
          <div className="stat"><div className="stat-value">{dashboard.guestStats.total}</div><div className="stat-label">Total Guests</div></div>
          <div className="stat"><div className="stat-value">{dashboard.guestStats.arrived}</div><div className="stat-label">Arrived</div></div>
          <div className="stat"><div className="stat-value">{dashboard.guestStats.rsvpAttending}</div><div className="stat-label">RSVP Attending</div></div>
        </div>
      )}

      <div className="card">
        <h3>Send Day-Of Communication</h3>
        <div className="form-group"><input placeholder="Subject" value={msgForm.subject} onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })} /></div>
        <div className="form-group"><textarea placeholder="Message body" value={msgForm.body} onChange={(e) => setMsgForm({ ...msgForm, body: e.target.value })} /></div>
        <button type="button" className="btn" onClick={sendMessages}>Send to All Guests</button>
        <button type="button" className="btn btn-secondary" onClick={sendFollowUp} style={{ marginLeft: '0.5rem' }}>Follow-Up (Unseen Only)</button>
      </div>

      {/* QR Code Scanner Section */}
      <div className="grid grid-2">
        <div className="card">
          <h3>Ticket Scanner</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Hold the guest's QR code up to the camera.</p>
          <div id="reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Ticket Image</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>If camera fails, upload a screenshot of the QR code.</p>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>
          <div id="file-reader" style={{ display: 'none' }}></div>
        </div>

        <div className="card">
          <h3>Manual Check-In</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Or type the ticket code manually.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              placeholder="e.g. EVT-ABCD" 
              value={manualCode} 
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              style={{ flex: 1 }}
            />
            <button className="btn" onClick={() => handleCheckIn(manualCode)}>Check In</button>
          </div>
          
          {scanMessage.text && (
            <div className={`alert alert-${scanMessage.type === 'error' ? 'error' : scanMessage.type === 'success' ? 'success' : 'info'}`} style={{ marginTop: '1rem' }}>
              {scanMessage.text}
            </div>
          )}

          <h4 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Recent Check-ins</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {guests
              .filter(g => g.checkInStatus === 'arrived' && g.checkedInAt)
              .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
              .slice(0, 5)
              .map(g => (
              <li key={g._id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <strong>{g.name}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(g.checkedInAt).toLocaleTimeString()}</span>
              </li>
            ))}
            {guests.filter(g => g.checkInStatus === 'arrived').length === 0 && (
              <li style={{ color: 'var(--text-muted)' }}>No recent check-ins</li>
            )}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Message Status</h3>
        <table>
          <thead><tr><th>Subject</th><th>Seen</th><th>Follow-Up</th></tr></thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m._id}>
                <td>{m.subject}</td>
                <td>{m.seen ? 'Yes' : 'No'}</td>
                <td>{m.isFollowUp ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
