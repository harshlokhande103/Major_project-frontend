import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentsPanel = () => {
  const [data, setData] = useState({ payments: [], subscriptions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/payments', { withCredentials: true });
      setData(res.data || { payments: [], subscriptions: [] });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div>Error loading payments</div>;

  return (
    <div className="payments-panel">
      <h2>Payments & Subscriptions</h2>
      <h3>Payments</h3>
      {data.payments.length === 0 ? <div>No payments</div> : (
        <ul>
          {data.payments.map((p, i) => (
            <li key={p.id || i}>{p.userEmail || 'User'} — {p.amount || 0} — {p.status || 'paid'}</li>
          ))}
        </ul>
      )}
      <h3>Subscriptions</h3>
      {data.subscriptions.length === 0 ? <div>No subscriptions</div> : (
        <ul>
          {data.subscriptions.map((s, i) => (
            <li key={s.id || i}>{s.userEmail || 'User'} — {s.plan || ''} — {s.status || ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentsPanel;


