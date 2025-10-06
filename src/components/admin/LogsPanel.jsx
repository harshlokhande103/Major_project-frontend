import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LogsPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/logs', { withCredentials: true });
      setItems(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div>Error loading logs</div>;

  return (
    <div className="logs-panel">
      <h2>Activity & Security Logs</h2>
      {items.length === 0 ? <div>No logs</div> : (
        <ul>
          {items.map((l, i) => (
            <li key={i}>{l.type || 'event'} — {new Date(l.at || Date.now()).toLocaleString()} — {l.by || ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogsPanel;


