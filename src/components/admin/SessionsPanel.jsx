import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';

const SessionsPanel = () => {
  const [data, setData] = useState({ upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/admin/sessions`, { withCredentials: true });
      setData(res.data || { upcoming: [], completed: [], cancelled: [] });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>Error loading sessions</div>;

  const Section = ({ title, items }) => (
    <div style={{ marginTop: 12 }}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <div>None</div>
      ) : (
        <ul>
          {items.map((s, i) => (
            <li key={s.id || i}>{s.title || 'Session'} — {s.time || ''}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="sessions-panel">
      <h2>Sessions</h2>
      <Section title="Upcoming" items={data.upcoming} />
      <Section title="Completed" items={data.completed} />
      <Section title="Cancelled" items={data.cancelled} />
    </div>
  );
};

export default SessionsPanel;
