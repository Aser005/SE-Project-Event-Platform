import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function VendorDashboard() {
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api('/vendors/requests').then(setRequests).catch(console.error);
    api('/invoices').then(setInvoices).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="page-title">Vendor Dashboard</h1>
      <div className="grid grid-2 card">
        <div className="stat"><div className="stat-value">{requests.filter((r) => r.status === 'pending').length}</div><div className="stat-label">Pending Requests</div></div>
        <div className="stat"><div className="stat-value">{invoices.filter((i) => i.status === 'pending_review').length}</div><div className="stat-label">Pending Invoices</div></div>
      </div>
    </div>
  );
}
