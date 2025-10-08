import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';

const AnalyticsPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/admin/analytics`, { withCredentials: true });
      setData(res.data || {});
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="analytics-panel">
      <h2>Analytics</h2>
      <div>Users: total {data.users?.total || 0}, blocked {data.users?.blocked || 0}</div>
      <div>Bookings: {data.bookings?.total || 0}</div>
      <div>Revenue (daily/weekly/monthly): {data.revenue?.daily || 0} / {data.revenue?.weekly || 0} / {data.revenue?.monthly || 0}</div>
    </div>
  );
};

export default AnalyticsPanel;


