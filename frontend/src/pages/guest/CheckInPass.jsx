import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function GuestCheckInPass() {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    api('/guests').then(setGuests).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="page-title">My Check-In Pass</h1>
      <p style={{ marginBottom: '1rem' }}>Show this QR code or code to staff at the event entrance.</p>
      {guests.map((g) => (
        <div key={g._id} className="card" style={{ textAlign: 'center' }}>
          <h3>{g.name}</h3>
          {g.checkInCode && (
            <>
              <img
                alt="Check-in QR code"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(g.checkInCode)}`}
                style={{ margin: '1rem auto' }}
              />
              <p><strong>Code:</strong> {g.checkInCode}</p>
            </>
          )}
          <p>Check-in status: <span className={`badge badge-${g.checkInStatus}`}>{g.checkInStatus?.replace('_', ' ')}</span></p>
          {g.checkInStatus === 'arrived' && <p className="alert alert-success">You are checked in. Welcome!</p>}
        </div>
      ))}
    </div>
  );
}
