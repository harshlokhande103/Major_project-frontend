import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';

const SessionsPanel = () => {
  const [data, setData] = useState({ sessions: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/api/admin/sessions`, { withCredentials: true });
      setData(res.data || { sessions: [], counts: {} });
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
  if (error) return <div>Error loading sessions: {error?.message || 'Unknown error'}</div>;

  const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
  const counts = data?.counts || {};
  const filtered = statusFilter === 'all'
    ? sessions
    : sessions.filter(s => s.sessionState === statusFilter);

  return (
    <div className="sessions-panel">
      <h2>Sessions Overview</h2>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ background: '#e2e8f0', padding: '6px 10px', borderRadius: 999 }}>Total: {counts.total || 0}</span>
        <span style={{ background: '#dbeafe', padding: '6px 10px', borderRadius: 999 }}>Booked: {counts.booked || 0}</span>
        <span style={{ background: '#ecfdf5', padding: '6px 10px', borderRadius: 999 }}>Upcoming: {counts.upcoming || 0}</span>
        <span style={{ background: '#f0f9ff', padding: '6px 10px', borderRadius: 999 }}>Completed: {counts.completed || 0}</span>
        <span style={{ background: '#fef2f2', padding: '6px 10px', borderRadius: 999 }}>Cancelled: {counts.cancelled || 0}</span>
        <span style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 999 }}>Available: {counts.available || 0}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['all', 'upcoming', 'completed', 'cancelled', 'available'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              border: '1px solid #cbd5e1',
              background: statusFilter === s ? '#0f172a' : '#fff',
              color: statusFilter === s ? '#fff' : '#334155',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div>No sessions found for this filter.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980, background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#fff' }}>
                <th style={{ padding: 10, textAlign: 'left' }}>Mentor</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Mentee</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Date & Time</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Duration</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Price</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Booked?</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Session Ended</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 10 }}>
                    <div style={{ fontWeight: 600 }}>{s?.mentor?.name || '-'}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{s?.mentor?.email || ''}</div>
                  </td>
                  <td style={{ padding: 10 }}>
                    {s?.mentee ? (
                      <>
                        <div style={{ fontWeight: 600 }}>{s.mentee.name}</div>
                        <div style={{ color: '#64748b', fontSize: 12 }}>{s.mentee.email}</div>
                      </>
                    ) : (
                      <span style={{ color: '#64748b' }}>Not booked yet</span>
                    )}
                  </td>
                  <td style={{ padding: 10 }}>{s?.start ? new Date(s.start).toLocaleString() : '-'}</td>
                  <td style={{ padding: 10 }}>{s?.durationMinutes ? `${s.durationMinutes} min` : '-'}</td>
                  <td style={{ padding: 10 }}>{Number(s?.price || 0) > 0 ? `Rs ${s.price}` : 'Free'}</td>
                  <td style={{ padding: 10 }}>{s?.isBooked ? 'Yes' : 'No'}</td>
                  <td style={{ padding: 10, textTransform: 'capitalize' }}>{s?.sessionState || '-'}</td>
                  <td style={{ padding: 10 }}>
                    {s?.sessionEnded ? (
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>Yes</span>
                    ) : (
                      <span style={{ color: '#64748b' }}>No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsPanel;
